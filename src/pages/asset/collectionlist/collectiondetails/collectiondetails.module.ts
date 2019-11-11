import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectiondetailsPage } from './collectiondetails';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CollectiondetailsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(CollectiondetailsPage),
  ],
})
export class CollectiondetailsPageModule {}
