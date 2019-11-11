import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the MePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-me',
  templateUrl: 'me.html',
})
export class MePage extends BaseUI {

  constructor(
    public translate: TranslateService,
    public navCtrl: NavController,
    public navParams: NavParams) {
    super();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MePage');
  }
  jump(item) {
    if (item != '') {
      this.navCtrl.push(item);
    } else {
      //err
    }
  }
  ionViewDidEnter() {
    //进入显示TabBars
    let elements = document.querySelectorAll(".tabbar");
    if (elements != null) {
      Object.keys(elements).map((key) => {
        elements[key].style.display = 'flex';
      });
    }
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
