import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactslistPage } from './contactslist';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ContactslistPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(ContactslistPage),
  ],
})
export class ContactslistPageModule {}
