import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TradePage } from './trade';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    TradePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(TradePage),
  ],
})
export class TradePageModule {}
