import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TokenrecordPage } from './tokenrecord';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TokenrecordPage,
  ],
  exports: [TranslateModule],
  imports: [
    NgxQRCodeModule,
    TranslateModule,
    IonicPageModule.forChild(TokenrecordPage),
  ],
})
export class TokenrecordPageModule {}
