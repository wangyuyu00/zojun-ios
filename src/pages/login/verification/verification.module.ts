import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VerificationPage } from './verification';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    VerificationPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(VerificationPage),
  ],
})
export class VerificationPageModule {}
