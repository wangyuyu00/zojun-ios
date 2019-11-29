import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExchangePage } from './exchange';

@NgModule({
  declarations: [
    ExchangePage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicPageModule.forChild(ExchangePage),
  ],
})
export class ExchangePageModule {}
