import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ImportPage } from './import/import';
import { SetpwdPage } from './setpwd/setpwd';
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage extends BaseUI {

  constructor(
      public translate: TranslateService,
      public navCtrl: NavController,
      public navParams: NavParams) {
        super();
  }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }
    jump(item){
        if(item != ''){
            this.navCtrl.push(item);
        }else{
            //err
        }
    }
    getResult(msg){
        return super.getI18n(msg,this.translate)
    }
}
