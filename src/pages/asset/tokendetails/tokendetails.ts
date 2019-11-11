import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { WalletProvider } from '../../../providers/wallet';
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../common/baseui";
/**
 * Generated class for the TokendetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-tokendetails',
    templateUrl: 'tokendetails.html',
})
export class TokendetailsPage extends BaseUI {
    token: any = {};//路由传过来的token
    user: any = {};
    page: number = 0;//交易记录分页
    recordList: any = [];
    flag: boolean = false;//没有更多
    record: any = [];//本地存储的交易记录
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        public translate: TranslateService,
        public walletProvider: WalletProvider,
        private http: HttpClient) {
        super();
        this.token = this.navParams.get('item');
        console.log('token', this.token);
        this.getRecords();
    }
    toDetail(item) {
        this.navCtrl.push('TokenrecordPage', {
            'item': item
        })
    }
    async getRecords() {//获取交易记录
        this.storage.get('record').then((R) => {
            if (R) {
                this.record = R;
            } else {

            }
        })
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
                        console.log('res1', res1)
                        if (res1.success == true) {
                            let list: any = [];
                            let list1: any = [];
                            if (this.page == 0) {
                                list = res1.data.result || [];
                            } else {
                                list = this.recordList.concat(res1.data.result);
                            }
                            if (this.record.length > 0) {
                                list1 = this.record.concat(list);//list1为未去重的交易记录
                            } else {
                                list1 = list
                            }
                            for (let key in list1) {
                                list1[key].hash = list1[key].hash ? list1[key].hash : list1[key].transactionHash;
                                if (list1[key].value && typeof (list1[key].value) == 'object') {
                                    list1[key].value = this.walletProvider.toNumber(list1[key].hash);
                                }
                                if (list1[key].from == this.user.address) {//发送  type=0
                                    list1[key].msg = '发送给' + list1[key].to.slice(0, 10) + '...' + list1[key].to.slice(-10) + '一笔资产';
                                    list1[key].type = 0;
                                    list1[key].code = this.token.code;
                                } else if (list1[key].to == this.user.address) {//接收 type=1
                                    list1[key].msg = '收到来自' + list1[key].from.slice(0, 10) + '...' + list1[key].from.slice(-10) + '一笔资产';
                                    list1[key].type = 1;
                                    list1[key].code = this.token.code;
                                }
                            }
                            console.log('list1', list1)
                            list = this.uniqueArray(list1, 'hash');
                            if (!list || list.length == 0) {
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
                        if (res1.success == true) {
                            let list: any = [];
                            if (res1.data.result.length == 0) {
                                this.flag = true;
                                resolve();
                            } else {
                                // list = this.recordList.concat(res1.data.result);
                                for (let key in list) {
                                    if (list[key].from == this.user.address) {//发送  type=0
                                        list[key].msg = '发送给' + list[key].to.slice(0, 10) + '...' + list[key].to.slice(-10) + '一笔资产';
                                        list[key].type = 0;
                                        list[key].code = this.token.code;
                                    } else if (list[key].to == this.user.address) {//接收 type=1
                                        list[key].msg = '收到来自' + list[key].from.slice(0, 10) + '...' + list[key].from.slice(-10) + '一笔资产';
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
    ionViewDidLoad() {
        // console.log('ionViewDidLoad TokendetailsPage');
    }
    toTokenSend() {//通证发送
        this.navCtrl.push('TokensendPage', {
            'token': this.token
        });
    }
    jump(item) {
        if (item != '') {
            this.navCtrl.push(item);
        } else {
            //err
        }
    }

    /*
      * JSON数组去重
      * @param: [array] json Array
      * @param: [string] 唯一的key名，根据此键名进行去重
      */
    uniqueArray(array, key) {
        if (array.length == 0) return array
        let result = [array[0]];
        for (let i = 1; i < array.length; i++) {
            let item = array[i];
            let repeat = false;
            for (let j = 0; j < result.length; j++) {
                if (item[key] == result[j][key]) {
                    result[j] = item;
                    repeat = true;
                    break;
                }
            }
            if (!repeat) {
                result.push(item);
            }
        }
        return result;
    }
    getResult(msg) {
        return super.getI18n(msg, this.translate)
    }
}
