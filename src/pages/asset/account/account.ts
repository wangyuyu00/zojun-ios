import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Clipboard } from '@ionic-native/clipboard';
import { Md5 } from 'ts-md5/dist/md5';
import { AppConfig } from '../../../app/app.config';
import { PrivatekeyPage } from '../../login/privatekey/privatekey';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../common/baseui";
/**
 * Generated class for the AccountPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage extends BaseUI {
  user: any = {}
  qrcode: string = '';
  showCode: string = '';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public translate: TranslateService,
    private clipboard: Clipboard,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController) {
    super();
    this.getUser();
  }
  modifyName() {//修改名称
    let prompt = this.alertCtrl.create({
      title: '修改钱包名称',
      // message: '44554',
      inputs: [
        {
          name: 'username',
          placeholder: '请输入钱包名称'
        }
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确定',
          handler: data => {
            if (data.username == '') {
              this.errorMsg('钱包名称不能为空');
              return
            }
            if (data.username.length > 8) {
              this.errorMsg('钱包名称最多为8位');
              return
            }
            if (data.username == this.user.name) {
              this.errorMsg('保存成功');
              this.navCtrl.pop();
            }
            this.storage.get('pockets').then((p) => {
              let po = p;
              for (let key in po) {
                if (po[key].name == this.user.name) {
                  po[key].name = data.username;
                  this.storage.set('user', po[key]);
                }
              }
              this.storage.set('pockets', po);
            })
            this.presentToast('修改成功');
            this.navCtrl.popToRoot();
            return
          }
        }
      ]
    });
    prompt.present();
  }
  modifyPwd() {//修改密码
    let prompt = this.alertCtrl.create({
      title: '修改钱包密码',
      inputs: [
        {
          name: 'oldpwd',
          type: 'password',
          placeholder: '请输入旧密码'
        }, {
          name: 'pwd1',
          type: 'password',
          placeholder: '请输入新密码'
        }, {
          name: 'pwd2',
          type: 'password',
          placeholder: '请确认新密码'
        }
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确定',
          handler: data => {
            if (Md5.hashStr(data.oldpwd) != this.user.pwd) {
              this.errorMsg('旧密码输入错误');
              return
            }
            if (data.pwd1 == '') {
              this.errorMsg('新密码不能为空');
              return
            }
            if (data.pwd1 != data.pwd2) {
              this.errorMsg('两次密码不一致');
              return
            }
            this.storage.get('pockets').then((p) => {
              let po = p;
              for (let key in po) {
                if (po[key].name == this.user.name) {
                  let secret = AppConfig.secretDec('moac', this.user.pwd, po[key].secret);
                  secret = AppConfig.secretEnc('moac', Md5.hashStr(data.oldpwd), secret);
                  po[key].pwd = Md5.hashStr(data.pwd2);
                  po[key].secret = secret;
                  this.storage.set('user', po[key]);
                }
              }
              this.storage.set('pockets', po);
            })
            this.presentToast('修改成功');
            this.navCtrl.popToRoot();
            return
          }
        }
      ]
    });
    prompt.present();
  }
  savePrivate() {//备份私钥
    let prompt = this.alertCtrl.create({
      title: '请输入密码',
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: '请输入密码',
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确定',
          handler: data => {
            if (Md5.hashStr(data.password) == this.user.pwd) {
              let secret: any;
              if (AppConfig.secretDec('moac', this.user.pwd, this.user.secret)) {
                secret = AppConfig.secretDec('moac', this.user.pwd, this.user.secret);
              }
              this.navCtrl.push('PrivatekeyPage', {
                'secret': secret
              });
            } else {
              this.errorMsg('密码输入错误');
            }
          }
        }
      ]
    });
    prompt.present();
  }
  deleteWallet() {//删除钱包
    let prompt = this.alertCtrl.create({
      title: '请输入密码',
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: '请输入密码',
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确定',
          handler: data => {
            if (Md5.hashStr(data.password) == this.user.pwd) {
              //删除操作
              this.storage.get('pockets').then((p) => {
                let poc: any = [];
                if (p) {
                  for (let key in p) {
                    if (p[key].name == this.user.name && p[key].address == this.user.address && p[key].secret == this.user.secret) {

                    } else {
                      poc.push(p[key]);
                    }
                  }
                }
                this.storage.set('pockets', poc).then(() => {
                  this.storage.set('user', poc[0]);
                  this.navCtrl.popToRoot();
                })
              })
            } else {
              this.errorMsg('密码输入错误');
            }
          }
        }
      ]
    });
    prompt.present();
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
  ionViewDidLoad() {
    console.log('ionViewDidLoad AccountPage');
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
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
