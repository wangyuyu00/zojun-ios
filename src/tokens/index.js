const ERC20 = {
	TCXY: {
		symbol: 'TCXY',
		name: 'Tian Ce Xing Yuan',
		address: '0xe5356d7f6c13b5cc833376a6d46d682e01b04f3a',
		supply: 650000000,
		decimals: 18
	},
	TST: {
		symbol: 'TST',
		name: 'Test Coin1',
		address: '0x2e8d2a7e425636c31749503d70d7c9a7e0fcf11d',
		supply: 100000000,
		decimals: 6
	},
	VGM: {
		symbol: 'VGM',
		name: 'Vgames',
		address: '0x68ae649d493808f90e00a3b457adb466a188b309',
		supply: 1000000000000,
		decimals: 2
	},
	CBE: {
		symbol: 'CBE',
		name: 'the chain of business entertainment',
		address: '0xd98792127cb7a0953669f2986af6fcaa37e40cd0',
		supply: 2000000000,
		decimals: 4
	},
	OGC: {
		symbol: 'OGC',
		name: 'Orchid Glabal Chain',
		address: '0x5fe8841a60d4f476f624a8d817a89baeaca7dfeb',
		supply: 316000000,
		decimals: 18
	},
	SNRC: {
		symbol: 'SNRC',
		name: 'SNRC Token',
		address: '0x1b9bae18532eeb8cd4316a20678a0c43f28f0ae2',
		supply: 2000000000,
		decimals: 18
	},
	YIP: {
		symbol: 'YIP',
		name: '易积分',
		address: '0x0cc9af137241c5ce6a83375a5c2c693b98b0db12',
		supply: 4000000000,
		decimals: 18
	},
	AR: {
		symbol: 'AR',
		name: 'Active Recreation',
		address: '0x160c0e9580238bad659b13c89cd0172f00e71638',
		supply: 1000000000,
		decimals: 8
	},
	ECT: {
		symbol: 'ECT',
		name: 'Electronic Commerce Token',
		address: '0x4c7e99ee6fa3103bfd7f44d3d196fcbf52af988e',
		supply: 1990000000,
		decimals: 8
	},
	GFH: {
		symbol: 'GFH',
		name: 'GFH Token',
		address: '0x12ff6f2bfeba505b2a6cbbcfa8e7e83128256eab',
		supply: 3000000000,
		decimals: 18
	},
	ULC: {
		symbol: 'ULC',
		name: 'ULC Token',
		address: '0x4fe04d0de6e5a7198d10f491b17125d672ae1c83',
		supply: 5000000000,
		decimals: 8
	},
	ECT1: {
		symbol: 'ECT1',
		name: 'Electronic Commerce Token',
		address: '0x4bd3aed2a7b849e5b9aa23cc0110dccd356b6589',
		supply: 1990000000,
		decimals: 8
	},
	CDAO: {
		symbol: 'CDAO',
		name: 'WULIANDAO',
		address: '0x9806ab946617c0cb96f2e270e168fe32e5f2ac79',
		supply: 1990000000,
		decimals: 18
	},
	MSKC: {
		symbol: 'MSKC',
		name: 'MUSANG KING CHAIN',
		address: '0xaac0b9b8a044e750cccc6c0880b6a74c9abe2ed5',
		supply: 68000000,
		decimals: 18
	},
	IEP: {
		symbol: 'IEP',
		name: 'Infinite Exchange Pay',
		address: '0x1efeeb8205c12ba2b2d6171646f463c75a9095f8',
		supply: 158000000,
		decimals: 18
	},
	CFC: {
		symbol: 'CFC',
		name: 'Coffee Gold Chain',
		address: '0x8fd550b4ca288723fa5d63c1b2456cd00307d34a',
		supply: 60000000,
		decimals: 18
	},
	HMC: {
		symbol: 'HMC',
		name: 'HM Coin',
		address: '0xfac8d9ca3ec829bc6f784cb08343f54bf2080348',
		supply: 10000000000,
		decimals: 8
	},
	NTT: {
		symbol: 'NTT',
		name: 'NutsToken',
		address: '0x6433275636a8215331c20ee456c4537b4df12fe0',
		supply: 2000000000,
		decimals: 0
	},
	WKT: {
		symbol: 'WKT',
		name: 'Weike Chain',
		address: '0x4693f23488592d6dd768b9e55c9e7ad6cd56722c',
		supply: 600000000,
		decimals: 18
	},
	LQC: {
		symbol: 'LQC',
		name: 'LangQiao Chain',
		address: '0x7853f3c739dd3b860cda9e04ac5d7ca0ed703298',
		supply: 1000000000,
		decimals: 18
	},
	CID: {
		symbol: 'CID',
		name: 'CID Token',
		address: '0xa5e018f505d8a52946c3c8d85cfd85803a6eb228',
		supply: 3000000000,
		decimals: 18
	},
	CID: {
		symbol: 'CID',
		name: 'CID Token',
		address: '0xa5e018f505d8a52946c3c8d85cfd85803a6eb228',
		supply: 3000000000,
		decimals: 18
	}
};

const ERC721 = {
	NFT: {
		symbol: 'NFT',
		name: 'Test NFT Token',
		address: '0x1c0166bdd33738b7df274c36f12743ad6896d952',
		supply: 100,
		decimals: 0
	},
	GOLD: {
		symbol: 'GOLD',
		name: 'Gold Token',
		address: '0x39f206182f6cbc6fd0d80d159e1fadea32e14722',
		supply: 500,
		decimals: 0
	},
	CERT: {
		symbol: 'CERT',
		name: 'MOAC Certificate',
		address: '0xc89d49950bcf72d58cc203538e4e11d77daf8381',
		supply: 26,
		decimals: 0
	}
};

const ERC20_ABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]';
const ERC721_ABI = '[{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"name","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tokenIndexToOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"tokenId","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"decimals","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"owner","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"count","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_code","type":"string"},{"name":"_quality","type":"string"},{"name":"_weight","type":"string"},{"name":"_owner","type":"address"}],"name":"createToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"}],"name":"tokensOfOwner","outputs":[{"name":"ownerTokens","type":"uint256[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"symbol","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals1","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getCode","outputs":[{"name":"code","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tokenIndexToApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getWeight","outputs":[{"name":"weight","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getQuality","outputs":[{"name":"quality","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_token","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_token","type":"uint256"}],"name":"Approval","type":"event"}]';

module.exports = {
	ERC20: ERC20,
	ERC20_ABI: JSON.parse(ERC20_ABI),
	ERC721: ERC721,
	ERC721_ABI: JSON.parse(ERC721_ABI)
};
