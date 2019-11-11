import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SubrecorddetailPage } from "./subrecorddetail";
import { NgxQRCodeModule } from "ngx-qrcode2";
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [SubrecorddetailPage],
  exports: [TranslateModule],
  imports: [
    NgxQRCodeModule, 
    TranslateModule,
    IonicPageModule.forChild(SubrecorddetailPage)]
})
export class SubrecorddetailPageModule {}
