import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddsubchainPage } from './addsubchain';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    AddsubchainPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AddsubchainPage),
  ],
})
export class AddsubchainPageModule {}
