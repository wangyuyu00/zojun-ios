import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddcontactPage } from './addcontact';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddcontactPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AddcontactPage),
  ],
})
export class AddcontactPageModule {}
