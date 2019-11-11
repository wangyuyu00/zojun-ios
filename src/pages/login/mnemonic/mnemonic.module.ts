import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MnemonicPage } from './mnemonic';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    MnemonicPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(MnemonicPage),
  ],
})
export class MnemonicPageModule {}
