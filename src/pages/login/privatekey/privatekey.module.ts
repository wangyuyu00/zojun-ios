import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrivatekeyPage } from './privatekey';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PrivatekeyPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(PrivatekeyPage),
  ],
})
export class PrivatekeyPageModule {}
