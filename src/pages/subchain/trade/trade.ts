import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
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
  page2: any = 1; //充币记录分页
  page3: any = 1; //提币记录分页
  recordList: any = []; //交易记录
  depositList: any = []; //充币记录
  EnteringDepositList: any = []; //充币记录暂未到账的
  withdrawList: any = []; //提币记录
  EnteringWithdrawList: any = []; //提币记录暂未到账的
  noData1: boolean = false; //交易记录没有更多
  noData2: boolean = false; //充币记录没有更多
  noData3: boolean = false; //提币记录没有更多
  authorizeVal: any = 0; //授权余额
  isToken: boolean = false; //true为是合约子链，false moac子链
  balance: any = 0; //COIN 的余额
  frozen: any = 0;//提币中冻结的
  frozenList: any = [];//提币中冻结的交易记录列表
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
      this.getAllowance();
      this.getDepositList();
      this.getWithdrawList();
    });
  }
  ionViewWillEnter() {
    this.getFrozenList();
    setTimeout(() => {
      this.getSubChainBalance();
      this.spliceFrozenList();
    }, 10000);
  }

  //获取正在提交区块打包的交易记录
  getFrozenList() {
    let value: any = 0;//冻结金额累计
    this.storage.get('frozen').then((f) => {
      if (f) {
        this.frozenList = f;
        // for (let key in this.frozenList) {
        //   if (this.frozenList.length > 0) {
        //     value = value + this.frozenList[key].amount;
        //   }
        // }

        // this.frozen = value;
      } else {
        this.frozenList = [];
      }
    })
  }
  //使用getReceiptByHash(hash, subchainAddr, rpc)查 状态未知的是否需要解除
  async spliceFrozenList() {
    let arr = await this.storage.get('frozen');
    let result: any = [];
    let value: any = 0;//冻结金额累计
    if (arr && arr.length > 0) {
      for (let key in arr) {
        let res: any = await this.walletProvider.getReceiptByHash(arr[key].hash, this.subChainInfo.MicroChain,
          "http://" + this.subChainInfo.monitor_ip + "/rpc");
        console.log('resres', res);
        if (res && res.result && res.result.failed == false) {

        } else {
          result.push(arr[key]);
          value = value + arr[key].amount;
        }
      }
    }
    this.frozenList = result;
    // this.frozen = value;
    this.storage.set('frozen', this.frozenList);
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
  async getDepositList() {//获取充币记录
    let res = await this.walletProvider.getExchangeEnter(this.user.address, this.subChainInfo.MicroChain, this.page2,
      "http://" + this.subChainInfo.monitor_ip + "/rpc");
    if (res && res.result) {
      if (res.result.EnterRecords && res.result.EnterRecords.length > 0) {
        this.noData2 = false;
        // this.depositList = res.result.EnterRecords;
        this.depositList = this.depositList.concat(res.result.EnterRecords);
        console.log('this.depositList', this.depositList)
      } else {
        if (this.page2 == 1) {
          this.depositList = [];
        }
      }
      if (res.result.EnteringRecords && res.result.EnteringRecords.length > 0) {
        this.EnteringDepositList = res.result.EnteringRecords;
      } else {
        if (this.page2 == 1) {
          this.EnteringDepositList = [];
        }
      }

      if (this.page2 == 1 && this.EnteringDepositList.length == 0 && this.depositList.length == 0) {
        this.noData2 = true;
      }
    }
  }
  async getWithdrawList() {//获取提币记录
    let res = await this.walletProvider.getExchangeRedeem(this.user.address, this.subChainInfo.MicroChain, this.page3,
      "http://" + this.subChainInfo.monitor_ip + "/rpc");
    console.log(res);
    if (res && res.result) {
      if (res.result.RedeemRecords && res.result.RedeemRecords.length > 0) {
        this.noData3 = false;
        // this.depositList = res.result.EnterRecords;
        this.withdrawList = this.withdrawList.concat(res.result.RedeemRecords);
      } else {
        if (this.page3 == 1) {
          this.withdrawList = [];
          // this.noData3 = true;
        }
      }

      if (res.result.RedeemingRecords && res.result.RedeemingRecords.length > 0) {
        this.EnteringWithdrawList = res.result.RedeemingRecords;
      } else {
        if (this.page3 == 1) {
          this.EnteringWithdrawList = [];
        }
      }

      if (this.page3 == 1 && this.EnteringWithdrawList.length == 0 && this.withdrawList.length == 0) {
        this.noData3 = true;
      }
    }
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
    } else if (that.tabs == 'charge') {//充币记录
      that.page2++;
      return new Promise((resolve) => {
        if (!that.page2) {
          resolve();
          return;
        }
        that.getDepositList();
        event.target.complete();
      })
    } else {//提币记录
      that.page3++;
      return new Promise((resolve) => {
        if (!that.page3) {
          resolve();
          return;
        }
        that.getWithdrawList();
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
  //授权
  toAuthorize() {
    this.navCtrl.push("AuthorizePage", {
      info: this.subChainInfo
    });
  }
  //充币
  toCharge() {
    this.navCtrl.push("ChargePage", {
      info: this.subChainInfo,
      authorizeVal: this.authorizeVal
    });
  }
  //提币
  toWithdraw() {
    this.navCtrl.push("CarryPage", {
      info: this.subChainInfo,
      // balance: this.balance - this.frozen
      balance: this.balance
    });
  }
  //转账
  toTransfer() {
    this.navCtrl.push("TransferPage", {
      info: this.subChainInfo,
      // balance: this.balance - this.frozen
      balance: this.balance
    });
  }
  //to子链详情
  toDetail(item) {
    item.status = "1";
    this.navCtrl.push("SubrecorddetailPage", {
      item: item
    });
  }
  //查询授权额度
  async getAllowance() {
    let authorizeVal = await this.walletProvider.allowance(
      this.user.address,
      this.subChainInfo.erc20_address,
      this.subChainInfo.MicroChain
    );
    this.authorizeVal = authorizeVal.balance;
    console.log("授权额度", this.authorizeVal);
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
      this.depositList = []; //充币记录
      this.EnteringDepositList = []; //充币记录暂未到账的
      this.withdrawList = []; //提币记录
      this.page1 = 0; //交易记录分页
      this.page2 = 1; //充币记录分页
      this.page3 = 1; //提币记录分页
      this.noData1 = false;
      this.noData2 = false;
      this.noData3 = false;
      this.getRecord();
      this.getAllowance();
      this.getDepositList();
      this.getWithdrawList();
      this.getFrozenList();
      this.getSubChainBalance();
      this.spliceFrozenList();
      refresher.complete();
    }, 1000);
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
