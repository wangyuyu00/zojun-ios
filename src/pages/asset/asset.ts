import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../providers/wallet';
import { Storage } from "@ionic/storage";
import { MenuController } from 'ionic-angular';
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operator/takeUntil';
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
    ERC721: any = [];
    tokens: any = [];//通证余额
    value: any = '';//子链余额
    publicPem: any = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZMESj2X2x9X4TvW3s0e+TYqsz69P0hNqnJuJX/hsnZjlO/A41cUyzw/4oVBkFNThC7X06NiiciHvHB+f8VowynReNFeGxB13ULLGb2mRVerk/enPJ1iJWLMKrvPOq0nuErhnovdyEmhqrITDPmNb/TADQHACCVi/l7h635SSpIwIDAQAB';
    privte: any = 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAJkwRKPZfbH1fhO9bezR75NiqzPr0/SE2qcm4lf+GydmOU78DjVxTLPD/ihUGQU1OELtfTo2KJyIe8cH5/xWjDKdF40V4bEHXdQssZvaZFV6uT96c8nWIlYswqu886rSe4SuGei93ISaGqshMM+Y1v9MANAcAIJWL+XuHrflJKkjAgMBAAECgYEAkajf25y2dDymAUch+wkz8MTlXZ1kESEyd7X1iw3H7BK7c2sgZ5iwAk7eoKI2mEkekiUX6f4NZ6ovZ/UQlVQGQa7MP2byrEMssE8swmjXL5XOsIRCDYt1JV+B8568vGa2W5n+nGy7ljE0X8cw8m6CcaqM+po2mqQmwEnm6zP8YSECQQDfv6l45b7CcfpkAruFwtthVF71zQtoFkWU/apATXqcGSa2sn70YwsBpzuB8sRzhLkISGrXa423A+QDGEUAr+4lAkEAr0Tu/NvKnD0xb02S3J5aYXDQViuGyJyAgtZlFKnjn5bkUOsgDsDclLXRnC7WQJALBY/q+0FxVQor4jh/TahjpwJAZbc6ssQ2uSyZeJepagCQPKnfVXy2X8YoMbgzinHueEIS0GFKx4yy9zhwG/4iAqXme/Z346B4VyfEoweIbuyLpQJAIseuGRVQfnKSNcESDJ+L1dw6K29Vvsd3pP8AbfpMhiW+RuRxpxvUadouryyILaWn2kG14ogZAkQTcz+821837wJBAKON+bp5atHRzJdQn5od3WUrrz52OKiz4wwEB6eH1XLe3K82Om3eNMLaGbv/Ll2O5UmRzvAz8DXotMtTL5Hsz0E='
    subChainInfo: any = {
        MicroChain: "0xac7c54e2b6bae6768bbc90afc51b022e9200a4dc",
        ScsCount: 8,
        balance: 5000000000000,
        blockReward: 469639600302410,
        dapp_base_address: "0x7eb9624edd7171e154cda4516742be3987a5d459",
        erc20_address: "0x383811667cE9646E8bCE8aff8Ca049751dbeC64B",
        erc20_symbol: "CKT",
        subchain_address: "0xac7c54e2b6bae6768bbc90afc51b022e9200a4dc",
        icon: "http://trusting.halobtc.com/90b6fd38-3499-4af2-9c87-039bec9727b9.png",
        is_token: 1,
        monitor_ip: "47.110.129.12:50068",
        name: "卡巴子链",
        proportion: "1:1",
        rpc: "",
        sender: "0x19dcff83384184a779a7abb2a9b4645af3e6e646",
        txReward: 93927920435,
        viaReward: 9392792006040992,
        vnode_ip: "",
        vnode_protocol_address: "",
        describe: "区块链上的新能源汽车子链",
        id: 1,
        main_account: "",
        token_icon: "http://trusting.halobtc.com/90b6fd38-3499-4af2-9c87-039bec9727b9.png",
        updatedAt: 1560138262967,
    };
    Tokens: any; //storage里面的token
    Token721: any; //storage里面的token721
    Token20: any; //storage里面的token20
    collections: any = [];//收藏品余额
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        private zone: NgZone,
        public menuCtrl: MenuController,
        public walletProvider: WalletProvider,
        public translate: TranslateService,
        public alertCtrl: AlertController) {
        super();

        setTimeout(() => {
            this.getPockets();//获取所有钱包
            this.getSubChainBalance();
        }, 1000);

    }

    ionViewDidLoad() {
        //   // console.log('ionViewDidLoad AssetPage');
        //     this.getPockets();//获取所有钱包
    }
    ionViewWillEnter() {
        if (this.tokens.length > 0 || this.collections.length > 0) {
            this.onlyGetPockets();//时时更新钱包
            this.getPockets();//获取所有钱包
            this.onlyGetTokens();//时时更新资产
        }
    }
    onlyGetPockets() {
        this.storage.get('pockets').then((p) => {
            if (p) {
                if (p.length != this.pockets.length) {
                    this.pockets = p;
                }
            }
        })
    }
    async onlyGetTokens() {
        let that = this;
        if (await this.storage.get('tokens')) {
            that.Tokens = await that.storage.get('tokens');
            that.Token721 = that.Tokens.ERC721;
            that.Token20 = that.Tokens.ERC20;
            that.ERC721 = [];
            that.ERC20 = [];
            for (let key in that.Tokens.ERC721) {
                if (that.Tokens.ERC721[key].flag == true) {
                    that.ERC721.push(that.Tokens.ERC721[key].symbol);
                }
            }
            for (let key in that.Tokens.ERC20) {
                if (that.Tokens.ERC20[key].flag == true) {
                    that.ERC20.push(that.Tokens.ERC20[key].symbol);
                }
            }
        } else {
            that.ERC721 = ['NFT'];
            that.ERC20 = [];
        }
        that.getMoacAndTokenBalances();
        that.getCollectionBalances();
    }
    async getPockets() {
        let that = this;
        if (await that.storage.get('pockets')) {
            that.pockets = await that.storage.get('pockets');
            that.user = that.pockets[0];
            that.storage.set('user', that.user);
            // this.getCollectionBalances();//页面出来 点击再条用
        }
        if (await that.storage.get('tokens')) {
            that.Tokens = await that.storage.get('tokens');
            that.Token721 = that.Tokens.ERC721;
            that.Token20 = that.Tokens.ERC20;
            that.ERC721 = [];
            that.ERC20 = [];
            for (let key in that.Tokens.ERC721) {
                if (that.Tokens.ERC721[key].flag == true) {
                    that.ERC721.push(that.Tokens.ERC721[key].symbol);
                }
            }
            for (let key in that.Tokens.ERC20) {
                if (that.Tokens.ERC20[key].flag == true) {
                    that.ERC20.push(that.Tokens.ERC20[key].symbol);
                }
            }
        } else {
            that.ERC721 = ['NFT'];
            that.ERC20 = [];
        }
        that.getMoacAndTokenBalances();
    }
    async getMoacAndTokenBalances() {//获得MOAC和ERC20代币的余额  --moac放在第一个
        let that = this;
        let balances: any;
        try {
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

    }
    async getCollectionBalances() {//获得ERC721收藏品的余额
        let that = this;
        let balances: any;
        try {
            balances = await that.walletProvider.getCollectionBalances(that.user.address, that.ERC721) || [];
            for (let key in balances) {
                for (let item in that.Token721) {
                    if (balances[key].code == that.Token721[item].symbol) {
                        balances[key].icon = that.Token721[item].icon;
                    }
                }
            }
            that.zone.run(() => {
                that.collections = balances;
            });
        } catch (e) {
            that.collections = [];
        }

    }
    slideChanged() {//切换钱包
        let currentIndex: number = this.slides.getActiveIndex();
        if (currentIndex == this.pockets.length) {
            currentIndex = this.pockets.length - 1;
        }
        this.user = this.pockets[currentIndex];
        this.storage.set('user', this.user);
        this.tabs = 'pass';
        this.getMoacAndTokenBalances();
    }
    toTokenDetails(item) {//去通证详情
        this.navCtrl.push('TokendetailsPage', {
            'item': item
        });
    }
    toCollectionDetails(item) {//去收藏品详情
        this.navCtrl.push('CollectionlistPage', {
            'item': item,
            'user': this.user
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
        // refresher.complete();
        setTimeout(() => {
            this.onlyGetTokens();//刷新通证资产
            refresher.complete();
        }, 1000);

    }
    doRefresh1(refresher) {
        // refresher.complete();
        setTimeout(() => {
            this.onlyGetTokens();//刷新收藏品资产
            refresher.complete();
        }, 1000);

    }
    ionViewDidEnter() {
        //进入显示TabBars

        // this.getPockets();//获取所有钱包
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
