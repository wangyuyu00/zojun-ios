import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CollectionlistPage } from './collectionlist';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CollectionlistPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(CollectionlistPage),
  ],
})
export class CollectionlistPageModule {}
