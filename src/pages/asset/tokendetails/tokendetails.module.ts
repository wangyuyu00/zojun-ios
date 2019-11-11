import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TokendetailsPage } from './tokendetails';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TokendetailsPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(TokendetailsPage),
  ],
})
export class TokendetailsPageModule {}
