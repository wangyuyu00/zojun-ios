import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransferPage } from './transfer';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    TransferPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(TransferPage),
  ],
})
export class TransferPageModule {}
