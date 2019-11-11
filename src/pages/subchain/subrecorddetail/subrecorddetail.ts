import { Component } from "@angular/core";
import { WalletProvider } from "../../../providers/wallet";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController
} from "ionic-angular";
import { Clipboard } from "@ionic-native/clipboard";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the SubrecorddetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-subrecorddetail",
  templateUrl: "subrecorddetail.html"
})
export class SubrecorddetailPage extends BaseUI {
  detail: any = {}; //路由过来的详情
  minerFee: number = 0; //矿工费
  qrcode: string = "";
  showCode: string = "";
  constructor(
    public navCtrl: NavController,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    private clipboard: Clipboard,
    private toastCtrl: ToastController,
    public translate: TranslateService
  ) {
    super();
    this.detail = this.navParams.get("item");
    console.log(this.detail);
    this.getMinerFee();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad TokenrecordPage");
  }


  ionViewDidEnter() {
    let img = document.getElementsByClassName("qrcode").item(0).innerHTML;
    if (img == "") {
      this.qrcode = img.slice(img.indexOf('"') + 1, img.lastIndexOf('"'));
      let bg = new Image();
      bg.src = this.qrcode;
      bg.onload = () => {
        this.draw(bg);
      };
    }
  }
  getMinerFee() {
    //this.detail.gasprice格式有问题 不能计算矿工费
    try {
      this.minerFee = this.walletProvider.gasPriceToMoac(
        this.detail.gas * this.detail.gasprice
      );
    } catch (e) {
      console.log("获取矿工费失败", e);
    }
  }
  copy(msg) {
    //复制钱包地址
    this.clipboard.copy(msg).then(res => {
      // console.log('复制chegngong')
      this.presentToast(this.getResult('assets.30'));
    });
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
  //二维码画板
  draw(img: HTMLImageElement) {
    let canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 280;
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 280, 280);
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(img, 5, 5, 270, 270);
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    // ctx.fillText(this.name + title, 140, 260);
    ctx.fill();
    ctx.closePath();
    let qrcode = new Image();
    qrcode.src = canvas.toDataURL("image/png");
    document.getElementById("private-key").appendChild(qrcode);
    this.showCode = canvas.toDataURL("image/png");
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
