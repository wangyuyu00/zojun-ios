import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MePage } from './me';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(MePage),
  ],
})
export class MePageModule {}
