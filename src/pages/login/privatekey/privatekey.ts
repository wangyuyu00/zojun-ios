import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController  } from 'ionic-angular';
import { AssetPage } from '../../asset/asset';
import { Clipboard } from '@ionic-native/clipboard';
import { TabsPage } from '../../tabs/tabs';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the PrivatekeyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-privatekey',
  templateUrl: 'privatekey.html',
})
export class PrivatekeyPage extends BaseUI{
  secret:string='';
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private clipboard:Clipboard,
    public translate: TranslateService,
    public alertCtrl:AlertController,
    private toastCtrl: ToastController,
    ) {
        super();
      this.secret = this.navParams.get('secret');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PrivatekeyPage');
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
  jump(item){
      if(item != ''){
          this.navCtrl.push(item);
      }else{
          //err
      }
  }
  toAssets(){
      this.navCtrl.setRoot(TabsPage);
  }
  getResult(msg){
    return super.getI18n(msg,this.translate)
}
}
