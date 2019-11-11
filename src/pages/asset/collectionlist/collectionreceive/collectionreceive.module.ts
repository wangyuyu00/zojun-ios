import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectionreceivePage } from './collectionreceive';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CollectionreceivePage,
  ],
  exports: [TranslateModule],
  imports: [
    NgxQRCodeModule,
    TranslateModule,
    IonicPageModule.forChild(CollectionreceivePage),
  ],
})
export class CollectionreceivePageModule {}
