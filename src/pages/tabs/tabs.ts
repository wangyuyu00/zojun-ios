import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { WalletProvider } from '../../providers/wallet';
import VConsole from 'vconsole';
// var vConsole = new VConsole();
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = 'AssetPage';
  tab4Root = 'MePage';
  address: string = '';
  system: string = '';

  constructor(private storage: Storage,
    private toastCtrl: ToastController,
    public walletProvider: WalletProvider, ) {

  }

  ionViewDidLoad() {
    console.log('enter tabs ...');
    // this.subscribe();
  }
  async subscribe() {
    this.storage.get('user').then((user) => {
      if (user) {
        this.address = user.address;
        this.system = user.system;
        let that = this;
        // 订阅消息
        this.walletProvider.subscribe(user.address, function (err, data) {
          console.dir(err);
          console.dir(data);
          that.presentToast(data);
        });
      }
    });
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 4000,
      position: 'top',
      cssClass: 'error'
    });

    // toast.onDidDismiss(() => {
    // //   console.log('Dismissed toast');
    // });

    toast.present();
  }
}
