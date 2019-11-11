import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountPage } from './account';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    AccountPage,
  ],
  exports: [TranslateModule],
  imports: [
    NgxQRCodeModule,
    TranslateModule,
    IonicPageModule.forChild(AccountPage),
  ],
})
export class AccountPageModule {}
