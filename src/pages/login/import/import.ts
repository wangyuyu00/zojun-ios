import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController
} from "ionic-angular";
import { WalletProvider } from "../../../providers/wallet";
import { TabsPage } from "../../../pages/tabs/tabs";
import { AppConfig } from "../../../app/app.config";
import { Storage } from "@ionic/storage";
import { Md5 } from "ts-md5/dist/md5";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the ImportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-import",
  templateUrl: "import.html"
})
export class ImportPage extends BaseUI {
  tabs: string = "key";
  type: number = 1; //1是私钥或者keystore 2是助记词
  secret: string = ""; //私钥
  mnemonic: string = ""; //助记词
  keystore: string = ""; //keystore
  name: string = ""; //名称
  pwd: string = ""; //密码
  rePwd: string = ""; //确认密码
  eyeFlag1: boolean = false; //密码眼睛
  eyeFlag2: boolean = false; //确认密码眼睛
  reg: any = /^[a-zA-Z0-9_-]{8,16}$/; //密码正则 6位数字
  constructor(

    public navCtrl: NavController,
    private storage: Storage,
    public alertCtrl: AlertController,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad ImportPage');
  }
  importWallet() {
    //导入钱包
    let wallet: any = {};
    if (this.name === "") {
      this.errorMsg('名称不能为空');
      return;
    }
    if (this.pwd === "") {
      this.errorMsg('密码不能为空');
      return;
    }
    if (!this.reg.test(this.pwd)) {
      this.errorMsg('密码错误，密码格式为8-16字母和数字组合');
      return;
    }
    this.storage.get("pockets").then(p => {
      let flag = true;
      if (p) {
        for (let key in p) {
          if (p[key].name == this.name) {
            flag = false;
          }
        }
      }
      if (flag == false) {
        this.errorMsg('钱包名称不能重复');
        return;
      }
      if (this.tabs === "key") {
        //私钥
        this.type = 1;
        if (this.secret === "") {
          this.errorMsg('私钥不能为空');
          return;
        }
        if (this.secret.length <= 20) {
          this.errorMsg('私钥格式不正确');
          return;
        }
        if (
          !this.walletProvider.isValidPrivate(this.secret.replace(/\s+/g, ""))
        ) {
          this.errorMsg('私钥格式不正确');
          return;
        }
        if (this.rePwd === "") {
          this.errorMsg('确认密码不能为空');
          return;
        }
        if (this.rePwd !== this.pwd) {
          this.errorMsg('两次输入的密码不一致');
          return;
        }
        wallet = this.walletProvider.importAccount(this.secret, this.type);
        if (typeof wallet === "string") {
          this.errorMsg('请输入合法的私钥');
          return;
        }
      }
      if (this.tabs === "mnemonic") {
        //助记词
        this.type = 2;
        if (this.mnemonic === "") {
          this.errorMsg('助记词不能为空');
          return;
        }
        if (this.rePwd === "") {
          this.errorMsg('确认密码不能为空');
          return;
        }
        if (this.rePwd !== this.pwd) {
          this.errorMsg('两次输入的密码不一致');
          return;
        }
        wallet = this.walletProvider.importAccount(this.mnemonic, this.type);
        if (typeof wallet === "string") {
          this.errorMsg('请输入正确的助记词，每个单词中间用英文空格分隔');
          return;
        }
      }
      this.storage.set("user", {
        name: this.name,
        pwd: Md5.hashStr(this.pwd),
        address: wallet.address,
        mnemonic: AppConfig.secretEnc(
          "moac",
          Md5.hashStr(this.pwd),
          wallet.mnemonic
        ),
        secret: AppConfig.secretEnc("moac", Md5.hashStr(this.pwd), wallet.secret)
      });
      this.storage.get("pockets").then(p => {
        if (p) {
          let pockets = p;
          pockets.unshift({
            name: this.name,
            pwd: Md5.hashStr(this.pwd),
            address: wallet.address,
            mnemonic: AppConfig.secretEnc(
              "moac",
              Md5.hashStr(this.pwd),
              wallet.mnemonic
            ),
            secret: AppConfig.secretEnc(
              "moac",
              Md5.hashStr(this.pwd),
              wallet.secret
            )
          });
          this.storage.set("pockets", pockets);
        } else {
          let pocket: any = [
            {
              name: this.name,
              pwd: Md5.hashStr(this.pwd),
              address: wallet.address,
              mnemonic: AppConfig.secretEnc(
                "moac",
                Md5.hashStr(this.pwd),
                wallet.mnemonic
              ),
              secret: AppConfig.secretEnc(
                "moac",
                Md5.hashStr(this.pwd),
                wallet.secret
              )
            }
          ];
          this.storage.set("pockets", pocket);
        }

        this.navCtrl.push(TabsPage);
      });
    });
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      message: msg,
      buttons: [
        {
          text: "OK",
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
