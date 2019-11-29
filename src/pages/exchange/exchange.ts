import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController,AlertController, NavParams } from 'ionic-angular';
import { HttpClient } from "@angular/common/http";
import { Storage } from "@ionic/storage";
import { WalletProvider } from '../../providers/wallet';
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from '../../app/app.config';

/**
 * Generated class for the ExchangePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-exchange',
  templateUrl: 'exchange.html',
})
export class ExchangePage {
    list1:any=['ZJT','TCNY'];
	list2:any=['ZJT','TCNY'];
	name1:string="ZJT";
	name2:string="TCNY";
	quanyi:string="";//权益币接收地址
	wending:string="";//稳定币接收地址
	source:string="";//来源
	proportion:any=null;//权益币的兑换比例
	value1:number=0;//权益币余额
	value2:number=0;//稳定币子链的余额
	amount1:number=null;//转出数量
	amount2:number=null;//转入数量
	address1:string=null;//转出地址
	address2:string=null;//转入地址
	toList:any=[];
	user: any = {};

	saturation: number = 20000;
	gas: number = 0;//

	subChainInfo: any = {
        MicroChain: "0x1a57f5ee58a0de2c7065bc2c6b6f33a22b591b2b",
        ScsCount: 9,
        balance: 10000000000000000000000000000,
        blockReward: 495420912933712,
        sender: "0x6f0d5b8df93b93d56596718e6f3172722b0c9332",
        txReward: 99084182643,
        viaReward: 9908418258673136,
        dapp_base_address: "0x2180fc09aab3cd89a5b71ce175ef79eb72d75c79",
        describe: "中君子链",
        erc20_address: "0x35c8a6273d8206e7cb1a873afcd1b4ae2a8d9e98",
        erc20_symbol: "TCNY",
        icon: "http://pics.coinpany.cn/70e3a14f-13e1-4270-bef6-9afa725e4bf3.png",
        id: 2,
        is_token: 1,
        main_account: "",
        monitor_ip: "47.56.191.157:50068",
        name: "中君子链",
        proportion: "1:1",
        rpc: "",
        subchain_address: "0x1a57f5ee58a0de2c7065bc2c6b6f33a22b591b2b",
        token_icon: "",
        updatedAt: 1574923077979,
        vnode_ip: "",
        vnode_protocol_address: "",
    };
	constructor(
		public navCtrl: NavController,
        private storage: Storage,
		private http: HttpClient, 
        private zone: NgZone,
		public alertCtrl: AlertController,
        public walletProvider: WalletProvider,
		public navParams: NavParams) {
			this.getSubChainBalance();
			this.getUser();
			this.getaddr();
			this.getToAddr();
			this.gasPrice();
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ExchangePage');
	}
	gasPrice() {//矿工费
		this.gas = this.walletProvider.gasPrice();
	}
	pay(){
		if(this.name1==='ZJT'){
			this.pay1();
		}else{
			this.pay2();
		}
	}
	pay2(){
		//转入权益币 子链转账
		if(this.name1===this.name2){
			this.errorMsg('兑换币种不能相同');
			return
		}

		if (!this.address2) {
			this.errorMsg("请输入或选择正确的兑换地址");
			return;
		}

		if(isNaN(this.amount2)){
			this.errorMsg('请输入正确的数量');
			return
		}

		if(this.amount2 > this.value2){
			this.errorMsg('可用余额不足');
			return
		}
		let prompt = this.alertCtrl.create({
			title: "请输入密码",
			inputs: [
				{
					type: 'password',
					name: 'password',
					placeholder: "请输入密码",
				},
			],
			buttons: [
				{
					text: "取消",
					handler: data => {
					}
				},
				{
					text: "确定",
					handler: async data => {
						if(Md5.hashStr(data.password) === this.user.pwd){
							//子链转账
							let secret = AppConfig.secretDec('moac', this.user.pwd, this.user.secret);
							let res = await this.walletProvider.SubChainSend(
								secret,
								this.wending,
								this.amount2,
								this.subChainInfo.MicroChain,
								"http://" + this.subChainInfo.monitor_ip + "/rpc"
							  );
							console.log('子链转账结果',res);
							if (res) {
								this.errorMsg("交易请求已经提交给区块链网络，请等待正式生效。");
								let params={
									"from": this.user.address, 
									"to": this.address2,
									"hash": res,
									"inCurrency": "TCNY",
									"inAmount": this.amount2,
									"outCurrency": "ZJT",

								}
								this.http
									.post("http://39.98.170.101:3779/api/createOrder",params)
									.subscribe((data:any)=> {
										console.log(data);
										this.reset();
									}
								);
							}
								
						}else{
							this.errorMsg('密码输入错误');
						}
					}
				}
			]
		});
		prompt.present();

	}
	pay1(){
		//转出权益币 主链转账
		if(this.name1===this.name2){
			this.errorMsg('兑换币种不能相同');
			return
		}

		if (!this.address1) {
			this.errorMsg("请输入或选择正确的兑换地址");
			return;
		}

		if(isNaN(this.amount1)){
			this.errorMsg('请输入正确的数量');
			return
		}

		if(this.amount1 > this.value1){
			this.errorMsg('可用余额不足');
			return
		}

		let prompt = this.alertCtrl.create({
			title: "请输入密码",
			inputs: [
				{
					type: 'password',
					name: 'password',
					placeholder: "请输入密码",
				},
			],
			buttons: [
				{
					text: "取消",
					handler: data => {
					}
				},
				{
					text: "确定",
					handler: async data => {
						if(Md5.hashStr(data.password) === this.user.pwd){
							let secret = AppConfig.secretDec('moac', this.user.pwd, this.user.secret);
							let address = this.address1.replace(/\s+/g, "");
							let amount = this.amount1;
							let option = {
								'assetCode': "ZJT",
								'gasPrice': this.gas,
								'gasLimit': this.saturation,
							};
							let sendResult = await this.walletProvider.sendTransaction(secret, this.quanyi, amount, option);

							console.log('sendResult', sendResult);
							if (sendResult) {
								this.errorMsg('交易请求已经提交给区块链网络，请等待正式生效。');
								let params={
									"from": this.user.address, 
									"to": address,
									"hash": sendResult,
									"inCurrency": "ZJT",
									"inAmount": this.amount1,
									"outCurrency": "TCNY",

								}
								this.http
									.post("http://39.98.170.101:3779/api/createOrder",params)
									.subscribe((data:any)=> {
										console.log(data);
										this.reset();
									}
								);
							} else {
								this.errorMsg('请求失败');
							}
						}else{
							this.errorMsg('密码输入错误');
						}
					}
				}
			]
		});
		prompt.present();
	}
	getToAddr(){
		//获取可使用的下拉列表地址 
		this.toList=[];
		this.storage.get('contacts').then((res:any)=>{
			if(res && res.length>0){
				for (const key in res) {
					let json={
						label:res[key].address.slice(0,8)+"..."+res[key].address.slice(-8)+"@"+res[key].name,
						address:res[key].address
					}
					this.toList.push(json);
				}
			}else{
				let json={
					label:"暂无可用地址,可先添加联系人",
					address:null
				}
				this.toList.push(json);
			}
		})
	}
	reset(){
		this.amount1=null;
		this.amount2=null;
		this.address1=null;
		this.address2=null;
	}
	async getUser() {
        let that = this;
        if (await that.storage.get('user')) {
            that.user = await that.storage.get('user');
			this.getMoacAndTokenBalances();
        }
        
    }
	getaddr(){
		//获取权益币和稳定币的地址
		this.http
			.get("http://39.98.170.101:3779/api/address")
			.subscribe((data:any)=> {
					this.quanyi=data.data.quanyi;
					this.wending=data.data.wending;
					this.proportion=data.data.proportion;
					this.source=data.data.source;
				}
			);
	}
	async getMoacAndTokenBalances() {//获得MOAC和ERC20代币的余额  --moac放在第一个
        let that = this;
		let balances: any;
		let value: any;
		console.log('that.user.address',that.user.address)
        try {
            balances = await that.walletProvider.getMoacAndTokenBalances(that.user.address,["ZJT"]) || [];
            for (const key in balances) {
				if (balances[key].code === "ZJT") {
					value=balances[key].value
				}
			}
            that.zone.run(() => {
                this.value1 = value
            });
        } catch (e) {
            
        }
        // this.tokens = await this.walletProvider.getMoacAndTokenBalances(this.user.address,this.ERC20) || [];

	}
	//子链余额
    async getSubChainBalance() {
        this.user = await this.storage.get("user");
        let balance = await this.walletProvider.getSubChainBalance(
            this.user.address,
            this.subChainInfo.subchain_address,
            "http://" + this.subChainInfo.monitor_ip + "/rpc"
        );
        this.value2 = balance.result / 1000000000000000000;
	}
	
	errorMsg(msg) {
        //错误提示
        let prompt = this.alertCtrl.create({
            title: '提示',
            message: msg,
            buttons: [
                {
                    text: 'OK',
                    handler: data => {
                    }
                }
            ]
        });
        prompt.present();
    }
}
