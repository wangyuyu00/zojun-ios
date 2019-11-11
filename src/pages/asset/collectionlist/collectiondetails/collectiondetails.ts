import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { CollectionsendPage } from '../collectionsend/collectionsend';
import { CollectionreceivePage } from '../collectionreceive/collectionreceive';
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { TokenrecordPage } from '../../tokendetails/tokenrecord/tokenrecord';
import { WalletProvider } from '../../../../providers/wallet';
import { Clipboard } from '@ionic-native/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../../common/baseui";

/**
 * Generated class for the CollectiondetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-collectiondetails',
    templateUrl: 'collectiondetails.html',
})
export class CollectiondetailsPage extends BaseUI {
    collectionsID: string = '';
    token: any = {};//路由传过来的token
    user: any = {};
    page: number = 0;//交易记录分页
    recordList: any = [];
    flag: boolean = false;
    Infos: any = {};//某个id的详细信息
    attributes: any = [];//属性列表
    issuer: string;//合约地址 判断logo用
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public walletProvider: WalletProvider,
        private http: HttpClient,
        private clipboard: Clipboard,
        private toastCtrl: ToastController,
        public translate: TranslateService,
        private storage: Storage) {
        super();
        this.collectionsID = this.navParams.get('ID');
        this.token = this.navParams.get('collection');
        this.getRecords();
        this.tokenInfo();
    }
    async tokenInfo() {// 获取收藏品定制消息
        this.Infos = await this.walletProvider.tokenInfo(this.token.code, this.collectionsID);
        console.log(this.Infos);
        if (this.Infos == null) return
        let obj: any = this.Infos.attributes;
        let list: any = [];
        let that = this;
        for (let key in obj) {
            list.push({
                'key': key,
                'value': obj[key]
            })
            if (key.slice(1) == '合约') {
                that.issuer = obj[key];
            }
        }
        this.attributes = list;
        console.log(that.issuer)
    }
    async getRecords() {//获取交易记录
        if (await this.storage.get('user')) {
            this.user = await this.storage.get('user');
            let src: string = '';
            if (this.token.issuer) {
                src = "http://39.98.62.240:3000/api/accounts/" + this.user.address + "/tokentransfers/" + this.token.issuer + "/" + this.page;
            } else {
                src = "http://39.98.62.240:3000/api/accounts/" + this.user.address + "/transactions/" + this.page
            }
            console.log(src)
            this.http
                .get(src, {
                    // headers:{
                    //   'header':['Access-Control-Allow-Origin:*','Access-Control-Allow-Methods:GET']
                    // }
                })
                .subscribe(
                    data => {
                        // console.log('data',typeof(data.data));
                        // let res = JSON.parse(data)
                        let res = JSON.stringify(data);
                        let res1 = JSON.parse(res);
                        console.log(res1)
                        if (res1.success == true) {
                            let list: any = [];
                            if (this.page == 0) {
                                list = res1.data.result;
                            } else {
                                list = this.recordList.concat(res1.data.result);
                            }
                            for (let key in list) {
                                if (list[key].from == this.user.address) {//发送  type=0
                                    list[key].msg = '发送给' + list[key].to.slice(0, 10) + '...' + list[key].to.slice(-10) + ' ID ' + list[key].amount + '的' + this.token.code;
                                    list[key].type = 0;
                                    list[key].code = this.token.code;
                                } else if (list[key].to == this.user.address) {//接收 type=1
                                    list[key].msg = '收到来自' + list[key].from.slice(0, 10) + '...' + list[key].from.slice(-10) + ' ID ' + list[key].amount + '的' + this.token.code;
                                    list[key].type = 1;
                                    list[key].code = this.token.code;
                                }
                            }
                            if (list.length == 0) {
                                this.recordList = [];
                                this.flag = true;
                            } else {
                                this.recordList = list;
                            }
                        }
                    }
                );
        }
    }
    doInfinite(): Promise<any> {
        let that = this;
        that.page++;
        return new Promise((resolve) => {
            if (!that.page) {
                resolve();
                return;
            }
            let src: string = '';
            if (this.token.issuer) {
                src = "http://39.98.62.240:3000/api/accounts/" + this.user.address + "/tokentransfers/" + this.token.issuer + "/" + this.page;
            } else {
                src = "http://39.98.62.240:3000/api/accounts/" + this.user.address + "/transactions/" + this.page
            }
            console.log(src)
            this.http
                .get(src, {
                    // headers:{
                    //   'header':['Access-Control-Allow-Origin:*','Access-Control-Allow-Methods:GET']
                    // }
                })
                .subscribe(
                    data => {
                        // console.log('data',typeof(data.data));
                        // let res = JSON.parse(data)
                        let res = JSON.stringify(data);
                        let res1 = JSON.parse(res);
                        console.log(res1)
                        if (res1.success == true) {
                            let list: any = [];
                            if (res1.data.result.length == 0) {
                                this.flag = true;
                                resolve();
                            } else {
                                // list = this.recordList.concat(res1.data.result);
                                for (let key in list) {
                                    if (list[key].from == this.user.address) {//发送  type=0
                                        list[key].msg = '发送给' + list[key].to.slice(0, 10) + '...' + list[key].to.slice(-10) + ' ID ' + list[key].amount + '的' + this.token.code;
                                        list[key].type = 0;
                                        list[key].code = this.token.code;
                                    } else if (list[key].to == this.user.address) {//接收 type=1
                                        list[key].msg = '收到来自' + list[key].from.slice(0, 10) + '...' + list[key].from.slice(-10) + ' ID ' + list[key].amount + '的' + this.token.code;
                                        list[key].type = 1;
                                        list[key].code = this.token.code;
                                    }
                                    this.recordList.push(list[key]);
                                }
                                resolve();
                            }
                        }
                    }
                );
        })
    }
    copy(msg) {
        //复制钱包地址
        this.clipboard.copy(msg).then((res) => {
            this.presentToast('复制成功');
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
    toDetail(item) {
        this.navCtrl.push('TokenrecordPage', {
            'item': item,
            'id': true
        })
    }
    ionViewDidLoad() {
        console.log('ionViewDidLoad CollectiondetailsPage');
    }
    jump(item) {
        if (item != '') {
            this.navCtrl.push(item, {
                'token': this.token,
                'ID': this.collectionsID
            });
        } else {
            //err
        }
    }
    getResult(msg) {
        return super.getI18n(msg, this.translate)
    }
}
