import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../providers/wallet';
import { Storage } from "@ionic/storage";
import { MenuController } from 'ionic-angular';
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operator/takeUntil';
import { HttpClient } from "@angular/common/http";
import VConsole from 'vconsole';
// var vConsole = new VConsole();

/**
 * Generated class for the AssetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-asset',
    templateUrl: 'asset.html',
})
export class AssetPage extends BaseUI {
    @ViewChild(Slides) slides: Slides;
    tabs: string = 'pass';
    pockets: any = [];
    user: any = {};
    ERC20: any = [];
    tokens: any = [];//通证余额
    value: any = '';//子链余额
    publicPem: any = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZMESj2X2x9X4TvW3s0e+TYqsz69P0hNqnJuJX/hsnZjlO/A41cUyzw/4oVBkFNThC7X06NiiciHvHB+f8VowynReNFeGxB13ULLGb2mRVerk/enPJ1iJWLMKrvPOq0nuErhnovdyEmhqrITDPmNb/TADQHACCVi/l7h635SSpIwIDAQAB';
    privte: any = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJkwRKPZfbH1fhO9bezR75NiqzPr0/SE2qcm4lf+GydmOU78DjVxTLPD/ihUGQU1OELtfTo2KJyIe8cH5/xWjDKdF40V4bEHXdQssZvaZFV6uT96c8nWIlYswqu886rSe4SuGei93ISaGqshMM+Y1v9MANAcAIJWL+XuHrflJKkjAgMBAAECgYEAkajf25y2dDymAUch+wkz8MTlXZ1kESEyd7X1iw3H7BK7c2sgZ5iwAk7eoKI2mEkekiUX6f4NZ6ovZ/UQlVQGQa7MP2byrEMssE8swmjXL5XOsIRCDYt1JV+B8568vGa2W5n+nGy7ljE0X8cw8m6CcaqM+po2mqQmwEnm6zP8YSECQQDfv6l45b7CcfpkAruFwtthVF71zQtoFkWU/apATXqcGSa2sn70YwsBpzuB8sRzhLkISGrXa423A+QDGEUAr+4lAkEAr0Tu/NvKnD0xb02S3J5aYXDQViuGyJyAgtZlFKnjn5bkUOsgDsDclLXRnC7WQJALBY/q+0FxVQor4jh/TahjpwJAZbc6ssQ2uSyZeJepagCQPKnfVXy2X8YoMbgzinHueEIS0GFKx4yy9zhwG/4iAqXme/Z346B4VyfEoweIbuyLpQJAIseuGRVQfnKSNcESDJ+L1dw6K29Vvsd3pP8AbfpMhiW+RuRxpxvUadouryyILaWn2kG14ogZAkQTcz+821837wJBAKON+bp5atHRzJdQn5od3WUrrz52OKiz4wwEB6eH1XLe3K82Om3eNMLaGbv/Ll2O5UmRzvAz8DXotMtTL5Hsz0E='
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
    Tokens: any; //storage里面的token
    Token20: any; //storage里面的token20
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        private zone: NgZone,
		private http: HttpClient,
        public menuCtrl: MenuController,
        public walletProvider: WalletProvider,
        public translate: TranslateService,
        public alertCtrl: AlertController) {
        super();
       
    }
    
    ionViewWillEnter() {
        this.getPockets();//获取所有钱包
        this.getSubChainBalance();
    }
    async getPockets() {
        let that = this;
        if (await that.storage.get('pockets')) {
            that.pockets = await that.storage.get('pockets');
            that.user = that.pockets[0];
            that.storage.set('user', that.user);
        }
        this.getTokens();
        
    }
    async getMoacAndTokenBalances() {//获得MOAC和ERC20代币的余额  --moac放在第一个
        let that = this;
        let balances: any;
        try {
            console.log('that.ERC20',that.ERC20)
            balances = await that.walletProvider.getMoacAndTokenBalances(that.user.address, that.ERC20) || [];
            for (let key in balances) {
                for (let item in that.Token20) {
                    if (balances[key].code == that.Token20[item].symbol) {
                        balances[key].icon = that.Token20[item].icon;
                    }
                }
            }
            that.zone.run(() => {
                that.tokens = balances;
            });
        } catch (e) {
            that.tokens = [];
        }
        // this.tokens = await this.walletProvider.getMoacAndTokenBalances(this.user.address,this.ERC20) || [];

    }
   
    slideChanged() {//切换钱包
        let currentIndex: number = this.slides.getActiveIndex();
        if (currentIndex == this.pockets.length) {
            currentIndex = this.pockets.length - 1;
        }
        this.user = this.pockets[currentIndex];
        this.storage.set('user', this.user).then(()=>{
            this.getMoacAndTokenBalances();
            this.getSubChainBalance();
        });
    }
    toTokenDetails(item) {//去通证详情
        this.navCtrl.push('TokendetailsPage', {
            'item': item
        });
    }
    jump(item) {
        if (item != '') {
            this.navCtrl.push(item);
        } else {
            //err
        }
    }
    openMenu() {
        this.menuCtrl.open();
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

    doRefresh(refresher) {
        setTimeout(() => {
            this.storage.get('user').then((user)=>{
                this.user = user;
                this.getMoacAndTokenBalances();
                this.getSubChainBalance();
            })
            refresher.complete();
        }, 1000);

    }
    getTokens() {
		this.http
			.get("http://39.98.170.101:3779/api/tokens", {})
			.subscribe(
				data => {
					let res = JSON.stringify(data);
					let res1 = JSON.parse(res);
                    this.Tokens = res1;
                    // that.Tokens = await that.storage.get('tokens');
                    this.Token20 = this.Tokens.ERC20;
                    this.ERC20 = [];
                    
                    for (let key in this.Tokens.ERC20) {
                        this.ERC20.push(this.Tokens.ERC20[key].symbol);
                    }
                    this.getMoacAndTokenBalances();
					return res1;
				}
			);
    }

    ionViewDidEnter() {
        //进入显示TabBars
        let elements = document.querySelectorAll(".tabbar");
        if (elements != null) {
            Object.keys(elements).map((key) => {
                elements[key].style.display = 'flex';
            });
        }


    }

    toTrade(val) {//去往子链详情 充币提币页面
        this.navCtrl.push("TradePage", {
            info: this.subChainInfo,
            value: val
        });
    }
    getResult(msg) {
        return super.getI18n(msg, this.translate)
    }
    //子链余额
    async getSubChainBalance() {
        this.user = await this.storage.get("user");
        let balance = await this.walletProvider.getSubChainBalance(
            this.user.address,
            this.subChainInfo.subchain_address,
            "http://" + this.subChainInfo.monitor_ip + "/rpc"
        );
        this.value = balance.result / 1000000000000000000;
    }
}
