declare let window: any;
declare var startApp;
import { Component, NgZone } from '@angular/core';
import { App, Platform, MenuController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { Storage } from "@ionic/storage";
import { LoginPage } from '../pages/login/login'
import { ImportPage } from '../pages/login/import/import'
import { SetpwdPage } from '../pages/login/setpwd/setpwd'
import { TranslateService } from "@ngx-translate/core";
import VConsole from 'vconsole';
import { setInterval, clearInterval } from 'timers';
var vConsole = new VConsole();
@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage: any;
    pockets: any = [];
    user: any = {};
    parameterobj: any = {};
    lang: string = 'zh';
    parameter: string = '';//中君传的参数
    constructor(
        private app: App,
        platform: Platform,
        public alertCtrl: AlertController,
        statusBar: StatusBar,
        private zone: NgZone,
        private storage: Storage,
        private menuCtrl: MenuController,
        splashScreen: SplashScreen,
        private translate: TranslateService) {
            setTimeout(() => {
                (window as any).handleOpenURL = (url: string) => {
                    console.log('所传参数URL为', url);
                    let arr:any = url.slice(15).split('&');
                    let json:any={};
                    for (const key in arr) {
                        let keys:any=arr[key].slice(0,arr[key].indexOf('='));
                        let value:any=arr[key].slice(arr[key].indexOf('=')+1);
                        // let subarr:any=arr[key].split('=');
                        json[keys]=value;
                    }
                    this.parameterobj=json;
                    this.parameter = JSON.stringify(json);
                    console.log('处理好的 参数',this.parameter)
                };
            }, 0);
            //this.parameter='{"sign":"BYo3HfVf91pyP3BN4xJKUCHoPQRZT2BRjNgcMoHf8F7Qll2pifCa9Gv1AwHbE4wvaMiZbkmTuDWQP69P0cMWB3f+h2WquMkzNXDAwS/vPwpo5rOJ+QO73UAwxtcf+hU35lCAlmwzfONpGoCtD1St2/v/MkwLyxNg79mmI8w7Mq0=","secret":"dYDboG+7xh4FfZ2CTiF9oNkfs2IlcDRbIZHb1857qpsYxQTSnvHO374RXYZ87L2V6Kg0fvyB3kY5sa87YMaJ45Fr+GjPgNwzvK6EKbjVTLtEVvklkxUPEpoMlVyV+mUZG4epNpLqrNq2xAsqcOLkRhYr/NJf3MGNY+CR5SuZ/iQpTYBLRK//j9M1t+ozv27EP5CRMhVWtoABDe1BXPC4JKqWwFdHDsB2b79dIl0gzTX5TN4+4P8MFc6O3TvT7AZzXnT7h3opWWZID3LLjluig7pTuinvwe3lF2935d9MFDr85yjA8WK0mQZpv9pu4ZYpIzWvIgAwDD5MQ5kdzXr3WH9I8Mp/Uz5jwexshKrCFCJuHbiwAbazR1VZ/aIToeO7xtUnqcZdfYSwpnHdnr6ysJZyq/piBM65cnTZJZt4hT1/pSkGtVHuzG7Qluf6g9A5ItfXfPg01QjMJx/u9fmmGUt6lnZ1dSiUmP1YQVBrWObpLviWkGysH3mx7yxFEcRwc7DWdgwPXIQ7f+ZbQF1GE4WAdm0NEInRO7/MZtHj91QPyFwI1vxXeas4pmhHgg83yUtFeDfNhJ6AC5AXHxKLcPl7oGYs57cwNCM+ilWzof9kM2vZ4UlCDOY2O+0Am2WoTufR6W9l7hqsioZbsfqVPnQx2HfUG4FDwA0DvJ3n2K8=","version":"1.0","timestamp":"1574653219421","schemes":"mall.zhongjun","payType":"30","payMoney":"0.01","paySource":"TopupVC"}';
            this.storage.get('user').then((user) => {//获取当前用户
                //判断打开app时 是否为中君的 url存在 存本地 跳到支付页面
                this.user= user;
            }).then(()=>{
                if (this.user) {
                    if (this.parameter == '') {
                        this.rootPage = TabsPage;
                    } else {
                        this.storage.set('parameter', this.parameter);
                        this.rootPage = 'PayforzojunPage';
                    }
                }else {
                    if (this.parameter == '') {
                        this.rootPage = 'LoginPage';
                    } else {
                        let prompt = this.alertCtrl.create({
                            title: '提示',
                            message: "请先创建钱包再尝试支付操作",
                            buttons: [
                                {
                                    text: '返回商家',
                                    handler: data => {
                                        //这里做返回商家处理
                                        let parameter={
                                            code:-1,
                                            message:"钱包内无账户,请先创建账户再使用"
                                        }
                                        let uri = this.parameterobj['schemes']+'?parameter='+JSON.stringify(parameter)+'&paySource='+this.parameterobj['paySource']+'&payMoney='+this.parameterobj['payMoney']+'&payType='+this.parameterobj['payType']+'&schemes='+this.parameterobj['schemes'];
                                        console.log('uri',uri)
                                        this.turnApp(uri);
                                    }
                                }
                            ]
                        });
                        prompt.present();
                        // this.rootPage = 'LoginPage';
                    }
                }
            });

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.initTranslateConfig();//初始化中文
            statusBar.styleDefault();
            splashScreen.hide();
        });
    }
    turnApp(uri) {
        // "package": "io.moac.mobao",
		try {
			let mobaoApp = startApp.set({
                "action": "ACTION_VIEW",
                "category": "CATEGORY_DEFAULT",
                "type": "text/css",
                "uri": uri,
                "flags": ["FLAG_ACTIVITY_CLEAR_TOP", "FLAG_ACTIVITY_CLEAR_TASK"],
                "intentstart": "startActivity",
            }, {
                "EXTRA_STREAM": "extraValue1",
                "extraKey2": "extraValue2"
            });
            mobaoApp.start(function () {
                console.log("sApp.start succeed");
            }, function (error) {
                alert("error---" + error);
            });
		} catch (error) {
			console.log(error);
		}
    }
    //语言设置
    initTranslateConfig() {
        // 参数类型为数组，数组元素为本地语言json配置文件名
        this.translate.addLangs(["zh", "en"]);
        // 从storage中获取语言设置
        this.storage.get('language').then((l) => {
            if (l) {
                this.lang = l;
                // 设置默认语言
                this.translate.setDefaultLang(this.lang);
                // 检索指定的翻译语言，返回Observable
                this.translate.use(this.lang);
            } else {
                // 设置默认语言
                this.translate.setDefaultLang(this.lang);
                // 检索指定的翻译语言，返回Observable
                this.translate.use(this.lang);
            }
            // 存储到storage
            this.storage.set('language', this.lang);
        })

    }
    ionOpen() {
        this.storage.get('pockets').then((p) => {
            if (p) {
                // this.pockets = p;
                this.zone.run(() => {
                    this.pockets = p;
                });
            }
        })
        this.storage.get('user').then((user) => {
            if (user) {
                // this.pockets = p;
                this.zone.run(() => {
                    this.user = user;
                });
            }
        })
    }

    jump(item) {
        if (item != '') {
            this.app.getRootNav().push(item);
            this.menuCtrl.close();
        } else {
            //err
        }
    }
}