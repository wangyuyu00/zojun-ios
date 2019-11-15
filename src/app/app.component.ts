declare let window: any;
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
    lang: string = 'zh';
    parameter: string = null;//中君传的参数
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
        // alert(2)
        this.storage.get('user').then((user) => {//获取当前用户
            //判断打开app时 是否为中君的 url存在 存本地 跳到支付页面
            this.user=user;
            (window as any).handleOpenURL = (url: string) => {
                console.log('所传参数URL为', url);
                // this.parameter = url;
                if(url){
                    let arr:any = url.slice(15).split('&');
                    let json:any={};
                    for (const key in arr) {
                        let keys:any=arr[key].slice(0,arr[key].indexOf('='));
                        let value:any=arr[key].slice(arr[key].indexOf('=')+1);
                        // let subarr:any=arr[key].split('=');
                        json[keys]=value;
                    }
                    this.parameter = JSON.stringify(json);
                }else{
                    this.parameter = '';
                }
                console.log('handleOpenURL',this.parameter);
            };
        }).then(()=>{
            console.log('then',this.parameter);
            let timer:any = setInterval(()=>{
                console.log('timer',this.parameter);
                if(this.parameter !== null){
                    if (this.user) {
                        if (this.parameter == '') {
                            this.rootPage = TabsPage;
                        } else {
                            this.storage.set('parameter', this.parameter);
                            this.rootPage = 'PayforzojunPage';
                        }
                    } else {
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
                                        }
                                    }
                                ]
                            });
                            prompt.present();
                            // this.rootPage = 'LoginPage';
                        }
                    } 
                    clearInterval(timer);
                }
            },100)
        });

        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.initTranslateConfig();//初始化中文
            statusBar.styleDefault();
            splashScreen.hide();
        });
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
