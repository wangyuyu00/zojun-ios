import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImportPage } from './import';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    ImportPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,

    IonicPageModule.forChild(ImportPage),
  ],
})
export class ImportPageModule {}
