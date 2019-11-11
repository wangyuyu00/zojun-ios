import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { IonicStorageModule } from '@ionic/storage';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Clipboard } from '@ionic-native/clipboard';
import { WalletProvider } from '../providers/wallet';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SocialSharing } from '@ionic-native/social-sharing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { createTranslateLoader } from '../services/language.service';
import { AppAvailability } from '@ionic-native/app-availability';
@NgModule({
  declarations: [
    MyApp,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxQRCodeModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',//按钮内容
      backButtonIcon: "ios-arrow-back",
      iconMode: "ios",
      tabsPlacement: "bottom",
      modalEnter: 'modal-slide-in',
      modalLeave: 'modal-slide-out',
      // pageTransition: 'ios-transition',
      tabsHideOnSubPages: 'true'
    }),
    // 调用forRoot静态方法指定加载的文件
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot()

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AppAvailability,
    Clipboard,
    WalletProvider,
    BarcodeScanner,
    SocialSharing,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
