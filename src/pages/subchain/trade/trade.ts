import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { ChargePage } from "../charge/charge";
import { CarryPage } from "../carry/carry";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from "../../../app/app.config";
import { WalletProvider } from "../../../providers/wallet";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
// import { TransferPage } from '../transfer/transfer';
// import { PaymentPage } from '../payment/payment';
/**
 * Generated class for the TradePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-trade",
  templateUrl: "trade.html"
})
export class TradePage extends BaseUI {
  tabs: string = "record";
  subChainInfo: any; //路由传过来的
  user: any;
  page1: any = 0; //交易记录分页
  recordList: any = []; //交易记录
  noData1: boolean = false; //交易记录没有更多
  isToken: boolean = false; //true为是合约子链，false moac子链
  balance: any = 0; //COIN 的余额
  constructor(
    public navCtrl: NavController,
    private http: HttpClient,
    public walletProvider: WalletProvider,
    private storage: Storage,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();
    this.subChainInfo = this.navParams.get("info");
    this.balance = this.navParams.get("value");
    this.isToken = this.subChainInfo.is_token || false;
    this.storage.get("user").then(user => {
      this.user = user;
      this.getRecord();
    });
  }
  ionViewWillEnter() {
    this.getSubChainBalance();
  }

 

  //子链余额
  async getSubChainBalance() {
    this.user = await this.storage.get("user");
    let balance = await this.walletProvider.getSubChainBalance(
      this.user.address,
      this.subChainInfo.MicroChain,
      "http://" + this.subChainInfo.monitor_ip + "/rpc"
    );
    console.log(balance);
    this.balance = balance.result / 1000000000000000000;
  }
  
  doInfinite(event): Promise<any> {
    let that = this;
    if (that.tabs == 'record') {//交易记录
      that.page1++;
      return new Promise((resolve) => {
        if (!that.page1) {
          resolve();
          return;
        }
        that.getRecord();

        event.target.complete();
      })
    }
  }
  jump(item) {
    if (item != "") {
      this.navCtrl.push(item);
    } else {
      //err
    }
  }
  //转账
  toTransfer() {
    this.navCtrl.push("TransferPage", {
      info: this.subChainInfo,
      // balance: this.balance - this.frozen
      balance: this.balance
    });
  }
  
  
  //获取子链交易记录
  getRecord() {
    try {
      let src =
        "http://39.98.62.240:3000/api/accounts/" +
        this.user.address +
        "/scstransaction/" +
        this.subChainInfo.MicroChain +
        "/" +
        this.page1;
      this.http.get(src).subscribe(data => {
        let res = JSON.stringify(data);
        let res1 = JSON.parse(res);
        console.log(res1);
        let result = res1.data.result;
        let list: any = [];
        if (!result || result.length <= 0) {
          if (this.page1 == 0) {
            this.noData1 = true;
          }
          return;
        }
        for (let key in result) {
          if (result[key].shardingFlag == "1") {
            //提币
            result[key].msg =
              this.getResult('subchain.7') + result[key].value / 1000000000000000000 + this.getResult('subchain.33');
            result[key].icon = "../../../assets/imgs/send.png";
          } else if (result[key].shardingFlag == "0") {
            //充币
            result[key].msg =
              this.getResult('subchain.32') + result[key].value / 1000000000000000000 + this.getResult('subchain.33');
            result[key].icon = "../../../assets/imgs/receive.png";
          } else {
            if (result[key].from == this.user.address) {
              //发送
              result[key].msg =
                this.getResult('assets.23') +
                result[key].to.slice(0, 10) +
                "..." +
                result[key].to.slice(-10) +
                result[key].value / 1000000000000000000 +
                this.getResult('subchain.33');
              result[key].icon = "../../../assets/imgs/send.png";
            } else {
              result[key].msg =
                this.getResult('assets.25') +
                result[key].from.slice(0, 10) +
                "..." +
                result[key].from.slice(-10) +
                result[key].value / 1000000000000000000 +
                this.getResult('subchain.33');
              result[key].icon = "../../../assets/imgs/receive.png";
            }
          }
          list.push(result[key]);
        }
        this.recordList = this.recordList.concat(list);
      });
    } catch (e) { }
  }
  doRefresh(refresher) {
    setTimeout(() => {
      this.recordList = []; //交易记录
      this.page1 = 0; //交易记录分页
      this.noData1 = false;
      this.getRecord();
      this.getSubChainBalance();
      refresher.complete();
    }, 1000);
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
