import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../../providers/wallet'
import { Storage } from "@ionic/storage";
import { Md5 } from 'ts-md5/dist/md5';
import { AppConfig } from '../../../app/app.config';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the SetpwdPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-setpwd',
    templateUrl: 'setpwd.html',
})
export class SetpwdPage extends BaseUI {
    name: string = '';//名称
    pwd: string = '';//密码
    confirmPwd: string = '';//二次密码
    eyeFlag1: boolean = false;//密码
    eyeFlag2: boolean = false;//确认密码
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        public translate: TranslateService,
        public alertCtrl: AlertController,
        public walletProvider: WalletProvider,
    ) {
        super();
    }
    creatWallet() {//创建钱包
        let pwdReg = /^[a-zA-Z0-9_-]{8,16}$/;
        if (this.name === '') {
            this.errorMsg(this.getResult("assets.49"));
            return
        }
        if (this.pwd === '') {
            this.errorMsg(this.getResult("login.7"));
            return
        }
        if (!(pwdReg.test(this.pwd))) {
            this.errorMsg(this.getResult("login.8"))
            return
        }
        if (this.confirmPwd === '') {
            this.errorMsg(this.getResult("login.7"));
        }
        if (this.confirmPwd !== this.pwd) {
            this.errorMsg(this.getResult("login.9"));
            return
        }
        let wallet: any = this.walletProvider.createAccount();
        if (typeof wallet === "string") {
            this.errorMsg(this.getResult('login.30'));
            return;
        } else {
            console.log(wallet);
            this.storage.get("pockets").then(p => {
                if (p) {
                    let pockets = p;
                    let flag: boolean = true;
                    for (let key in pockets) {
                        if (pockets[key].name === this.name) {
                            flag = false;
                        }
                    }
                    if (flag === false) {
                        return
                    } else {
                        pockets.unshift({
                            name: this.name,
                            pwd: Md5.hashStr(this.confirmPwd),
                            address: wallet.address,
                            mnemonic: AppConfig.secretEnc(
                                "moac",
                                Md5.hashStr(this.confirmPwd),
                                wallet.mnemonic
                            ),
                            secret: AppConfig.secretEnc(
                                "moac",
                                Md5.hashStr(this.confirmPwd),
                                wallet.secret
                            )
                        });
                        this.storage.set("pockets", pockets);
                    }
                } else {
                    let pocket: any = [
                        {
                            name: this.name,
                            pwd: Md5.hashStr(this.confirmPwd),
                            address: wallet.address,
                            mnemonic: AppConfig.secretEnc(
                                "moac",
                                Md5.hashStr(this.confirmPwd),
                                wallet.mnemonic
                            ),
                            secret: AppConfig.secretEnc(
                                "moac",
                                Md5.hashStr(this.confirmPwd),
                                wallet.secret
                            )
                        }
                    ];
                    this.storage.set("pockets", pocket);
                }
            });
            this.storage.set("user", {
                name: this.name,
                pwd: Md5.hashStr(this.confirmPwd),
                address: wallet.address,
                mnemonic: AppConfig.secretEnc(
                    "moac",
                    Md5.hashStr(this.confirmPwd),
                    wallet.mnemonic
                ),
                secret: AppConfig.secretEnc(
                    "moac",
                    Md5.hashStr(this.confirmPwd),
                    wallet.secret
                )
            });
            console.log(wallet)
            this.navCtrl.push("BackupsPage", {
                'mnemonic': wallet.mnemonic
            });
        }
    }

    ionViewDidLoad() {
        // console.log('ionViewDidLoad SetpwdPage');
    }
    errorMsg(msg) {
        //错误提示
        let prompt = this.alertCtrl.create({
            title: this.getResult("assets.1"),
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
    getResult(msg) {
        return super.getI18n(msg, this.translate)
    }
}
