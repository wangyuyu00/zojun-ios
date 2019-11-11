import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssetPage } from './asset';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AssetPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AssetPage),
  ],
})
export class AssetPageModule {}
