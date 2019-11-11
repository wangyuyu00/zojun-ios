import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Clipboard } from '@ionic-native/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../../common/baseui";

/**
 * Generated class for the CollectionreceivePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collectionreceive',
  templateUrl: 'collectionreceive.html',
})
export class CollectionreceivePage extends BaseUI {
  user: any = {}
  qrcode: string = '';
  showCode: string = '';
  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    private clipboard: Clipboard,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public navParams: NavParams) {
    super();
    this.getUser();
  }
  getUser() {
    this.storage.get('user').then((user) => {
      if (user) {
        this.user = user;
      }
    })
  }
  ionViewDidEnter() {
    let img = document.getElementsByClassName('qrcode').item(0).innerHTML;
    if (img == '') {
      this.qrcode = img.slice(img.indexOf('"') + 1, img.lastIndexOf('"'));
      let bg = new Image();
      bg.src = this.qrcode;
      bg.onload = () => {
        this.draw(bg);
      }
    }
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
    document.getElementById('private-key').appendChild(qrcode);
    this.showCode = canvas.toDataURL("image/png");
  }
  copy(msg) {
    //复制钱包地址
    this.clipboard.copy(msg).then((res) => {
      this.presentToast('复制成功');
    })
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: 'top',
      cssClass: 'toast'
    });

    toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
    });

    toast.present();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectionreceivePage');
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
