import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubchainPage } from './subchain';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    SubchainPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(SubchainPage),
  ],
})
export class SubchainPageModule {}
