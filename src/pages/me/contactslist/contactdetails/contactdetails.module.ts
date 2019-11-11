import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactdetailsPage } from './contactdetails';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ContactdetailsPage,
  ],
  exports: [TranslateModule],
  imports: [
    NgxQRCodeModule,
    TranslateModule,
    IonicPageModule.forChild(ContactdetailsPage),
  ],
})
export class ContactdetailsPageModule {}
