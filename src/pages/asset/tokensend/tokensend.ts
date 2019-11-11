import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { WalletProvider } from '../../../providers/wallet';
import { Storage } from "@ionic/storage";
import { AppConfig } from '../../../app/app.config';
import { Md5 } from 'ts-md5/dist/md5';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ContactslistPage } from '../../me/contactslist/contactslist';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../common/baseui";
/**
 * Generated class for the TokensendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tokensend',
  templateUrl: 'tokensend.html',
})
export class TokensendPage extends BaseUI {
  token: any = {};//路由传过来的token
  amount: string = '';//要转出金额
  address: string = '';//接收方地址
  saturation: number = 10000;
  gas: number = 0;//
  moac: number = 0;
  sendResult1: any;
  user: any = {};
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public walletProvider: WalletProvider,
    public translate: TranslateService,
    private barcodeScanner: BarcodeScanner,
    private storage: Storage) {
    super();
    this.token = this.navParams.get('token');
    console.log('token', this.token);
    this.estimateGas();
  }
  ionViewDidEnter() {

    if (this.navParams.get('contsItem')) {
      this.address = this.navParams.get('contsItem').address || '';
    } else {
      //   console.log(this.navParams.get('contact'))
    }
  }
  async next() {//点击下一步
    if (this.amount == '') {
      this.errorMsg('请输入转账金额');
      return
    }
    if (Number(this.amount) > this.token.value) {
      this.errorMsg('可用余额不足');
      return
    }
    if (this.walletProvider.isValidAddress(this.address.replace(/\s+/g, "")) == false) {
      this.errorMsg('地址无效');
      return
    }
    this.user = await this.storage.get('user');
    let that = this;
    let prompt = this.alertCtrl.create({
      title: '请输入密码',
      message: '',
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: '请输入密码',
        },
      ],
      buttons: [
        {
          text: '取消',
          handler: data => {
          }
        },
        {
          text: '确定',
          handler: async function (data) {
            if (Md5.hashStr(data.password) == that.user.pwd) {
              if (that.user) {
                let secret = AppConfig.secretDec('moac', that.user.pwd, that.user.secret);
                let address = that.address.replace(/\s+/g, "");
                let amount = that.amount;
                let option = {
                  'assetCode': that.token.code,
                  'gasPrice': that.gas,
                  'gasLimit': that.saturation,
                };
                let sendResult = await that.walletProvider.sendTransaction(secret, address, amount, option);
                let sendResult1 = await that.walletProvider.mc_getTransactionByHash([sendResult]);
                console.log('sendResult', sendResult);
                that.sendResult1 = sendResult1.result;
                console.log('sendResult1', that.sendResult1);
                //将 that.sendResult1 存本地 ，用户点交易记录时候 用 hash 调 mc_getTransactionByHash  如果blockNumber 为null等待中   有数字为成功 啥都没有了 就是失败了
                if (sendResult) {
                  that.errorMsg('交易请求已经提交给区块链网络，请等待正式生效。');

                  that.storage.get('record').then((R) => {
                    if (R) {
                      let record = that.sendResult1;
                      record.timestamp = new Date().getTime() / 1000;
                      record.amount = that.amount;
                      that.sendResult1 = R;
                      if (that.sendResult1.length > 100) {
                        that.sendResult1.shift().push(record);
                      } else {
                        that.sendResult1.push(record);
                      }
                      that.storage.set('record', that.sendResult1);
                    } else {
                      that.sendResult1.timestamp = new Date().getTime() / 1000;
                      that.sendResult1.amount = that.amount;
                      that.storage.set('record', [that.sendResult1]);
                    }
                    that.amount = '';
                    that.address = '';
                  })
                } else {
                  that.errorMsg('请求失败');
                }
              }
            } else {
              that.errorMsg('密码输入错误');
            }
          }
        }
      ]
    });
    prompt.present();

  }
  async estimateGas() {// 获得建议手续费gas
    this.saturation = await this.walletProvider.estimateGas('');
    console.log('gasPrice', this.saturation)
    this.gasPrice();
  };
  gasPrice() {//矿工费
    this.gas = this.walletProvider.gasPrice();
    this.moac = this.walletProvider.gasPriceToMoac(this.gas * this.saturation);
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      title: '提示',
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
      ]
    });
    prompt.present();
  }
  Scan() {//扫码
    this.barcodeScanner.scan().then((barcodeData) => {
      if (barcodeData.cancelled) {
        return false;
      }
      if (barcodeData) {
        this.address = barcodeData.text;
      }
    }).catch(err => {
      console.log(err)
    });
  }
  ionViewDidLoad() {
    // console.log('ionViewDidLoad TokensendPage');
  }
  toCont() {//去联系人选择
    this.navCtrl.push('ContactslistPage', {
      'send': true,
      'sendpage': 'TokensendPage',
      'token': this.token
    })
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
