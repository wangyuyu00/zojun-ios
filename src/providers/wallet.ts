declare var Buffer: any;
declare var require: any;
import { Injectable } from '@angular/core';
import { Storage } from "@ionic/storage";
import Chain3 from 'chain3';
import MoacUtils from 'moacjs-util';

import hdkey from "moacjs-wallet/hdkey";

let bip39 = require("bip39");// import tokens from '../tokens';
import { HttpClient } from "@angular/common/http";


let jcc_hosts = [
	"https://moac1ma17f1.jccdex.cn",
	"https://moac23f2151.jccdex.cn",
	"https://moac3e90bd5.jccdex.cn",
	"https://moac4dad565.jccdex.cn",
	"https://moac5fd8dfd.jccdex.cn",
	"https://moac6a06516.jccdex.cn",
	"https://moac77caffe.jccdex.cn",
	"https://moac838b97e.jccdex.cn",
	"https://moac90e7976.jccdex.cn",
	"https://moac10e24263.jccdex.cn"
];

// const rpcUrl = "http://m.halobtc.com:8546";
// let rpcUrl = "http://106.14.225.49:8545";
// const rpcUrl = "http://gateway.moac.io/mainnet";
// const rpcUrl = "http://106.14.225.49:8545";
let host_index = Number((Math.random() * 10).toFixed(0)) % 10;
let rpcUrl = jcc_hosts[host_index];
// let rpcUrl = jcc_hosts[9];

var cfg721 = {
	'0x39f206182f6cbc6fd0d80d159e1fadea32e14722': require('../tokens/721/0x39f206182f6cbc6fd0d80d159e1fadea32e14722'),
	'0xc89d49950bcf72d58cc203538e4e11d77daf8381': require('../tokens/721/0xc89d49950bcf72d58cc203538e4e11d77daf8381')
};

@Injectable()
export class WalletProvider {
	private filters: object;
	public chain3: Chain3;
	public tokens: any = {};

	constructor(
		private storage: Storage,
		private http: HttpClient
	) {
		this.filters = {};
		this.getTokens();
		// this.storage.get('network').then(net => {
		// 	try {
		// 		this.chain3 = new Chain3(new Chain3.providers.HttpProvider(net));
		// 		this.chain3.mc.getBalance('0x0be706d513fd4e42e6ba9a3cc6da3cf898df116b');
		// 	} catch (e) {
		// alert(e.message);
		this.chain3 = new Chain3(new Chain3.providers.HttpProvider(rpcUrl));
		// }
		// alert('use network ' + this.chain3.currentProvider.host)
		// });	
	}
	ionViewWillEnter() {
		this.getTokens();
		// this.storage.get('network').then((net)=>{
		// 	if(net){
		// 		rpcUrl = net;
		// 		chain3 = new Chain3(new Chain3.providers.HttpProvider(rpcUrl));
		// 		networkid = chain3.version.network;
		// 	}
		// })
	}
	getInstance() {
		this.chain3;
	}
	async mc(abi) {
		return this.chain3.mc.contract(abi);
	}
	getTokens() {
		this.http
			.get("https://mobao.coinpany.cn/api/tokens", {})
			.subscribe(
				data => {
					let res = JSON.stringify(data);
					let res1 = JSON.parse(res);
					this.tokens = res1;
					return res1;
				}
			);
	}
	// 订阅address消息
	async subscribe(address, callback) {
		let filter = this.chain3.mc.filter({ address: address });
		if (this.filters[address]) {
			this.filters[address].stopWatching();
			this.filters[address] = filter;
		}
		filter.watch(callback);
	}

	async unsubscribe(address) {
		if (!this.isValidAddress(address)) return;
		let filter = this.filters[address];
		if (filter) {
			filter.stopWatching();
			delete this.filters[address];
		}
	}

	// 查询token的配置信息
	async getTokenInfo(assetCode) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (this.tokens.ERC20[assetCode]) return this.tokens.ERC20[assetCode];
		let storage_tokens = await this.storage.get('tokens');
		if (storage_tokens.ERC20[assetCode]) return storage_tokens.ERC20[assetCode];
		return null;
	}

	// 查询collection的配置信息
	async getCollectionInfo(assetCode) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (this.tokens.ERC721[assetCode]) return this.tokens.ERC721[assetCode];
		let storage_tokens = await this.storage.get('tokens');
		if (storage_tokens.ERC721[assetCode]) return storage_tokens.ERC721[assetCode];
		return null;
	}

	// 获得MOAC余额
	async getMoacBalance(address) {
		if (!this.isValidAddress(address)) {
			return [{
				code: 'MOAC',
				value: 0
			}];
		}
		let balaces = [];
		let mcBalance = await this.chain3.mc.getBalance(address);
		balaces.push({
			code: 'MOAC',
			value: this.chain3.fromSha(mcBalance, 'mc').toNumber()
		});
		return balaces;
	}

	// 获得ERC20代币的余额，assetCodes是ERC20代币简称数组
	async getTokenBalances(address, assetCodes = []) {
		let balances = [];
		if (!this.isValidAddress(address)) return balances;
		for (const tokenCode of assetCodes) {
			let tokenBalance = await this.getTokenBalance(address, tokenCode);
			if (tokenBalance) {
				balances.push(tokenBalance);
			}
		}
		return balances;
	}

	// 获得合约地址address的ERC20代币tokenCode的余额
	// 内部函数
	async getTokenBalance(address, tokenCode) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (!this.isValidAddress(address)) return null;

		let config = await this.getTokenInfo(tokenCode);
		if (!config)
			return null;
		let Contract = this.chain3.mc.contract(this.tokens.ERC20_ABI);
		let contract = Contract.at(config.address);
		// console.log('报错位置');
		let tokenBalance = await contract.balanceOf.call(address);
		return {
			value: tokenBalance.toNumber() / Math.pow(10, config.decimals),
			code: tokenCode,
			issuer: config.address
		};
	}

	// 获得MOAC和ERC20代币的余额
	async getMoacAndTokenBalances(address, assetCodes = []) {
		let balances = [];
		if (!this.isValidAddress(address)) return balances;
		let moacBalance = await this.getMoacBalance(address);
		balances = balances.concat(moacBalance);
		let tokenBalances = await this.getTokenBalances(address, assetCodes);
		balances = balances.concat(tokenBalances);
		return balances;
	}

	// 获得ERC721收藏品的余额
	async getCollectionBalances(address, assetCodes = []) {
		let balances = [];
		if (!this.isValidAddress(address)) return balances;
		for (const tokenCode of assetCodes) {
			let tokenBalance = await this.getCollectionBalance(address, tokenCode);
			if (tokenBalance) {
				balances.push(tokenBalance);
			}
		}
		return balances;
	}

	// 获得用户的单个收藏品的余额
	async getCollectionBalance(address, tokenCode) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (!this.isValidAddress(address)) return null;

		let config = await this.getCollectionInfo(tokenCode);
		if (!config)
			return null;
		let Contract = this.chain3.mc.contract(this.tokens.ERC721_ABI);
		let contract = Contract.at(config.address);
		let tokenBalance = await contract.balanceOf.call(address);
		return {
			value: tokenBalance.toNumber(),
			code: tokenCode,
			issuer: config.address
		};
	}

	// 获得建议手续费gas
	async estimateGas(data) {
		let gas = null;
		if (!data) {
			gas = await this.chain3.mc.estimateGas({ data: "0x" });
		} else {
			gas = await this.chain3.mc.estimateGas({ data: "0x" + data });
		}
		return gas;
	}
	toNumber(hash) { //根据hash  返回交易记录的value
		var tx = this.chain3.mc.getTransaction(hash);
		console.log(tx)
		var value = tx.value.toNumber() / 1000000000000000000;
		console.log(value);
		return value
	}
	// 获得gas系统提示价格
	gasPrice() {
		return this.chain3.mc.gasPrice.toNumber();
	}
	// 转化成约等于多少MOAC
	gasPriceToMoac(value) {
		return this.chain3.fromSha(value, 'mc');
	}

	// 判断是否是合约地址
	async isContract(address) {
		if (!this.isValidAddress(address)) return false;

		let code = await this.chain3.mc.getCode(address);
		if (code === '0x') return false;
		else return true;
	}

	// 获得合约信息，用户在用户添加自定义合约时
	// 输入合约地址之后的查询
	async contractInfo(address) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (!this.isValidAddress(address)) return {}

		let Contract = this.chain3.mc.contract(this.tokens.ERC20_ABI);
		let contract = Contract.at(address);

		let name = await contract.name.call();
		let symbol = await contract.symbol.call();
		let decimals = await contract.decimals.call().toNumber();
		return { symbol, name, decimals };
	}

	// 判断钱包地址是否有效
	isValidAddress(address) {
		if (!address) return false;
		return MoacUtils.isValidAddress(address) || MoacUtils.isValidChecksumAddress(address);
	}

	isValidPrivate(privateKey) {
		if (!privateKey || typeof (privateKey) !== 'string') return false;
		let key = privateKey.trim();
		if (key.startsWith("0x")) key = key.substring(2);
		return MoacUtils.isValidPrivate(Buffer.from(key, 'hex'));
	}

	// 创建账号
	createAccount() {
		let mnemonic = bip39.generateMnemonic(128, null);
		let seed = bip39.mnemonicToSeed(mnemonic);
		let hdWallet = hdkey.fromMasterSeed(seed);
		let key = hdWallet.derivePath("m/44'/60'/0'/0");
		let address = MoacUtils.pubToAddress(key._hdkey._publicKey, true);
		address = MoacUtils.toChecksumAddress(address.toString("hex"));
		let secret = key._hdkey._privateKey.toString("hex");
		return { secret, address, mnemonic };
	}

	// 导入账号，使用私钥
	// 私钥没有前置0x
	// type 1私钥  2 是助记词
	importAccount(secret, type) {
		if (type == 1) {
			let key = secret.trim();
			if (key.startsWith("0x")) key = key.substring(2);
			console.log(key);
			const privateKey = Buffer.from(key, "hex");
			const account = MoacUtils.privateToAddress(privateKey).toString("hex");
			const address = "0x" + account.toString("hex");
			return { secret: key, address, mnemonic: "" };
		} else {
			let flag = bip39.validateMnemonic(secret);
			if (flag) {
				let seed = bip39.mnemonicToSeed(secret);
				let hdWallet = hdkey.fromMasterSeed(seed);
				let key = hdWallet.derivePath("m/44'/60'/0'/0");
				let address = MoacUtils.pubToAddress(key._hdkey._publicKey, true);
				address = MoacUtils.toChecksumAddress(address.toString("hex"));
				let secret1 = key._hdkey._privateKey.toString("hex");
				return { secret: secret1, address, mnemonic: secret };
			} else {
				return "Invalid mnemonic";
			}

		}
	}

	// 获得交易的确认次数
	async getConfirmations(txHash) {
		const trx = await this.chain3.mc.getTransaction(txHash);
		if (!trx) {
			return -1;
		}
		const currentBlock = await this.chain3.mc.getBlockNumber();
		return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber;
	}

	/**
	 * option: {assetCode, gasPrice, gasLimit, erc721, tokenId}
	 *
	 *
	 */
	// 转账支付
	// 如果是MOAC转账，只需要这只assetCode(MOAC)、gasPrice, gasLimit即可
	// 如果是ERC20转账，需要设置assetCode、gasPrice、gasLimit
	// 如果是ERC721转账，需要设置assetCode, gasPrice, gasLimit, erc721(true), 
	// 以及tokenId
	async sendTransaction(fromSecret, to, amount, option) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		let secretObj = `0x${fromSecret}`;
		const account = MoacUtils.privateToAddress(Buffer.from(fromSecret, 'hex')).toString('hex');
		const from = '0x' + account.toString('hex');
		const gasPrice = option.gasPrice || await this.chain3.mc.getGasPrice();
		const gasLimit = option.gasLimit || 21000;
		const nonce = await this.chain3.mc.getTransactionCount(from);

		let amountValue, toAddress, data;
		if (option.assetCode && option.assetCode !== 'MOAC') {
			let config, abi;
			if (option.erc721 === true) {
				config = await this.getCollectionInfo(option.assetCode);
				abi = this.tokens.ERC721_ABI;
			}
			else {
				config = await this.getTokenInfo(option.assetCode);
				abi = this.tokens.ERC20_ABI;
			}

			let Contract = this.chain3.mc.contract(abi);
			let contract = Contract.at(config.address);

			toAddress = config.address;
			amountValue = '0';
			if (option.erc721 === true) {
				data = contract.transfer.getData(to, option.tokenId);
			} else {
				let a = Number(amount) * Math.pow(10, config.decimals);
				data = contract.transfer.getData(to, a);
			}
		} else {
			amountValue = this.chain3.toSha(amount, 'mc');
			toAddress = to;
			data = '0x00';
		}

		const rawTransaction = {
			from: from,
			nonce: this.chain3.intToHex(nonce),
			gasPrice: this.chain3.intToHex(gasPrice),
			gasLimit: this.chain3.intToHex(gasLimit),
			to: toAddress,
			value: this.chain3.intToHex(amountValue),
			shardingFlag: 0,
			data: data,
			chainId: this.chain3.version.network
		};

		let serializedTx = this.chain3.signTransaction(rawTransaction, secretObj);
		// return await this.chain3.mc.sendRawTransaction(serializedTx);
		try {
			return await this.chain3.mc.sendRawTransaction(serializedTx);
		} catch (e) {
			var err = e + "";
			return err;
		}
	}
	/*async sendTransactionTo(object, secret) {
		
		object.gasPrice = object.gasPrice || this.chain3.intToHex(this.chain3.mc.gasPrice.toNumber());
		var limit = await this.chain3.mc.estimateGas({from:object.from,data:object.data});
		object.gasLimit = object.gasLimit || this.chain3.intToHex(limit);
		var nonce = await this.chain3.mc.getTransactionCount(object.from);
		object.nonce = object.nonce || this.chain3.intToHex(nonce);
		object.chainId = object.chainId || this.chain3.version.network;
		var hash = this.chain3.signTransaction(object, '0x' + secret);
		console.log('hash',hash)
		var result = null;
		try {
			result = await this.chain3.mc.sendRawTransaction(hash);
			return this.jsonResult(result);
		} catch (e) {
			var err = e + "";
			var serr = err.substr(0, 24);
			if (serr == 'Error: known transaction' || serr == 'Error: nonce too low') {
				var nonce = nonce + 1;
				object.nonce = this.chain3.intToHex(nonce);
				await this.sendTransactionTo(object, secret);
			}else{
				return err;
			}
		}
	}*/

	tovalue(amount) {
		var amountValue = this.chain3.toSha(amount, 'mc');
		return this.chain3.intToHex(amountValue);
	}

	fromvalue(amount) {
		var v = this.chain3.fromSha(amount, 'mc');
		return v;
	}

	intToHex(str) {
		return this.chain3.intToHex(str);
	}

	chainId() {
		return this.chain3.version.network;
	}

	// 查询assetCode收藏品中tokenId的所有权
	async collecionOwnerOf(assetCode, tokenId) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		let config = await this.getCollectionInfo(assetCode);
		if (!config)
			return null;
		let Contract = this.chain3.mc.contract(this.tokens.ERC721_ABI);
		let contract = Contract.at(config.address);
		return await contract.ownerOf.call(tokenId);
	}

	// 获得某个用户的在一个收藏品合约中的所有TokenId
	async ownerCollections(assetCode, address) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		if (!this.isValidAddress(address)) return null;

		let config = await this.getCollectionInfo(assetCode);
		if (!config)
			return null;
		let Contract = this.chain3.mc.contract(this.tokens.ERC721_ABI);
		let contract = Contract.at(config.address);

		// get balances
		let collBalance = await contract.balanceOf.call(address).toNumber();
		// moac erc721 iterator method
		let __collections = await contract.tokensOfOwner.call(address);
		var collections = [];
		if (__collections.length === collBalance) {
			for (let i = 0; i < __collections.length; ++i) {
				collections.push(__collections[i].toNumber());
			}
			return collections;
		}
		// standard erc721 iterator method
		for (let j = 0; j < collBalance; ++j) {
			let tokenId = await contract.tokenOfOwnerByIndex.call(address, j).toNumber();
			collections.push(tokenId);
		}
		return collections;
	}

	// 获得合约收藏品中的详细信息，这个不一定每个合约都有
	async tokenMetadata(assetCode, tokenId) {
		// var tokens:any;
		// tokens = this.getTokens();
		//var tokens = this.tokens;
		let config = await this.getCollectionInfo(assetCode);
		if (!config)
			return null;
		let Contract = this.chain3.mc.contract(this.tokens.ERC721_ABI);
		let contract = Contract.at(config.address);
		let metadata = await contract.tokenMetadata.call(tokenId);
		return metadata;
	}

	// 获取收藏品定制消息
	// async tokenInfo(assetCode, tokenId) {
	// 	let config = await this.getCollectionInfo(assetCode);
	// 	if (!config) return null;
	// 	var token = cfg721[config.address];
	// 	if (!token) {
	// 		return null
	// 	} else {
	// 		return await token.data(this.chain3, tokenId);
	// 	}
	// }
	// 获取收藏品定制消息
	async tokenInfo(assetCode, tokenId) {
		let config = await this.getCollectionInfo(assetCode);
		if (!config) return null;
		let Contract = this.chain3.mc.contract(config.abi);
		let contract = Contract.at(config.address);
		//遍历对象
		let attributes = {};
		if (config.attributes) {
			Object.keys(config.attributes).forEach(async function (key) {
				let fun = config.attributes[key];
				attributes[key] = await contract[fun].call(tokenId);
				console.log("attributes", attributes)
			});
			attributes['0合约'] = config.address;
			return {
				name: contract.getTitle ? await contract.getTitle.call(tokenId) : '',
				attributes: attributes
			}
		} else {
			return null
		}
	}

	toSha(amount) {
		return this.chain3.toSha(amount, 'mc');
	}

	// ----------------- mobao dapp interface implements -----------------
	//格式化返回结果
	jsonResult(result) {
		return {
			"jsonrpc": "2.0",
			"id": 101,
			"result": result
		};
	}

	async chain3_clientVersion(params) {
		var result = this.chain3.version.node;
		return this.jsonResult(result);
	}
	async chain3_sha3(params) {
		var result = this.chain3.sha3(params[0]);
		return this.jsonResult(result);
	}
	async net_listening(params) {
		var result = this.chain3.net.listening;
		return this.jsonResult(result);
	}
	async net_peerCount(params) {
		var result = this.chain3.net.peerCount;
		return this.jsonResult(result);
	}
	async net_version(params) {
		var result = this.chain3.version.network;
		return this.jsonResult(result);
	}
	async mc_getBalance(params) {
		let mcBalance = await this.chain3.mc.getBalance(params[0]);
		var result = this.chain3.fromSha(mcBalance, 'mc').toNumber();
		return this.jsonResult(result);
	}
	async mc_accounts(params) {
		// read from storage not this.chain3 personal
		var result = await this.storage.get('pockets');
		return this.jsonResult(result);
	}
	async mc_blockNumber(params) {
		var result = this.chain3.mc.blockNumber;
		return this.jsonResult(result);
	}
	async mc_call(params) {
		var result = await this.chain3.mc.call(params[0]);
		return this.jsonResult(result);
	}
	async mc_coinbase(params) {
		var result = this.chain3.mc.coinbase;
		return this.jsonResult(result);
	}
	async mc_estimateGas(params) {
		var result = await this.chain3.mc.estimateGas(params[0]);
		return this.jsonResult(result);
	}
	async mc_gasPrice(params) {
		var result = this.chain3.mc.gasPrice;
		return this.jsonResult(result);
	}
	async mc_getBlockByHash(params) {
		var result = await this.chain3.mc.getBlock(params[0]);
		return this.jsonResult(result);
	}
	async mc_getBlockByNumber(params) {
		var result = await this.chain3.mc.getBlock(params[0]);
		return this.jsonResult(result);
	}
	async mc_getBlockTransactionCountByHash(params) {
		var result = await this.chain3.mc.getBlockTransactionCount(params[0]);
		return this.jsonResult(result);
	}
	async mc_getBlockTransactionCountByNumber(params) {
		var result = await this.chain3.mc.getBlockTransactionCount(params[0]);
		return this.jsonResult(result);
	}
	async mc_getCode(params) {
		var result = await this.chain3.mc.getCode(params[0]);
		return this.jsonResult(result);
	}
	async mc_getStorageAt(params) {
		var result = this.chain3.mc.getStorageAt(params[0], params[1]);
		return this.jsonResult(result);
	}
	async mc_getTransactionByBlockHashAndIndex(params) {
		var result = this.chain3.mc.getTransactionFromBlock(params[0], params[1]);
		return this.jsonResult(result);
	}
	async mc_getTransactionByBlockNumberAndIndex(params) {
		var result = this.chain3.mc.getTransactionFromBlock(params[0], params[1]);
		return this.jsonResult(result);
	}
	async mc_getTransactionByHash(params) {
		var result = this.chain3.mc.getTransaction(params[0]);
		return this.jsonResult(result);
	}
	async mc_getTransactionCount(params) {
		var result = this.chain3.mc.getTransactionCount(params[0]);
		return this.jsonResult(result);
	}
	async mc_getTransactionReceipt(params) {
		var result = this.chain3.mc.getTransactionReceipt(params[0]);
		return this.jsonResult(result);
	}
	async mc_getUncleByBlockHashAndIndex(params) {
		var result = this.chain3.mc.getUncle(params[0], params[1]);
		return this.jsonResult(result);
	}
	async mc_getUncleByBlockNumberAndIndex(params) {
		var result = this.chain3.mc.getUncle(params[0], params[1]);
		return this.jsonResult(result);
	}
	async mc_getUncleCountByBlockHash(params) {
		var result = this.chain3.mc.getUncle(params[0]);
		return this.jsonResult(result);
	}
	async mc_getUncleCountByBlockNumber(params) {
		var result = this.chain3.mc.getUncle(params[0]);
		return this.jsonResult(result);
	}
	async mc_hashrate(params) {
		var result = this.chain3.mc.hashrate;
		return this.jsonResult(result);
	}
	async mc_mining(params) {
		var result = this.chain3.mc.mining;
		return this.jsonResult(result);
	}
	async mc_protocolVersion(params) {
		var result = this.chain3.version.moac;
		return this.jsonResult(result);
	}
	async mc_sendRawTransaction(params) {
		var result = this.chain3.mc.sendRawTransaction(params[0]);
		return this.jsonResult(result);
	}
	async mc_syncing(params) {
		var result = this.chain3.mc.syncing;
		return this.jsonResult(result);
	}

	//创建，签署并向网络发送新事务,转账       
	async mc_sendTransaction(object, secret) {
		console.log('签名参数', object)
		console.log('签名参数', secret)

		object.gasPrice = object.gasPrice || this.chain3.intToHex(this.chain3.mc.gasPrice.toNumber());
		var limit = await this.chain3.mc.estimateGas({ from: object.from, data: object.data });
		object.gasLimit = object.gasLimit || this.chain3.intToHex(limit);
		var nonce = await this.chain3.mc.getTransactionCount(object.from);
		object.nonce = this.chain3.intToHex(nonce);
		object.chainId = object.chainId || this.chain3.version.network;
		var hash = this.chain3.signTransaction(object, '0x' + secret);
		console.log('hash', hash)
		var result = null;
		try {
			result = await this.chain3.mc.sendRawTransaction(hash);
			return this.jsonResult(result);
		} catch (e) {
			var err = e + "";
			return this.jsonResult(err);
		}
	}

	async mc_sign(params) {
	}
	/*子链相关方法*/
	//子链交易结果
	async getReceiptByHash(hash, subchainAddr, rpc) {
		let request = require("request");
		return new Promise((resolve, reject) => {
			let body = {
				jsonrpc: "2.0",
				id: 0,
				method: "ScsRPCMethod.GetReceiptByHash",
				params: {
					Hash: hash,
					SubChainAddr: subchainAddr
				}
			};
			let option = {
				url: rpc,
				method: "POST",
				json: true,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: body
			};
			request(option, async function (error, response, data) {
				if (!error && response.statusCode == 200) {
					let res = JSON.stringify(data);
					let res1 = JSON.parse(res);
					resolve(res1);
				}
			});
		});
	}
	/**
	 * 子链充币记录
	 * @param sender 钱包地址
	 * @param subchainAddr 子链合约地址
	 * @param page 页数1开始
	 * @param rpc 请求地址
	 */
	async getExchangeEnter(sender, subchainAddr, page, rpc) {
		let request = require("request");
		let start = (Number(page) - 1) * 10;
		try {
			return new Promise((resolve, reject) => {
				let body = {
					jsonrpc: "2.0",
					id: 0,
					method: "ScsRPCMethod.GetExchangeByAddress",
					params: {
						SubChainAddr: subchainAddr,
						Sender: sender,
						EnterRecordIndex: start,
						EnterRecordSize: 10,
						RedeemRecordIndex: 0,
						RedeemRecordSize: 0,
						EnteringRecordIndex: start,
						EnteringRecordSize: 10,
						RedeemingRecordIndex: 0,
						RedeemingRecordSize: 0
					}
				};
				let option = {
					url: rpc,
					method: "POST",
					json: true,
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
					},
					body: body
				};
				request(option, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						resolve(body);
					}
				});
			});
		} catch (e) {
			//console.log(e);
			return e;
		}
	}
	/**
	 * 子链提币记录
	 * @param sender 钱包地址
	 * @param subchainAddr 子链合约地址
	 * @param page 页数1开始
	 * @param rpc 请求地址
	 */
	async getExchangeRedeem(sender, subchainAddr, page, rpc) {
		let request = require("request");
		let start = (Number(page) - 1) * 10;
		try {
			return new Promise((resolve, reject) => {
				let body = {
					jsonrpc: "2.0",
					id: 0,
					method: "ScsRPCMethod.GetExchangeByAddress",
					params: {
						SubChainAddr: subchainAddr,
						Sender: sender,
						EnterRecordIndex: 0,
						EnterRecordSize: 0,
						RedeemRecordIndex: start,
						RedeemRecordSize: 10,
						EnteringRecordIndex: 0,
						EnteringRecordSize: 0,
						RedeemingRecordIndex: start,
						RedeemingRecordSize: 10
					}
				};
				let option = {
					url: rpc,
					method: "POST",
					json: true,
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
					},
					body: body
				};
				request(option, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						resolve(body);
					}
				});
			});
		} catch (e) {
			//console.log(e);
			return e;
		}
	}
	/**
	 * 子链提币中金额总数
	 * @param sender 钱包地址
	 * @param subchainAddr 子链合约地址
	 * @param rpc 请求地址
	 */
	async getExchangeRedeeming(sender, subchainAddr, rpc) {
		let request = require("request");
		try {
			return new Promise((resolve, reject) => {
				let body = {
					jsonrpc: "2.0",
					id: 0,
					method: "ScsRPCMethod.GetExchangeByAddress",
					params: {
						SubChainAddr: subchainAddr,
						Sender: sender,
						EnterRecordIndex: 0,
						EnterRecordSize: 0,
						RedeemRecordIndex: 0,
						RedeemRecordSize: 0,
						EnteringRecordIndex: 0,
						EnteringRecordSize: 0,
						RedeemingRecordIndex: 0,
						RedeemingRecordSize: 1000
					}
				};
				let option = {
					url: rpc,
					method: "POST",
					json: true,
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
					},
					body: body
				};
				request(option, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						if (body.result.RedeemingRecordCount > 0) {
							var value = 0;
							body.result.RedeemingRecords.forEach(resv => {
								value += resv.RedeemingAmt
							});
							resolve({
								code: 1,
								value: value
							})
						} else {
							resolve({
								code: 1,
								value: 0
							})
						}
					}
				});
			});
		} catch (e) {
			//console.log(e);
			return {
				code: 0,
				err: e
			};
		}
	}
	/**
	 * 子链余额
	 * @param address 查询钱包地址
	 * @param subchainAddr 子链地址
	 * @param rpc rpc接口地址
	 */
	async getSubChainBalance(address, subchainAddr, rpc) {
		let request = require("request");
		try {
			return new Promise((resolve, reject) => {
				let body = {
					jsonrpc: "2.0",
					id: 0,
					method: "ScsRPCMethod.GetBalance",
					params: {
						SubChainAddr: subchainAddr,
						Sender: address
					}
				};
				let option = {
					url: rpc,
					method: "POST",
					json: true,
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
					},
					body: body
				};
				request(option, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						resolve(body);
					}
				});
			});
		} catch (e) {
			//console.log(e);
			return e;
		}
	}
	/**
	 * 子链信息
	 * @param subchainAddr 子链地址
	 * @param rpc rpc接口地址
	 */
	async getSubChainInfo(subchainAddr, rpc) {
		let request = require("request");
		try {
			return new Promise((resolve, reject) => {
				let body = {
					jsonrpc: "2.0",
					id: 0,
					method: "ScsRPCMethod.GetSubChainInfo",
					params: {
						SubChainAddr: subchainAddr
					}
				};
				let option = {
					url: rpc,
					method: "POST",
					json: true,
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json"
					},
					body: body
				};
				request(option, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						resolve(body);
					}
				});
			});
		} catch (e) {
			//console.log(e);
			return e;
		}
	}

	/**
	 * 子链转账
	 * @param amount 数量
	 * @param passwd 密码
	 * @param address 发起地址
	 * @param toAddr 接收地址
	 * @param subchainAddr 子链地址
	 * @param rpc rpc接口地址
	 */
	async SubChainSend(fromSecret, toAddr, amount, subchainAddr, rpc) {
		this.chain3 = new Chain3(
			new Chain3.providers.HttpProvider("http://39.98.62.240:8545")
		);


		let request = require("request");
		let that = this;
		let secretObj = `0x${fromSecret}`;
		const account = MoacUtils.privateToAddress(
			Buffer.from(fromSecret, "hex")
		).toString("hex");
		const from = "0x" + account.toString("hex");
		const gasPrice = await this.chain3.mc.gasPrice;
		const gasLimit = 9000000;
		return new Promise((resolve, reject) => {
			let body = {
				jsonrpc: "2.0",
				id: 0,
				method: "ScsRPCMethod.GetNonce",
				params: {
					Sender: account,
					SubChainAddr: subchainAddr
				}
			};
			let option = {
				url: rpc,
				method: "POST",
				json: true,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: body
			};
			request(option, async function (error, response, data) {
				if (!error && response.statusCode == 200) {
					let res = JSON.stringify(data);
					let res1 = JSON.parse(res);
					let nonce = res1.result;
					let viaAddr = that.chain3.vnode.address;
					//let viaAddr = "0xd868337c1a4167b5c6d1e273a0044016ea044d82";
					let amountValue = that.chain3.toSha(amount, "mc");
					const rawTransaction = {
						from: from,
						nonce: that.chain3.intToHex(nonce),
						gasPrice: that.chain3.intToHex(gasPrice.toNumber()),
						gasLimit: that.chain3.intToHex(gasLimit),
						to: subchainAddr,
						value: that.chain3.intToHex(amountValue),
						shardingFlag: "0x2",
						data: toAddr, //转入账号地址
						via: viaAddr,
						chainId: that.chain3.version.network
					};

					let serializedTx = that.chain3.signTransaction(
						rawTransaction,
						secretObj
					);
					// return await chain3.mc.sendRawTransaction(serializedTx);
					try {
						let result = await that.chain3.mc.sendRawTransaction(serializedTx);
						resolve(result);
					} catch (e) {
						let err = e + "";
						resolve(null);
					}
				}
			});
		});
	}
	/**
	 * 子链提币
	 * @param amount 数量
	 * @param passwd 密码
	 * @param address 提币地址
	 * @param baseAddress dapp_base_address
	 * @param subchainAddr 子链地址
	 * @param rpc rpc接口地址
	 */
	async SubChainWith(fromSecret, amount, baseAddress, subchainAddr, rpc) {
		this.chain3 = new Chain3(
			new Chain3.providers.HttpProvider("http://39.98.62.240:8545")
		);
		let request = require("request");
		let that = this;
		let secretObj = `0x${fromSecret}`;
		const account = MoacUtils.privateToAddress(
			Buffer.from(fromSecret, "hex")
		).toString("hex");
		const from = "0x" + account.toString("hex");
		const gasPrice = await this.chain3.mc.gasPrice;
		const gasLimit = 9000000;
		return new Promise((resolve, reject) => {
			let body = {
				jsonrpc: "2.0",
				id: 0,
				method: "ScsRPCMethod.GetNonce",
				params: {
					Sender: account,
					SubChainAddr: subchainAddr
				}
			};
			let option = {
				url: rpc,
				method: "POST",
				json: true,
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json"
				},
				body: body
			};
			request(option, async function (error, response, data) {
				if (!error && response.statusCode == 200) {
					let res = JSON.stringify(data);
					let res1 = JSON.parse(res);
					let nonce = res1.result;
					let viaAddr = that.chain3.vnode.address;
					//let viaAddr = "0xd868337c1a4167b5c6d1e273a0044016ea044d82";
					let datas = baseAddress + "89739c5b"; //业务逻辑合约地址+功能函数

					let amountValue = that.chain3.toSha(amount, "mc");
					const rawTransaction = {
						from: from,
						nonce: that.chain3.intToHex(nonce),
						gasPrice: that.chain3.intToHex(gasPrice.toNumber()),
						gasLimit: that.chain3.intToHex(gasLimit),
						to: subchainAddr,
						value: that.chain3.intToHex(amountValue),
						shardingFlag: "0x1",
						data: datas,
						via: viaAddr,
						chainId: that.chain3.version.network
					};

					let serializedTx = that.chain3.signTransaction(
						rawTransaction,
						secretObj
					);
					// return await chain3.mc.sendRawTransaction(serializedTx);
					try {
						let result = await that.chain3.mc.sendRawTransaction(serializedTx);
						resolve(result);
					} catch (e) {
						let err = e + "";
						resolve(null);
					}
				}
			});
		});
	}
	//充值0-授权余额
	async allowance(from, ercAddr, subchainAddr) {
		/*let Chain3 = require("chain3");
		let chain3 = new Chain3(
		  new Chain3.providers.HttpProvider("http://120.78.146.107:8989")
			);*/

		let erc20ABI =
			'[ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string", "value": "KaBa New Energy" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256", "value": "2e+25" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8", "value": "18" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x19dcff83384184a779a7abb2a9b4645af3e6e646" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string", "value": "CKM_N" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "initialAmount", "type": "uint256", "index": 0, "typeShort": "uint", "bits": "256", "displayName": "initial Amount", "template": "elements_input_uint", "value": "20000000" }, { "name": "tokenName", "type": "string", "index": 1, "typeShort": "string", "bits": "", "displayName": "token Name", "template": "elements_input_string", "value": "KaBa New Energy" }, { "name": "decimalUnits", "type": "uint8", "index": 2, "typeShort": "uint", "bits": "8", "displayName": "decimal Units", "template": "elements_input_uint", "value": "18" }, { "name": "tokenSymbol", "type": "string", "index": 3, "typeShort": "string", "bits": "", "displayName": "token Symbol", "template": "elements_input_string", "value": "CKM_N" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]';

		let erc20Contract = this.chain3.mc.contract(JSON.parse(erc20ABI));
		let erc20Instance = erc20Contract.at(ercAddr);
		let value = erc20Instance.allowance(from, subchainAddr).toNumber();
		let decimals = await erc20Instance.decimals.call().toNumber();
		let amounts = value / Math.pow(10, decimals);
		let data = {
			balance: amounts
		};
		return data;
	}
	//充值1-授权
	async Approve_erc20(secret, ercAddr, subchainAddr, amount) {
		/*let Chain3 = require("chain3");
		let chain3 = new Chain3(
		  new Chain3.providers.HttpProvider("http://120.78.146.107:8989")
			);*/

		let secretObj = `0x${secret}`;
		const account = MoacUtils.privateToAddress(
			Buffer.from(secret, "hex")
		).toString("hex");
		const from = "0x" + account.toString("hex");
		const gasPrice = await this.chain3.mc.gasPrice;
		const gasLimit = 9000000;
		const nonce = await this.chain3.mc.getTransactionCount(from);

		let erc20ABI =
			'[ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string", "value": "KaBa New Energy" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256", "value": "2e+25" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8", "value": "18" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x19dcff83384184a779a7abb2a9b4645af3e6e646" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string", "value": "CKM_N" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "initialAmount", "type": "uint256", "index": 0, "typeShort": "uint", "bits": "256", "displayName": "initial Amount", "template": "elements_input_uint", "value": "20000000" }, { "name": "tokenName", "type": "string", "index": 1, "typeShort": "string", "bits": "", "displayName": "token Name", "template": "elements_input_string", "value": "KaBa New Energy" }, { "name": "decimalUnits", "type": "uint8", "index": 2, "typeShort": "uint", "bits": "8", "displayName": "decimal Units", "template": "elements_input_uint", "value": "18" }, { "name": "tokenSymbol", "type": "string", "index": 3, "typeShort": "string", "bits": "", "displayName": "token Symbol", "template": "elements_input_string", "value": "CKM_N" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]';

		let erc20Contract = this.chain3.mc.contract(JSON.parse(erc20ABI));
		let erc20Instance = erc20Contract.at(ercAddr);

		let decimals = await erc20Instance.decimals.call().toNumber();
		let amounts = amount * Math.pow(10, decimals);

		let data = erc20Instance.approve.getData(subchainAddr, amounts);
		let amountValue = "0";
		const rawTransaction = {
			from: from,
			nonce: this.chain3.intToHex(nonce),
			gasPrice: this.chain3.intToHex(gasPrice.toNumber()),
			gasLimit: this.chain3.intToHex(gasLimit),
			to: ercAddr,
			value: this.chain3.intToHex(amountValue),
			shardingFlag: 0,
			data: data,
			chainId: this.chain3.version.network
		};
		let serializedTx = this.chain3.signTransaction(rawTransaction, secretObj);
		try {
			return await this.chain3.mc.sendRawTransaction(serializedTx);
		} catch (e) {
			let err = e + "";
			return { result: null, err: err };
		}
	}
	//充值2-充值
	async buyMintToken(secret, ercAddr, subchainAddr, amount) {
		/*let Chain3 = require("chain3");
		let chain3 = new Chain3(
		  new Chain3.providers.HttpProvider("http://120.78.146.107:8989")
			);*/

		let secretObj = `0x${secret}`;
		const account = MoacUtils.privateToAddress(
			Buffer.from(secret, "hex")
		).toString("hex");
		const from = "0x" + account.toString("hex");
		const gasPrice = await this.chain3.mc.gasPrice;
		const gasLimit = 9000000;
		const nonce = await this.chain3.mc.getTransactionCount(from);

		let subchainABI =
			'[ { "constant": true, "inputs": [], "name": "maxMember", "outputs": [ { "name": "", "type": "uint256", "value": "11" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maxFlushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "500" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "blockReward", "outputs": [ { "name": "", "type": "uint256", "value": "499800031997442" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "per_upload_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "160" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "removeSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hashlist", "type": "bytes32[]" }, { "name": "blocknum", "type": "uint256[]" }, { "name": "distAmount", "type": "uint256[]" }, { "name": "badactors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" } ], "name": "createProposal", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "BALANCE", "outputs": [ { "name": "", "type": "uint256", "value": "2e+25" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodeList", "outputs": [ { "name": "", "type": "address", "value": "0x4d7ff13fb1c4cd4c17e4591659a7edf567f01134" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getMonitorInfo", "outputs": [ { "name": "", "type": "address[]", "value": [ "0x071e24e268ec681baa2181b266bcdf2c8b8fb632" ] }, { "name": "", "type": "string[]", "value": [ "" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeToReleaseCount", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "scsBeneficiary", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minMember", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "funcCode", "outputs": [ { "name": "", "type": "bytes", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" } ], "name": "requestReleaseImmediate", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" } ], "name": "requestRelease", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "consensusFlag", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "BackupUpToDate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "proposals", "outputs": [ { "name": "proposedBy", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "lastApproved", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "hash", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "start", "type": "uint256", "value": "0" }, { "name": "end", "type": "uint256", "value": "0" }, { "name": "flag", "type": "uint256", "value": "0" }, { "name": "startingBlock", "type": "uint256", "value": "0" }, { "name": "votecount", "type": "uint256", "value": "0" }, { "name": "viaNodeAddress", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "preRedeemNum", "type": "uint256", "value": "0" }, { "name": "distributeFlag", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerUploadRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToDispel", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getVnodeInfo", "outputs": [ { "components": [ { "name": "protocol", "type": "address" }, { "name": "members", "type": "uint256[]" }, { "name": "rewards", "type": "uint256[]" }, { "name": "proposalExpiration", "type": "uint256" }, { "name": "VnodeProtocolBaseAddr", "type": "address" }, { "name": "penaltyBond", "type": "uint256" }, { "name": "subchainstatus", "type": "uint256" }, { "name": "owner", "type": "address" }, { "name": "BALANCE", "type": "uint256" }, { "name": "redeems", "type": "uint256[]" }, { "name": "nodeList", "type": "address[]" }, { "name": "nodesToJoin", "type": "address[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "monitors", "outputs": [ { "name": "from", "type": "address", "value": "0x071e24e268ec681baa2181b266bcdf2c8b8fb632" }, { "name": "bond", "type": "uint256", "value": "1000000000000000000" }, { "name": "link", "type": "string", "value": "47.110.129.12" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "txReward", "outputs": [ { "name": "", "type": "uint256", "value": "99960006400" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCRate", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "monitor", "type": "address" }, { "name": "link", "type": "string" } ], "name": "registerAsMonitor", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCDecimals", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "scs", "type": "address" } ], "name": "getSCSRole", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" }, { "name": "redeem", "type": "bool" } ], "name": "voteOnProposal", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "nodesWatching", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "registerOpen", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "max_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "500" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "rebuildFromLastFlushPoint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "registerClose", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "currentRefundGas", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updateRechargeCycle", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeCount", "outputs": [ { "name": "", "type": "uint256", "value": "8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "id", "type": "address" }, { "name": "link", "type": "string" } ], "name": "addSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_recharge_num", "outputs": [ { "name": "", "type": "uint256", "value": "250" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "penaltyBond", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getholdingPool", "outputs": [ { "name": "", "type": "address[]", "value": [ "0x68986c1bcd54ae5dae69310fc64ea544ff1d56c4" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "protocol", "outputs": [ { "name": "", "type": "address", "value": "0x3de80fedca83bd90eea39ff379c18b335b8c66f3" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_JOIN_FEE", "outputs": [ { "name": "", "type": "uint256", "value": "10000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" } ], "name": "registerAsSCS", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" } ], "name": "registerAsBackup", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalBond", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "recharge_cycle", "outputs": [ { "name": "", "type": "uint256", "value": "6" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "addFund", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "110" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "contractNeedFund", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToJoin", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "nodePerformance", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerRechargeNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushStatus", "outputs": [ { "name": "", "type": "bool", "value": true } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "viaReward", "outputs": [ { "name": "", "type": "uint256", "value": "9996000639948803" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" }, { "name": "holdingPoolPos", "type": "uint256" } ], "name": "getEnteringAmount", "outputs": [ { "name": "enteringAddr", "type": "address[]", "value": [ "0x68986c1bcd54ae5dae69310fc64ea544ff1d56c4" ] }, { "name": "enteringAmt", "type": "uint256[]", "value": [ "50" ] }, { "name": "enteringtime", "type": "uint256[]", "value": [ "1555319095" ] }, { "name": "rechargeParam", "type": "uint256[]", "value": [ "250", "6" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" } ], "name": "getRedeemRecords", "outputs": [ { "components": [ { "name": "redeemAmount", "type": "uint256[]" }, { "name": "redeemtime", "type": "uint256[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "addr", "type": "address" }, { "name": "index1", "type": "uint8" }, { "name": "index2", "type": "uint8" } ], "name": "matchSelTarget", "outputs": [ { "name": "", "type": "bool", "value": true } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "nodeToAdd", "type": "uint256" } ], "name": "registerAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_value", "type": "uint256" } ], "name": "buyMintToken", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_DELETE_NUM", "outputs": [ { "name": "", "type": "uint256", "value": "5" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "syncNodes", "outputs": [ { "name": "nodeId", "type": "address" }, { "name": "link", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushInfo", "outputs": [ { "name": "", "type": "uint256", "value": "56" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getEstFlushBlock", "outputs": [ { "name": "", "type": "uint256", "value": "2286889" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "syncReward", "outputs": [ { "name": "", "type": "uint256", "value": "99960006400" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "checkProposalStatus", "outputs": [ { "name": "", "type": "uint256", "value": "2" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "types", "type": "uint256" } ], "name": "getProposal", "outputs": [ { "components": [ { "name": "proposedBy", "type": "address" }, { "name": "lastApproved", "type": "bytes32" }, { "name": "hash", "type": "bytes32" }, { "name": "start", "type": "uint256" }, { "name": "end", "type": "uint256" }, { "name": "distributionAmount", "type": "uint256[]" }, { "name": "flag", "type": "uint256" }, { "name": "startingBlock", "type": "uint256" }, { "name": "voters", "type": "uint256[]" }, { "name": "votecount", "type": "uint256" }, { "name": "badActors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" }, { "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" }, { "name": "minerAddr", "type": "address[]" }, { "name": "distributeFlag", "type": "uint256" }, { "name": "redeemAgreeList", "type": "address[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashInProgress", "outputs": [ { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "requestEnterAndRedeemAction", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToRelease", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "randIndex", "outputs": [ { "name": "", "type": "uint8", "value": "28" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" } ], "name": "requestProposalAction", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "addr", "type": "address" } ], "name": "isMemberValid", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntNow", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE_COUNT", "outputs": [ { "name": "", "type": "uint256", "value": "2" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "initialFlushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "40" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "selTarget", "outputs": [ { "name": "", "type": "uint256", "value": "255" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "reset", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashApprovedLast", "outputs": [ { "name": "", "type": "bytes32", "value": "0x620142feb74ca4a38791215ac310114e81a54e3d9fdd48b6d23bcbd6bb74a7df" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "NODE_INIT_PERFORMANCE", "outputs": [ { "name": "", "type": "uint256", "value": "5" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "VnodeProtocolBaseAddr", "outputs": [ { "name": "", "type": "address", "value": "0x1123816cfa818aa36b46fd4948029ca21a1b7e01" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" } ], "name": "UploadRedeemData", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "monitor", "type": "address" } ], "name": "removeMonitorInfo", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_GAS_PRICE", "outputs": [ { "name": "", "type": "uint256", "value": "20000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntMax", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dappRedeemPos", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCAddr", "outputs": [ { "name": "", "type": "address", "value": "0x7eb9624edd7171e154cda4516742be3987a5d459" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalExpiration", "outputs": [ { "name": "", "type": "uint256", "value": "24" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "DEFLATOR_VALUE", "outputs": [ { "name": "", "type": "uint256", "value": "80" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_MIN_FEE", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "recv", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "txNumInFlush", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalOperation", "outputs": [ { "name": "", "type": "uint256", "value": "1339270355355112760" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "flushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "proto", "type": "address", "index": 0, "typeShort": "address", "bits": "", "displayName": "proto", "template": "elements_input_address", "value": "0x3de80fEDCa83bd90EEA39fF379c18B335b8c66f3" }, { "name": "vnodeProtocolBaseAddr", "type": "address", "index": 1, "typeShort": "address", "bits": "", "displayName": "vnode Protocol Base Addr", "template": "elements_input_address", "value": "0x1123816cFA818Aa36b46fD4948029ca21A1b7E01" }, { "name": "ercAddr", "type": "address", "index": 2, "typeShort": "address", "bits": "", "displayName": "erc Addr", "template": "elements_input_address", "value": "0x7eB9624eDD7171E154Cda4516742bE3987A5D459" }, { "name": "ercRate", "type": "uint256", "index": 3, "typeShort": "uint", "bits": "256", "displayName": "erc Rate", "template": "elements_input_uint", "value": "1" }, { "name": "min", "type": "uint256", "index": 4, "typeShort": "uint", "bits": "256", "displayName": "min", "template": "elements_input_uint", "value": "1" }, { "name": "max", "type": "uint256", "index": 5, "typeShort": "uint", "bits": "256", "displayName": "max", "template": "elements_input_uint", "value": "11" }, { "name": "thousandth", "type": "uint256", "index": 6, "typeShort": "uint", "bits": "256", "displayName": "thousandth", "template": "elements_input_uint", "value": "1" }, { "name": "flushRound", "type": "uint256", "index": 7, "typeShort": "uint", "bits": "256", "displayName": "flush Round", "template": "elements_input_uint", "value": "40" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "message", "type": "string" } ], "name": "ReportStatus", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "addr", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "TransferAmount", "type": "event" } ]';

		let subchainContract = this.chain3.mc.contract(JSON.parse(subchainABI));
		let subchainInstance = subchainContract.at(subchainAddr);
		let erc20ABI =
			'[ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string", "value": "KaBa New Energy" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256", "value": "2e+25" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8", "value": "18" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x19dcff83384184a779a7abb2a9b4645af3e6e646" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string", "value": "CKM_N" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "success", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "initialAmount", "type": "uint256", "index": 0, "typeShort": "uint", "bits": "256", "displayName": "initial Amount", "template": "elements_input_uint", "value": "20000000" }, { "name": "tokenName", "type": "string", "index": 1, "typeShort": "string", "bits": "", "displayName": "token Name", "template": "elements_input_string", "value": "KaBa New Energy" }, { "name": "decimalUnits", "type": "uint8", "index": 2, "typeShort": "uint", "bits": "8", "displayName": "decimal Units", "template": "elements_input_uint", "value": "18" }, { "name": "tokenSymbol", "type": "string", "index": 3, "typeShort": "string", "bits": "", "displayName": "token Symbol", "template": "elements_input_string", "value": "CKM_N" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_owner", "type": "address" }, { "indexed": true, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]';

		let erc20Contract = this.chain3.mc.contract(JSON.parse(erc20ABI));
		let erc20Instance = erc20Contract.at(ercAddr);
		let decimals = await erc20Instance.decimals.call().toNumber();
		let amounts = amount * Math.pow(10, decimals);

		let data = subchainInstance.buyMintToken.getData(amounts);
		let amountValue = 0;

		const rawTransaction = {
			from: from,
			nonce: this.chain3.intToHex(nonce),
			gasPrice: this.chain3.intToHex(gasPrice.toNumber()),
			gasLimit: this.chain3.intToHex(gasLimit),
			to: subchainAddr,
			value: this.chain3.intToHex(amountValue),
			shardingFlag: 0,
			data: data,
			chainId: this.chain3.version.network
		};
		let serializedTx = this.chain3.signTransaction(rawTransaction, secretObj);
		try {
			return await this.chain3.mc.sendRawTransaction(serializedTx);
		} catch (e) {
			let err = e + "";
			return { result: null, err: err };
		}
	}
	//充值3-墨客子链直接充值充值
	async buyMintTokenTrue(secret, ercAddr, subchainAddr, amount) {
		/*let Chain3 = require("chain3");
		let chain3 = new Chain3(
		  new Chain3.providers.HttpProvider("http://120.78.146.107:8989")
			);*/

		let secretObj = `0x${secret}`;
		const account = MoacUtils.privateToAddress(
			Buffer.from(secret, "hex")
		).toString("hex");
		const from = "0x" + account.toString("hex");
		const gasPrice = await this.chain3.mc.gasPrice;
		const gasLimit = 9000000;
		const nonce = await this.chain3.mc.getTransactionCount(from);

		let subchainABI =
			'[ { "constant": true, "inputs": [], "name": "maxMember", "outputs": [ { "name": "", "type": "uint256", "value": "11" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maxFlushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "500" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "blockReward", "outputs": [ { "name": "", "type": "uint256", "value": "499800031997442" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "per_upload_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "160" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "removeSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hashlist", "type": "bytes32[]" }, { "name": "blocknum", "type": "uint256[]" }, { "name": "distAmount", "type": "uint256[]" }, { "name": "badactors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" } ], "name": "createProposal", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "BALANCE", "outputs": [ { "name": "", "type": "uint256", "value": "2e+25" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodeList", "outputs": [ { "name": "", "type": "address", "value": "0x4d7ff13fb1c4cd4c17e4591659a7edf567f01134" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getMonitorInfo", "outputs": [ { "name": "", "type": "address[]", "value": [ "0x071e24e268ec681baa2181b266bcdf2c8b8fb632" ] }, { "name": "", "type": "string[]", "value": [ "" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeToReleaseCount", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "scsBeneficiary", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minMember", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "funcCode", "outputs": [ { "name": "", "type": "bytes", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" } ], "name": "requestReleaseImmediate", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" } ], "name": "requestRelease", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "consensusFlag", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "BackupUpToDate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "proposals", "outputs": [ { "name": "proposedBy", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "lastApproved", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "hash", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" }, { "name": "start", "type": "uint256", "value": "0" }, { "name": "end", "type": "uint256", "value": "0" }, { "name": "flag", "type": "uint256", "value": "0" }, { "name": "startingBlock", "type": "uint256", "value": "0" }, { "name": "votecount", "type": "uint256", "value": "0" }, { "name": "viaNodeAddress", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "preRedeemNum", "type": "uint256", "value": "0" }, { "name": "distributeFlag", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerUploadRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToDispel", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getVnodeInfo", "outputs": [ { "components": [ { "name": "protocol", "type": "address" }, { "name": "members", "type": "uint256[]" }, { "name": "rewards", "type": "uint256[]" }, { "name": "proposalExpiration", "type": "uint256" }, { "name": "VnodeProtocolBaseAddr", "type": "address" }, { "name": "penaltyBond", "type": "uint256" }, { "name": "subchainstatus", "type": "uint256" }, { "name": "owner", "type": "address" }, { "name": "BALANCE", "type": "uint256" }, { "name": "redeems", "type": "uint256[]" }, { "name": "nodeList", "type": "address[]" }, { "name": "nodesToJoin", "type": "address[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "monitors", "outputs": [ { "name": "from", "type": "address", "value": "0x071e24e268ec681baa2181b266bcdf2c8b8fb632" }, { "name": "bond", "type": "uint256", "value": "1000000000000000000" }, { "name": "link", "type": "string", "value": "47.110.129.12" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "txReward", "outputs": [ { "name": "", "type": "uint256", "value": "99960006400" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCRate", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "monitor", "type": "address" }, { "name": "link", "type": "string" } ], "name": "registerAsMonitor", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCDecimals", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "scs", "type": "address" } ], "name": "getSCSRole", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" }, { "name": "redeem", "type": "bool" } ], "name": "voteOnProposal", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "nodesWatching", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "registerOpen", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "max_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "500" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "rebuildFromLastFlushPoint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "registerClose", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "currentRefundGas", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updateRechargeCycle", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeCount", "outputs": [ { "name": "", "type": "uint256", "value": "8" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "id", "type": "address" }, { "name": "link", "type": "string" } ], "name": "addSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_recharge_num", "outputs": [ { "name": "", "type": "uint256", "value": "250" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "penaltyBond", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getholdingPool", "outputs": [ { "name": "", "type": "address[]", "value": [ "0x68986c1bcd54ae5dae69310fc64ea544ff1d56c4" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "protocol", "outputs": [ { "name": "", "type": "address", "value": "0x3de80fedca83bd90eea39ff379c18b335b8c66f3" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_JOIN_FEE", "outputs": [ { "name": "", "type": "uint256", "value": "10000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" } ], "name": "registerAsSCS", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" } ], "name": "registerAsBackup", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalBond", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "recharge_cycle", "outputs": [ { "name": "", "type": "uint256", "value": "6" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "addFund", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_redeemdata_num", "outputs": [ { "name": "", "type": "uint256", "value": "110" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "contractNeedFund", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToJoin", "outputs": [ { "name": "", "type": "address", "value": "0x" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "nodePerformance", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "num", "type": "uint256" } ], "name": "updatePerRechargeNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushStatus", "outputs": [ { "name": "", "type": "bool", "value": true } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "viaReward", "outputs": [ { "name": "", "type": "uint256", "value": "9996000639948803" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" }, { "name": "holdingPoolPos", "type": "uint256" } ], "name": "getEnteringAmount", "outputs": [ { "name": "enteringAddr", "type": "address[]", "value": [ "0x68986c1bcd54ae5dae69310fc64ea544ff1d56c4" ] }, { "name": "enteringAmt", "type": "uint256[]", "value": [ "50" ] }, { "name": "enteringtime", "type": "uint256[]", "value": [ "1555319095" ] }, { "name": "rechargeParam", "type": "uint256[]", "value": [ "250", "6" ] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "userAddr", "type": "address" } ], "name": "getRedeemRecords", "outputs": [ { "components": [ { "name": "redeemAmount", "type": "uint256[]" }, { "name": "redeemtime", "type": "uint256[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "addr", "type": "address" }, { "name": "index1", "type": "uint8" }, { "name": "index2", "type": "uint8" } ], "name": "matchSelTarget", "outputs": [ { "name": "", "type": "bool", "value": true } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "nodeToAdd", "type": "uint256" } ], "name": "registerAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_value", "type": "uint256" } ], "name": "buyMintToken", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_DELETE_NUM", "outputs": [ { "name": "", "type": "uint256", "value": "5" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "syncNodes", "outputs": [ { "name": "nodeId", "type": "address" }, { "name": "link", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushInfo", "outputs": [ { "name": "", "type": "uint256", "value": "56" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "getEstFlushBlock", "outputs": [ { "name": "", "type": "uint256", "value": "2286889" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "syncReward", "outputs": [ { "name": "", "type": "uint256", "value": "99960006400" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "checkProposalStatus", "outputs": [ { "name": "", "type": "uint256", "value": "2" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "types", "type": "uint256" } ], "name": "getProposal", "outputs": [ { "components": [ { "name": "proposedBy", "type": "address" }, { "name": "lastApproved", "type": "bytes32" }, { "name": "hash", "type": "bytes32" }, { "name": "start", "type": "uint256" }, { "name": "end", "type": "uint256" }, { "name": "distributionAmount", "type": "uint256[]" }, { "name": "flag", "type": "uint256" }, { "name": "startingBlock", "type": "uint256" }, { "name": "voters", "type": "uint256[]" }, { "name": "votecount", "type": "uint256" }, { "name": "badActors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" }, { "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" }, { "name": "minerAddr", "type": "address[]" }, { "name": "distributeFlag", "type": "uint256" }, { "name": "redeemAgreeList", "type": "address[]" } ], "name": "", "type": "tuple" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashInProgress", "outputs": [ { "name": "", "type": "bytes32", "value": "0x0000000000000000000000000000000000000000000000000000000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "requestEnterAndRedeemAction", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "nodesToRelease", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "randIndex", "outputs": [ { "name": "", "type": "uint8", "value": "28" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" } ], "name": "requestProposalAction", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "addr", "type": "address" } ], "name": "isMemberValid", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntNow", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE_COUNT", "outputs": [ { "name": "", "type": "uint256", "value": "2" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "initialFlushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "40" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "selTarget", "outputs": [ { "name": "", "type": "uint256", "value": "255" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "reset", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashApprovedLast", "outputs": [ { "name": "", "type": "bytes32", "value": "0x620142feb74ca4a38791215ac310114e81a54e3d9fdd48b6d23bcbd6bb74a7df" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "NODE_INIT_PERFORMANCE", "outputs": [ { "name": "", "type": "uint256", "value": "5" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "VnodeProtocolBaseAddr", "outputs": [ { "name": "", "type": "address", "value": "0x1123816cfa818aa36b46fd4948029ca21a1b7e01" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" } ], "name": "UploadRedeemData", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "monitor", "type": "address" } ], "name": "removeMonitorInfo", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_GAS_PRICE", "outputs": [ { "name": "", "type": "uint256", "value": "20000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntMax", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dappRedeemPos", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ERCAddr", "outputs": [ { "name": "", "type": "address", "value": "0x7eb9624edd7171e154cda4516742be3987a5d459" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalExpiration", "outputs": [ { "name": "", "type": "uint256", "value": "24" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "DEFLATOR_VALUE", "outputs": [ { "name": "", "type": "uint256", "value": "80" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_MIN_FEE", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "recv", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "txNumInFlush", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalOperation", "outputs": [ { "name": "", "type": "uint256", "value": "1339270355355112760" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "flushInRound", "outputs": [ { "name": "", "type": "uint256", "value": "100" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "proto", "type": "address", "index": 0, "typeShort": "address", "bits": "", "displayName": "proto", "template": "elements_input_address", "value": "0x3de80fEDCa83bd90EEA39fF379c18B335b8c66f3" }, { "name": "vnodeProtocolBaseAddr", "type": "address", "index": 1, "typeShort": "address", "bits": "", "displayName": "vnode Protocol Base Addr", "template": "elements_input_address", "value": "0x1123816cFA818Aa36b46fD4948029ca21A1b7E01" }, { "name": "ercAddr", "type": "address", "index": 2, "typeShort": "address", "bits": "", "displayName": "erc Addr", "template": "elements_input_address", "value": "0x7eB9624eDD7171E154Cda4516742bE3987A5D459" }, { "name": "ercRate", "type": "uint256", "index": 3, "typeShort": "uint", "bits": "256", "displayName": "erc Rate", "template": "elements_input_uint", "value": "1" }, { "name": "min", "type": "uint256", "index": 4, "typeShort": "uint", "bits": "256", "displayName": "min", "template": "elements_input_uint", "value": "1" }, { "name": "max", "type": "uint256", "index": 5, "typeShort": "uint", "bits": "256", "displayName": "max", "template": "elements_input_uint", "value": "11" }, { "name": "thousandth", "type": "uint256", "index": 6, "typeShort": "uint", "bits": "256", "displayName": "thousandth", "template": "elements_input_uint", "value": "1" }, { "name": "flushRound", "type": "uint256", "index": 7, "typeShort": "uint", "bits": "256", "displayName": "flush Round", "template": "elements_input_uint", "value": "40" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "message", "type": "string" } ], "name": "ReportStatus", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "addr", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" } ], "name": "TransferAmount", "type": "event" } ]';

		let subchainContract = this.chain3.mc.contract(JSON.parse(subchainABI));
		let subchainInstance = subchainContract.at(subchainAddr)

		let data = subchainInstance.buyMintToken.getData();
		let amountValue = this.chain3.toSha(amount, "mc");

		const rawTransaction = {
			from: from,
			nonce: this.chain3.intToHex(nonce),
			gasPrice: this.chain3.intToHex(gasPrice.toNumber()),
			gasLimit: this.chain3.intToHex(gasLimit),
			to: subchainAddr,
			value: this.chain3.intToHex(amountValue),
			shardingFlag: 0,
			data: data,
			chainId: this.chain3.version.network
		};
		let serializedTx = this.chain3.signTransaction(rawTransaction, secretObj);
		try {
			return await this.chain3.mc.sendRawTransaction(serializedTx);
		} catch (e) {
			let err = e + "";
			return { result: null, err: err };
		}
	}
}
