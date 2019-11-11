import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ToastController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from "../../../app/app.config";
import { WalletProvider } from "../../../providers/wallet";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the AuthorizePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-authorize",
  templateUrl: "authorize.html"
})
export class AuthorizePage extends BaseUI {
  @ViewChild('pwdID') myInput;
  user: any = {};
  subChainInfo: any; //路由传过来的
  authorizeVal: any; //授权余额
  authorize: any; //授权结果
  amount: number; //授权额度
  flagpwd: boolean = false; //密码框
  pwd: any = ""; //密码pwd: string; 
  amountReg: any = /(^[0-9]*(.[0-9]+)?)$/;
  constructor(
    public navCtrl: NavController,
    public walletProvider: WalletProvider,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private storage: Storage,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();
    this.subChainInfo = this.navParams.get("info");
    this.storage.get("user").then(user => {
      this.user = user;
      this.getAllowance();
    });
  }
  next() {
    if (!this.amount || this.amount == 0 || !this.amountReg.test(this.amount)) {
      this.errorMsg(this.getResult('subchain.4'));
      return;
    }
    let prompt = this.alertCtrl.create({
      title: this.getResult("assets.8"),
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: this.getResult("assets.8"),
        },
      ],
      buttons: [
        {
          text: this.getResult("assets.9"),
          handler: data => {
          }
        },
        {
          text: this.getResult("assets.10"),
          handler: data => {
            this.pwd = data.password;
            this.Approve_erc20();
          }
        }
      ]
    });
    prompt.present();
  }
  //查询授权额度
  async getAllowance() {
    let authorizeVal = await this.walletProvider.allowance(
      this.user.address,
      this.subChainInfo.erc20_address,
      this.subChainInfo.MicroChain
    );
    this.authorizeVal = authorizeVal.balance;
    console.log("授权额度1", this.authorizeVal);
  }
  //子链授权
  async Approve_erc20() {
    if (Md5.hashStr(this.pwd) == this.user.pwd) {
      let secret = AppConfig.secretDec('moac', this.user.pwd, this.user.secret);
      let authorize = await this.walletProvider.Approve_erc20(secret,
        this.subChainInfo.erc20_address,
        this.subChainInfo.MicroChain,
        this.amount
      );
      console.log('authorize', authorize);
      this.amount = null;
      this.authorize = authorize.result;
      if (!authorize.err) {
        this.navCtrl.pop();
        this.presentToast(this.getResult('subchain.6'));
      } else {
        this.presentToast(JSON.stringify(authorize.err));
      }
    } else {
      this.errorMsg(this.getResult('assets.13'));
    }

  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AuthorizePage");
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      title: this.getResult('assets.1'),
      message: msg,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });
    prompt.present();
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: "top",
      cssClass: "toast"
    });

    toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
    });

    toast.present();
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
