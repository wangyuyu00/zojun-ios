import { Component } from '@angular/core';
import { WalletProvider } from '../../../../providers/wallet';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../../common/baseui";

/**
 * Generated class for the TokenrecordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tokenrecord',
  templateUrl: 'tokenrecord.html',
})
export class TokenrecordPage extends BaseUI {
  detail: any = {};//路由过来的详情
  minerFee: number = 0;//矿工费
  id: boolean = false;//fasle 通证详情 true收藏品详情
  qrcode: string = '';
  block: any;//block 存在  blockNumber不存在  等待中
  status: number = 2;
  showCode: string = '';
  constructor(
    public navCtrl: NavController,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    private clipboard: Clipboard,
    public translate: TranslateService,
    private toastCtrl: ToastController,
  ) {
    super();
    this.detail = this.navParams.get('item');
    console.log(this.detail);
    this.getMinerFee();
    this.getTransactionByHash(this.detail);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TokenrecordPage');
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
  getMinerFee() {
    this.minerFee = this.walletProvider.gasPriceToMoac(this.detail.gas * this.detail.gasprice);
  }
  async getTransactionByHash(detail) {//用hash确定交易记录进度
    let hash = detail.hash || detail.transactionHash
    let result = await this.walletProvider.mc_getTransactionByHash([hash]);
    this.block = result.result;
    if (this.block && this.block.blockNumber) {
      this.status = 1;//交易成功；
    } else if (this.block && !this.block.blockNumber) {
      this.status = 2;//等待中；
    } else {
      this.status = 0;//交易失败；
    }
    let code = this.detail.code;
    this.detail = result.result;
    this.detail.amount = detail.amount;
    this.detail.value = detail.value;
    this.detail.timestamp = detail.timestamp;
    this.detail.code = code;
    console.log(this.detail);
  }
  copy(msg) {
    //复制钱包地址
    this.clipboard.copy(msg).then((res) => {
      // console.log('复制chegngong')
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
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
