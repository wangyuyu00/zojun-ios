import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChargePage } from './charge';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    ChargePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(ChargePage),
  ],
})
export class ChargePageModule {}
