import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the AddsubchainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addsubchain',
  templateUrl: 'addsubchain.html',
})
export class AddsubchainPage extends BaseUI{

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public translate: TranslateService
     ) {
      super();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddsubchainPage');
  }
  ionViewDidEnter() {
    //进入隐藏TabBars
    let elements = document.querySelectorAll(".tabbar");
    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'none';
      });
    }
  }
  ionViewWillLeave() {
    //离开显示TabBars
    let elements = document.querySelectorAll(".tabbar");
    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'flex';
      });
    }
  }
  getResult(msg){
    return super.getI18n(msg,this.translate)
}
}
