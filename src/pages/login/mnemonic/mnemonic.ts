import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the MnemonicPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mnemonic',
  templateUrl: 'mnemonic.html',
})
export class MnemonicPage extends BaseUI {
  mnemonic: any = [];//助记词
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MnemonicPage');
  }
  ionViewWillEnter() {
    let mnemonicParams = this.navParams.get("mnemonic").split(' ');
    if (!mnemonicParams[0].key) {
      this.mnemonic = mnemonicParams;
    } else {
    }
  }
  jump(item) {
    if (item != '') {
      this.navCtrl.push(item, {
        'mnemonic': this.mnemonic
      });
    } else {
      //err
    }
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
