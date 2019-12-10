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
            // let url='wallet.zojun://sign=SiozfD1S4Jl4ocEvgu+Kzt9/gYgNyCsQZ+9fThvaTqjVkAMoneJHqFvlwW4VJlWya98Od6L3iqwu5lvsjtOdKRk2JczbeCRX/u2DoJSjLk2A4sLbx7Rz32HW3Hv4hTDrd7UfeGaxz13C4nR10R6y7/uk8lyefeDR+ijwtigTGRE=&secret=YvGuPuKn5u4wmR/BqKdnzZk2DinCZWTuDj7cyQAPkHWBpD03u9y04M2i4LLDZHuhwXkWfZNc2p/K0DMmKu0hJPG85vtKo/6y4TdOSnR5wvraic3+AO83p/331rQswxIDgA7DEYUaeAC1gGzm6xRN/lPW5BGXONk9mmI04F8qwn8vlp88kn0rXSNf9p/LSY5FUkjTvpSLF0KMqWZ3lElQpuKlWakplllLIvrUTgzJXJiwZQagRsY8R0J6cKOb2pb+KFTgRUvFM7k+iimSdG5G0AXZ9L1JJKru7m5UUAL90oZM0CJ9IgdixQ3BXnI3st8ZZLSke4VlIs2p2lyrbQEW0Bt4ryuT+hYNRcdEKUbjpwXz8cmo7M9LziHvfrj4j83LiWfrlDMXaLoskMXtVnWldbwhekh6trkwzGDQc++FxJy3tIfxct8o1wbcT2yYn1nCgp16LmLOz/ZNGEKK2bSLiOaiO/vQNPs4ZuvBPKm2ls1rxMpAKqbyeqOd9TPgaRsXeJYqkIO01JlVpptnHi/VpaIgycv0oWG/Qow4k0dcfVgzhQjSJ7XDX96ULDeOe2vQk6xqdlAVS/b13zuJf+bl4uUVCX1CtAh+WjucaFBaJVGLzIsD4gD8Hdg0JMOqlI8Ej+ZDQ4aiPa9yhBvyvReX8panJqOqMgoi4kLjstQVLaQ=&version=1.0&timestamp=1575966341335&schemes=mall.zhongjun&payType=30&payMoney=0.01&paySource=TopupVC';
            // let arr:any = url.slice(15).split('&');
            //         let json:any={};
            //         for (const key in arr) {
            //             let keys:any=arr[key].slice(0,arr[key].indexOf('='));
            //             let value:any=arr[key].slice(arr[key].indexOf('=')+1);
            //             // let subarr:any=arr[key].split('=');
            //             json[keys]=value;
            //         }
            //         this.parameterobj=json;
            //         this.parameter = JSON.stringify(json);
            //         console.log('处理好的 参数',this.parameter)
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
                                            message:"Please create an account before using"
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