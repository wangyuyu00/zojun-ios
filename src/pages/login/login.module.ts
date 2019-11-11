import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './login';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LoginPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(LoginPage),
  ],
})
export class LoginPageModule {}
