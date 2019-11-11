import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubchaindetailsPage } from './subchaindetails';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    SubchaindetailsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(SubchaindetailsPage),
  ],
})
export class SubchaindetailsPageModule {}
