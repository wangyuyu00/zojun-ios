import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,AlertController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { BaseUI } from "../../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the AddcontactPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addcontact',
  templateUrl: 'addcontact.html',
})
export class AddcontactPage extends BaseUI {
  name: string = '';//名称
  address: string = '';//联系人地址
  constructor(
    public translate: TranslateService,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
    public alertCtrl:AlertController,
    private storage: Storage) {
      super();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddcontactPage');
  }
  addContacts(){
    if(this.name == ""){
        this.errorMsg(this.getResult("me.14"));
        return
    }
    if(this.address == ""){
      this.errorMsg(this.getResult("me.15"));
      return
  }
    this.storage.get('contacts').then((c) => {
        if (c) {
          for(let key in c){
            if(c[key].name==this.name){
              this.errorMsg(this.getResult("me.16"));
              return
            }
          }
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
  errorMsg(msg){
    //错误提示
    let prompt = this.alertCtrl.create({
        title:this.getResult("assets.1"),
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
Scan(){//扫码
  this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        return false;
      }
      if(barcodeData){
          this.address=barcodeData.text;
      }
    }).catch(err=>{
      console.log(err)
    });
}
getResult(msg){
  return super.getI18n(msg,this.translate)
}
}
