import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MnemonicPage } from '../mnemonic/mnemonic';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the BackupsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-backups',
  templateUrl: 'backups.html',
})
export class BackupsPage extends BaseUI{
  mnemonic:string='';//助记词

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public translate: TranslateService
    ) {
      super();
    this.mnemonic = this.navParams.get("mnemonic");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BackupsPage');
  }
  toMnemonic(item){
    if(item != ''){
        this.navCtrl.push(item,{
          'mnemonic':this.mnemonic
        });
    }else{
        //err
    }
}
getResult(msg){
  return super.getI18n(msg,this.translate)
}
}
