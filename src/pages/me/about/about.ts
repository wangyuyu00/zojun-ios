import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage extends BaseUI {

  constructor(
    public translate: TranslateService,
    public navCtrl: NavController, 
		private http: HttpClient,
    private platform: Platform, 
    public navParams: NavParams) {
    super();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
    // this.version()
  }
  getResult(msg){
    return super.getI18n(msg,this.translate)
}
  // version(){
  //   let that = this;
  //   this.http
  //     .get('http://api.fir.im/apps/latest/vip.trusting.wallet?api_token=2778992a28bc5a7f4c1e6cd555d9e371&type=android', {})
  //     .subscribe(
  //       data => {
  //         console.log(data)
  //         console.log(that.platform)
  //       }
  //     );
  // }
}
