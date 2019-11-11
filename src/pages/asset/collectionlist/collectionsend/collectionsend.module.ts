import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectionsendPage } from './collectionsend';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CollectionsendPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(CollectionsendPage),
  ],
})
export class CollectionsendPageModule {}
