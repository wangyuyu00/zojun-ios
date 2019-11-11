import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AuthorizePage } from './authorize';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    AuthorizePage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AuthorizePage),
  ],
})
export class AuthorizePageModule {}
