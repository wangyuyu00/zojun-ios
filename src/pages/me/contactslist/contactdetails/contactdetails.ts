import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,ToastController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { Clipboard } from '@ionic-native/clipboard';
import { BaseUI } from "../../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the ContactdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contactdetails',
  templateUrl: 'contactdetails.html',
})
export class ContactdetailsPage extends BaseUI {
  contacts: any=[];
  name: string ='';//名称
  address: string = '';//密码
  qrcode: string = '';
  showCode: string = '';
  constructor(
    public translate: TranslateService,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private clipboard:Clipboard,
    public alertCtrl:AlertController,
    private toastCtrl: ToastController,
    private storage:Storage) {
      super();
      let p = this.navParams.get('item');
      this.contacts = p;
      this.contacts=this.navParams.get('item');
      this.name=this.contacts.name;
      console.log('contact',this.contacts);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ContactdetailsPage');
  }

  addContacts(){

    this.storage.get('contacts').then((c) => {
        if (c) {

            let contacts = c;
            contacts.push({
                'name': this.name,
                'address': this.address,
            })
            this.storage.set('contacts', contacts);
        } else {
            let contact: any = [{
                'name': this.name,
                'address': this.address,
            }]
            this.storage.set('contacts', contact);
        }
        this.name='';
        this.address='';
        this.navCtrl.pop();
    });
        
  }



  deleteWallet(){
    //删除联系人
    let prompt = this.alertCtrl.create({
      title:'',
      message: this.getResult("me.10"),
    buttons: [
      {
        text:this.getResult("assets.9"),
        handler: data => {
        }
      },
      {
        text:this.getResult("assets.10"),
        handler: data => {
                let that = this;
                this.storage.get('contacts').then((p)=>{
                  let contacts = p;
                  console.log(contacts)
                    for(let key in p){
                        if(that.contacts.name==p[key].name){
                            p.splice(key,1);
                        }
                    }
                    this.storage.set('contacts',p).then((p)=>{
                        this.name='';
                        this.address='';
                        this.navCtrl.pop();
                        
                    });
                })
          
        }
      }
    ]
  });
  prompt.present();
}

copy(msg){
  //复制钱包地址
  this.clipboard.copy(msg).then((res) =>{
      // console.log('复制chegngong')
      this.presentToast(this.getResult("assets.30"));
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

message(msg){//错误提示
  let prompt = this.alertCtrl.create({
  title: this.getResult("assets.1"),
  message: msg,
  buttons: [
    {
      text: this.getResult("assets.10"),
      handler: data => {
          return
      }
    }
  ]
});
prompt.present();
}
ionViewDidEnter() {
    let img = document.getElementsByClassName('qrcode').item(0).innerHTML;
    if(img==''){
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
getResult(msg){
  return super.getI18n(msg,this.translate)
}
}

