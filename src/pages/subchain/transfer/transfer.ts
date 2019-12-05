
import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  AlertController, Platform
} from "ionic-angular";
import { WalletProvider } from "../../../providers/wallet";
import { Storage } from "@ionic/storage";
import { Md5 } from "ts-md5/dist/md5";
import { AppConfig } from "../../../app/app.config";
import { HttpClient } from "@angular/common/http";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';
const NodeRSA = require('node-rsa');
/**
 * Generated class for the TransferPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-transfer",
  templateUrl: "transfer.html"
})
export class TransferPage extends BaseUI {
  @ViewChild('pwdID') myInput;
  value: any; //路由过来的余额
  amount: any; //提币数量
  toAddr: string; //接收方地址
  pwd: any = ""; //密码pwd1: string;
  user: any;
  disEnter: boolean = false;//中君扫码禁用输入框
  b_public_key_data: any = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZDDgxi/8JsgWSOqAhTJtqz27bdFQgzdYN37rqkmuZJYKbLp/C7vT6x1IwC8N4sFNb8Eq1NZRWOpVQWkazIi/DndubJb12ahc6QIUI7fWcJfjAUAuCrCLgAlte69S0mTEx8RLZo3ZnUwS9VyKGLzNGAqrseaJYqRp7bcc/e2VkewIDAQAB-----END PUBLIC KEY-----';
  b_private_key_data: any = '-----BEGIN PRIVATE KEY-----MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJkMODGL/wmyBZI6oCFMm2rPbtt0VCDN1g3fuuqSa5klgpsun8Lu9PrHUjALw3iwU1vwSrU1lFY6lVBaRrMiL8Od25slvXZqFzpAhQjt9Zwl+MBQC4KsIuACW17r1LSZMTHxEtmjdmdTBL1XIoYvM0YCqux5olipGnttxz97ZWR7AgMBAAECgYAaQD9POE0Jc7CC8W1P6NzriCLin2RisAucG5jq7Sxpe0aYqXmbrPL2JMQTG6FujQfvSBr4U/VaiPfdbW6dASsh5UaZw5YvdWeVGbjvWZPQfQJ57YyvypI2YnG4lULLvkVYEmzXPQp0EemXO1nm/dvcbqnj5RC6QexliKgMRD0jgQJBANeDSr2hdv4fnfhmdunJ0Uhe7kw4SS5Y+M1ccNNyuB+rcMQR8uuFPPja3OxfhJAvxRgZ6KoKVZau9cB3vyMsvjsCQQC1zMc8aFtv5/nl07YZ3ugcdRCelOhjWSa1RzDMz4z+3GanwZM1tLLTvNrz4Sx8oO6bCHkwHh6RXnCKrmDu3E7BAkAbvba9Oi+K/p7i/q2H4oah/jZGcWhaIvHD3YZYcYfp67OUSYsvbfMvRVzywEjcFooUVCFy4emqf9L6d2+PI49JAkEAp4IcXXOGNJEYt4OfuSyiz32pp4Rqrwd42/TRaRUfw8COManxmr15PBE56RYjqF2cHGrtRsGpxqWuqolLtSp2wQJAIqeq5pHT3nZcih0nhk6b8suk6uqsOXjAGIRvFKxq1TA8M2dAEkJeDVxiOPduviz/Usbp/KhQVAL7cq1rSYoDnQ==-----END PRIVATE KEY-----';

  a_public_key_data: any = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2/fxN1X/ArB/EDDU2eu2bwH4f8ly7x4vXb7eQYqEPRKGZrj5zXoX0LUO+N8NS520X9kehW6GzlWEJDQf/5W+X391YZArKgycDyHyWqb4LNeP6H8eRWyOZqOT2eZIuh7rqYMSIWSHFzs0IKy/xeNqvTM66Nb+YOSiEO42NMRxGPQIDAQAB-----END PUBLIC KEY-----';
  a_private_key_data: any = '-----BEGIN PRIVATE KEY-----MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALb9/E3Vf8CsH8QMNTZ67ZvAfh/yXLvHi9dvt5BioQ9EoZmuPnNehfQtQ743w1LnbRf2R6FbobOVYQkNB//lb5ff3VhkCsqDJwPIfJapvgs14/ofx5FbI5mo5PZ5ki6HuupgxIhZIcXOzQgrL/F42q9Mzro1v5g5KIQ7jY0xHEY9AgMBAAECgYBEUzUfgrX+pMX/l2dO/js1ynvNRdsmKe2m9QmfGZR1dPS5wvuCbCqr7zK6FWwSymJLbiN0thf8S6w9iuYPwAUYGFXQQDuge8XyjpIKyeuOv1um9SBvxaS66KlmShGSX+yxj//KtepNL4lokwSlw9sT5jlCWdsCaS6vS6UDvM3HKQJBANone/wfAvkDZiKdsqcwwgchcu3ZOwa8Yncht2CTUZxFUy//rObHEq9mY+uQCU6rEUbymhiOXQREs5vIMF95VU8CQQDWvOf0jLdUgeo5CnXTqJWLTPnj1GHxAswtOBLkRQPdIu1IpkfKxEob4Ss+NcDdc07AMXIfcBU6cbFXBDPaOGCzAkEAqA9y/LAHYj60GEbUsuhlEYk7OPD5AB9w28Ylt0jGvlTJ2VhmowMJ6gY/Q+IayXgQP0/2VqSWFAu5MnHukh6vEQJAMvX30jiG1X5TWKAb4FQ00S8+aowfhjPUwrJ5AUVDqno8d65GgV9d+wnP2l6lW6ieusvBOqa90vXiUTVFHPeeMwJAAPEsulihaWlNZBG2yDNXvs2VvASJcUUsAkOPxLM64fNf59DnXBfit7Z+q3TUXDp3tUff/4ufxerdQjSfYd83aQ==-----END PRIVATE KEY-----';
  parameter: any;//存在本地的中君的请求参数 解密的
  checkorderdetails: any = {};//订单校验返回的收款地址 截止时间 appName
  notifyOrderPay: string = '';//回调通知的接口名称
  info: any = {
    MicroChain: "0x1a57f5ee58a0de2c7065bc2c6b6f33a22b591b2b",
    ScsCount: 9,
    balance: 10000000000000000000000000000,
    blockReward: 495420912933712,
    sender: "0x6f0d5b8df93b93d56596718e6f3172722b0c9332",
    txReward: 99084182643,
    viaReward: 9908418258673136,
    dapp_base_address: "0x2180fc09aab3cd89a5b71ce175ef79eb72d75c79",
    describe: "中君子链",
    erc20_address: "0x35c8a6273d8206e7cb1a873afcd1b4ae2a8d9e98",
    erc20_symbol: "TCNY",
    icon: "http://pics.coinpany.cn/70e3a14f-13e1-4270-bef6-9afa725e4bf3.png",
    id: 2,
    is_token: 1,
    main_account: "",
    monitor_ip: "47.56.191.157:50068",
    name: "中君子链",
    proportion: "1:1",
    rpc: "",
    subchain_address: "0x1a57f5ee58a0de2c7065bc2c6b6f33a22b591b2b",
    token_icon: "",
    updatedAt: 1574923077979,
    vnode_ip: "",
    vnode_protocol_address: "",
};

  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    public walletProvider: WalletProvider,
    private barcodeScanner: BarcodeScanner,
    public navParams: NavParams,
    private http: HttpClient,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translate: TranslateService
  ) {
    super();
    // this.value = this.navParams.get("balance") || 0;
    // this.info = this.navParams.get("info");
    console.log(this.info);
    this.storage.get("user").then(user => {
      this.user = user;
    });
    this.getSubChainBalance();

  }
  enterPwd() {
    if (!this.amount) {
      this.errorMsg("请输入转账数量");
      return;
    }
    if (!this.toAddr) {
      this.errorMsg("请输入转账地址");
      return;
    }
    if (this.amount > this.value) {
      this.errorMsg("可用余额不足");
      return;
    }
    let prompt = this.alertCtrl.create({
      title: "请输入密码",
      inputs: [
        {
          type: 'password',
          name: 'password',
          placeholder: "请输入密码",
        },
      ],
      buttons: [
        {
          text: "取消",
          handler: data => {
          }
        },
        {
          text: "确定",
          handler: data => {
            this.pwd = data.password;
            this.Send();
          }
        }
      ]
    });
    prompt.present();
  }
  //转账
  async Send() {
    let secret = AppConfig.secretDec('moac', this.user.pwd, this.user.secret);
    if (Md5.hashStr(this.pwd) == this.user.pwd) {
			let mome:string = this.parameter.orderNo+'&'+this.amount+this.user.address+'&'+this.toAddr;
      let res = await this.walletProvider.SubChainSend(
        secret,
        this.toAddr,
        this.amount,
        this.info.MicroChain,
        "http://" + this.info.monitor_ip + "/rpc",
        mome
      );
      console.log(res);
      if (res) {
        // this.amount = "";
        // this.toAddr = "";
        // this.pwd = "";
        // this.navCtrl.pop();
        if (this.disEnter == false) {
          this.amount = "";
          this.toAddr = "";
          this.pwd = "";
        }
        //像墨客数据库提交订单信息
        // this.http
        // 	.post("墨客存储订单信息接口", {})
        // 	.subscribe(
        // 		data => {
        // 			let res = JSON.stringify(data);
        // 			let res1 = JSON.parse(res);

        // 			return res1;
        // 		}
        // 	);
        this.presentToast("交易请求已经提交给区块链网络，请等待正式生效。");
        //获取回调地址
        this.checkOrderPay();
        //异步回调

        //同步回调
        // this.turnApp();
      } else {
        this.errorMsg("提交失败 请稍后再试");
      }
    } else {
      this.pwd = '';
      this.errorMsg("密码输入错误");
    }
  }
  errorMsg(msg) {
    //错误提示
    let prompt = this.alertCtrl.create({
      title: "提示",
      message: msg,
      buttons: [
        {
          text: "OK",
          handler: data => { }
        }
      ]
    });
    prompt.present();
  }
  presentToast(msg) {
    //自动消失弹框
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 1000,
      position: "top",
      cssClass: "toast"
    });

    toast.onDidDismiss(() => {
      //   console.log('Dismissed toast');
    });

    toast.present();
  }

  toCont() {
    //去联系人选择
    this.navCtrl.push("ContactsPage", {
      send: true,
      sendpage: "TokensendPage",
      token: this.info
    });
  }
  ionViewDidEnter() {
    if (this.navParams.get("contsItem")) {
      this.toAddr = this.navParams.get("contsItem").address || "";
    } else {
      //   console.log(this.navParams.get('contact'))
    }
  }
  Scan() {
    //扫码
    this.barcodeScanner
      .scan()
      .then(barcodeData => {
        if (barcodeData.cancelled) {
          return false;
        }
        if (barcodeData) {
          // let result = JSON.parse(barcodeData.text);
          let result = { "sign": "M7D//ZzFHEKBAeecICS47IfSV83yvcbmqfScc0PzsuPxOgU1OZsQHPvvql2a9PrIK+aw2z9rLnHHD0zrKbZ6Njno8fHopvtlth9/wZ+rSSyqpN+rA2LWiJLCdT1H/SLrgjXV3Dx39v08+epQ3xNTK3gXKIEJOG0Rzx+jpuKflAQ=", "secret": "bMZ+VaCw+kjPRze0ZNu/MPoeoIPxYoSblVGUJYdFj4pOxRcy7uklnE64t7diENP3Kk5UaXjazzwwms2VGAsalL9K5xrWKTEtBl+CLAenIwAU5C91grycWkg/hYOagjwll1cP0Aqz8aaI3mpB+eLyYYg9CxPyc0j+/FG4Ud8LnrWSkTslk45jee/Tr6o9jMapOttilfrv38MpM807Zt07lb6uXPAfiFxo233cZCyJ0ld9vK3zreEeaV4K9DCHaI7mNwfUNWb9Jbyoe1R2KTRPk3PdPLh+s4PbuWldRTOffs5Uc7Hcwpv24iL6jet2EdYbdTOneO27HC9cwjtrGNKyQTLpoW1vL1J2SXFzY2A0yEQTgp5qIlGvP4rgn3E2XeIeeoUpmBskYMsFX0wr4r2SV9LgTqSU6FmF7LPYR9ahl/JnTdmf4cvyfecVwgvfqHr4h/TwdS0fCVfeSTpol4Ett8UkhUmuw7yMjrMNEeNh1qGxhoBO8CIEMqqVrNFvQOG6c7SkOMMM3uo5n1jAH9OubpwZ6QAcTRLLMsAgHzFDGHViN0nK6LVcD8pqzoeEB0owufoEvCgHF/S4G8/PkEkwqXZWbcZO73yQayrbVfzZZGXwUWUjE1+L1L2Yb+FhstVGJusJ/x9roCVFxJYLvtli+k3MqAkqDZRyy832SKGEuTc=", "version": "1.0", "timestamp": 1572253432205 };
          if (result.secret) {
            //扫描中君订单
            // 生成 A 的公私钥对象 zo
            const a_public_key = new NodeRSA(this.a_public_key_data);
            a_public_key.setOptions({ encryptionScheme: 'pkcs1' });
            const a_private_key = new NodeRSA(this.a_private_key_data);
            a_private_key.setOptions({ encryptionScheme: 'pkcs1' });
            a_public_key.setOptions({
              "signingScheme": 'sha1'
            });
            // 生成 B 的公私钥对象 wo
            const b_public_key = new NodeRSA(this.b_public_key_data);
            b_public_key.setOptions({ encryptionScheme: 'pkcs1' });
            const b_private_key = new NodeRSA(this.b_private_key_data);
            b_private_key.setOptions({ encryptionScheme: 'pkcs1' });
            // 解密并验签
            const decrypted = b_private_key.decrypt(result.secret, 'utf8');
            console.log('你的 私钥解密:', decrypted);
            const verify = a_public_key.verify(decrypted, result.sign, 'utf8', 'base64');
            // const verify = a_public_key.verify(decrypted, "HXD8OQEHzCwSKHOz0nSSvdOGUSrmyAfHFRmqp8V2+O46JmcQ1yqOavITGnJSVUfuHoOBrIurkzFviqQpMrdr0BR30WorlC608cDYMZWsnHp2EMrNEytAebJ4KK/Du8Ebba0TGzs7aDTfrxF2T1hp2/9DaSuQfp+IOV7tG4xEff8=", 'utf8', 'base64');
            // const verify = a_public_key.verify(decrypted, "Hliaaq1moSvCeDGQteRX0nfSdiZ5WP3g9/OYYPiyi1qXymhxNwIWaOMqeeX3e7RT PsZB2a9ihITc1pGo6s4cI4XYavKUYa6r/ZKDNJ2S6WkObiC854afh8TRoJOcYBSiVoWU7iPwnEv LYS2gbwlKd1kIlMuT072Yq15LyG3vqQQ=", 'utf8', 'base64');
            console.log('你的 公钥验签:', verify);
            this.parameter = JSON.parse(decrypted);//先做解密 再赋值
            this.amount = this.parameter.orderAmount;
            this.disEnter = true;
            this.checkOrder();
          } else {
            //扫描普通moac地址
            this.toAddr = barcodeData.text;
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
  checkOrder() {
    let timestamp = new Date();
    // 生成 A 的公私钥对象 zo
    const a_public_key = new NodeRSA(this.a_public_key_data);
    a_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const a_private_key = new NodeRSA(this.a_private_key_data);
    a_private_key.setOptions({ encryptionScheme: 'pkcs1' });

    // 生成 B 的公私钥对象 wo
    const b_public_key = new NodeRSA(this.b_public_key_data);
    b_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const b_private_key = new NodeRSA(this.b_private_key_data);
    b_private_key.setOptions({ encryptionScheme: 'pkcs1' });
    b_private_key.setOptions({
      "signingScheme": 'sha1'
    });
    let p = {
      status: 0,
      orderNo: this.parameter.orderNo,
      orderAmount: this.parameter.orderAmount,
      currency: this.parameter.currency,
    }
    const encrypted = a_public_key.encrypt(p, 'base64');
    const sign = b_private_key.sign(p, 'base64', 'utf8');
    let data = {
      secret: encrypted,
      timestamp: this.datetolong(timestamp.valueOf()),
      sign: sign,
      version: "1.0.0"
    }
    this.http
      .post("/zojunapi/checkOrder", this.transformRequest(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      })
      .subscribe(
        data => {
          let res = JSON.stringify(data);
          let res1 = JSON.parse(res);
          if (res1.code == 0) {
            let result = b_private_key.decrypt(res1.data.secret, 'utf8')
            this.checkorderdetails = JSON.parse(result);
            console.log(this.checkorderdetails)
            this.toAddr = this.checkorderdetails.tokenAddress;
          }
        }
      );
  }
  checkOrderPay() {
    let timestamp = new Date();
    // 生成 A 的公私钥对象 zo
    const a_public_key = new NodeRSA(this.a_public_key_data);
    a_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const a_private_key = new NodeRSA(this.a_private_key_data);
    a_private_key.setOptions({ encryptionScheme: 'pkcs1' });

    // 生成 B 的公私钥对象 wo
    const b_public_key = new NodeRSA(this.b_public_key_data);
    b_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const b_private_key = new NodeRSA(this.b_private_key_data);
    b_private_key.setOptions({ encryptionScheme: 'pkcs1' });
    b_private_key.setOptions({
      "signingScheme": 'sha1'
    });
    let p = {
      status: 0,
      orderNo: this.parameter.orderNo,
      orderAmount: this.parameter.orderAmount,
      currency: this.parameter.currency,
      tokenAddress: this.toAddr,
      usertokenAddress: this.user.address,
    }
    console.log("p", p)
    const encrypted = a_public_key.encrypt(p, 'base64');
    const sign = b_private_key.sign(p, 'base64', 'utf8');

    let data = {
      secret: encrypted,
      sign: sign,
      timestamp: this.datetolong(timestamp.valueOf()),
    }
    this.http
      .post("/zojunapi/checkOrderPay", this.transformRequest(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      })
      .subscribe(
        data => {
          let res = JSON.stringify(data);
          let res1 = JSON.parse(res);
          if (res1.code == 0) {
            this.amount = "";
            this.toAddr = "";
            this.pwd = "";

            let result = b_private_key.decrypt(res1.data.secret, 'utf8')
            let url: any = JSON.parse(result).notify_url;
            this.notifyOrderPay = url.substring(url.lastIndexOf('/'))
            console.log('notifyOrderPay', this.notifyOrderPay);

            let hash = 'teststststststhash';
            this.postNotifyOrderPay(hash);
          }
        }
      );

  }

  postNotifyOrderPay(hash) {//回调通知
    let timestamp = new Date();
    // 生成 A 的公私钥对象 zo
    const a_public_key = new NodeRSA(this.a_public_key_data);
    a_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const a_private_key = new NodeRSA(this.a_private_key_data);
    a_private_key.setOptions({ encryptionScheme: 'pkcs1' });

    // 生成 B 的公私钥对象 wo
    const b_public_key = new NodeRSA(this.b_public_key_data);
    b_public_key.setOptions({ encryptionScheme: 'pkcs1' });
    const b_private_key = new NodeRSA(this.b_private_key_data);
    b_private_key.setOptions({ encryptionScheme: 'pkcs1' });
    b_private_key.setOptions({
      "signingScheme": 'sha1'
    });

    let p = {
      status: 1,
      orderNo: this.parameter.orderNo,
      tradeHash: hash,
      hashContent: [],

    }
    const encrypted = a_public_key.encrypt(p, 'base64');
    const sign = b_private_key.sign(p, 'base64', 'utf8');

    let data = {
      secret: encrypted,
      sign: sign,
      timestamp: this.datetolong(timestamp.valueOf()),
    }
    this.http
      .post("/zojunapi" + this.notifyOrderPay, this.transformRequest(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      })
      .subscribe(
        data => {
          let res = JSON.stringify(data);
          let res1 = JSON.parse(res);
          if (res1.code == 0) {


            console.log('result', '回调成功');
          }
        }
      );

  }
  datetolong(lo) {
    let date = new Date(lo)
    let y = date.getFullYear();
    let m: any = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    let d: any = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    let h: any = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    let minute: any = date.getMinutes();
    let second: any = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + m + d + h + minute + second;
  }
  longtodate() { }
  transformRequest(data) {
    //格式化表单提交参数
    let ret = "";
    for (let it in data) {
      ret +=
        encodeURIComponent(
          it
        ) +
        "=" +
        encodeURIComponent(
          data[it]
        ) +
        "&";
    }
    return ret;
  }

  //子链余额
  async getSubChainBalance() {
    this.user = await this.storage.get("user");
    let balance = await this.walletProvider.getSubChainBalance(
      this.user.address,
      this.info.subchain_address,
      "http://" + this.info.monitor_ip + "/rpc"
    );
    this.value = balance.result / 1000000000000000000;
  }
}
