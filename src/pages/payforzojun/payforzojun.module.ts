import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PayforzojunPage } from './payforzojun';

@NgModule({
  declarations: [
    PayforzojunPage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicPageModule.forChild(PayforzojunPage),
  ],
})
export class PayforzojunPageModule { }
