import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController
} from "ionic-angular";
import { TabsPage } from "../../../pages/tabs/tabs";
let _ = require("lodash");
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the VerificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-verification",
  templateUrl: "verification.html"
})
export class VerificationPage extends BaseUI {
  mnemonic: any = []; //正确顺序的助记词
  shuffleMnemonic: any = []; //打乱顺序的助记词
  mnemonicClick: any = []; //点击的拼接助记词

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();

  }
  ionViewDidLoad() {
    this.mnemonic = this.navParams.get("mnemonic");
    if (!this.mnemonic[0].key) {
      for (let key in this.mnemonic) {
        this.mnemonic[key] = {
          key: this.mnemonic[key],
          flag: true
        };
      }
    } else {
    }
    this.shuffleMnemonic = _.shuffle(this.mnemonic);
    console.log(this.mnemonic);
    console.log(this.shuffleMnemonic);
  }
  SplicingMnemonic(item) {
    this.mnemonicClick.push(item);
  }
  //点击已选中的 取消校验
  cancel(item) {
    for (let key in this.mnemonicClick) {
      if (this.mnemonicClick[key].key == item.key) {
        this.mnemonicClick.splice(key, 1);
      }
    }
    for (let key in this.shuffleMnemonic) {
      if (this.shuffleMnemonic[key].key == item.key) {
        this.shuffleMnemonic[key].flag = true;
      }
    }
  }
  checkMnemonic() {
    if (this.mnemonic.join(" ") != this.mnemonicClick.join(" ")) {
      this.errorMsg(this.getResult('login.56'));
      this.mnemonicClick = [];
    } else {
      this.navCtrl.push(TabsPage);
    }
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
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
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }

}
