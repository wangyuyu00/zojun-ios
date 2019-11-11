import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BackupsPage } from './backups';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    BackupsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(BackupsPage),
  ],
})
export class BackupsPageModule {}
