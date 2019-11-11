import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarryPage } from './carry';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    CarryPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(CarryPage),
  ],
})
export class CarryPageModule {}
