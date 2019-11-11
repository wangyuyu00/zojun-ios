import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, ToastController, AlertController } from "ionic-angular";
import { TradePage } from "../trade/trade";
import { WalletProvider } from "../../../providers/wallet";
import { Storage } from "@ionic/storage";
import { Clipboard } from '@ionic-native/clipboard';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the SubchaindetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-subchaindetails",
  templateUrl: "subchaindetails.html"
})
export class SubchaindetailsPage extends BaseUI {
  user: any;
  tabs: string = "assets";
  detail: any; //路由过来的详情
  balance: any; //COIN 的余额
  frozen: any;//提币中冻结的
  subChainInfo: any = {}; //底层拉取的 跟detail拼在一起的
  constructor(
    private clipboard: Clipboard,
    public navCtrl: NavController,
    private storage: Storage,
    public walletProvider: WalletProvider,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public translate: TranslateService
  ) {
    super();
    this.detail = this.navParams.get("detail");
    console.log(this.detail)
    this.getSubChainInfo();
    // this.getExchangeRedeeming();
  }
  ionViewWillEnter() {
    this.getSubChainBalance();
    // this.getExchangeRedeeming();
  }
  //获取提币中的资产（在可用里面减去）
  async getExchangeRedeeming() {
    this.user = await this.storage.get("user");
    let frozen: any = await this.walletProvider.getExchangeRedeeming(
      this.user.address,
      this.detail.subchain_address,
      "http://" + this.detail.monitor_ip + "/rpc"
    );
    console.log(frozen)
    if (frozen.code == 1) {
      this.frozen = frozen.value / 1000000000000000000
      console.log(this.frozen)
    } else {
      this.frozen = 0
    }
  }
  //子链余额
  async getSubChainBalance() {
    this.user = await this.storage.get("user");
    let balance = await this.walletProvider.getSubChainBalance(
      this.user.address,
      this.detail.subchain_address,
      "http://" + this.detail.monitor_ip + "/rpc"
    );
    console.log(balance);
    this.balance = balance.result / 1000000000000000000;
  }
  //底层拉去子链详情
  async getSubChainInfo() {
    let info = await this.walletProvider.getSubChainInfo(
      this.detail.subchain_address,
      "http://" + this.detail.monitor_ip + "/rpc"
    );
    this.subChainInfo = {
      name: this.detail.name,
      MicroChain: this.detail.subchain_address,
      sender: info.result.Sender,
      is_token: this.detail.is_token,
      erc20_address: this.detail.erc20_address,
      rpc: this.detail.rpc,
      dapp_base_address: this.detail.dapp_base_address,
      monitor_ip: this.detail.monitor_ip,
      vnode_ip: this.detail.vnode_ip,
      erc20_symbol: this.detail.erc20_symbol,//代币名称
      proportion: this.detail.proportion,//代币名称
      icon: this.detail.token_icon || '',//代币图标
      vnode_protocol_address: this.detail.vnode_protocol_address,
      balance: info.result.Balance,
      ScsCount: info.result.ScsList.length || 0,
      blockReward: info.result.BlockReward,
      viaReward: info.result.ViaReward,
      txReward: info.result.TxReward
    };
    console.log(this.subChainInfo);
  }
  toRecorddetails() {
    this.navCtrl.push("RecorddetailsPage", {
      detail: this.detail
    });
  }
  toTrade(val) {
    this.navCtrl.push("TradePage", {
      info: this.subChainInfo,
      value: val
    });
  }
  copy(msg) {
    //复制钱包地址
    this.clipboard.copy(msg).then((res) => {
      // console.log('复制chegngong')
      this.presentToast(this.getResult('assets.30'));
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
  jump(item) {
    if (item != "") {
      this.navCtrl.push(item);
    } else {
      //err
    }
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
