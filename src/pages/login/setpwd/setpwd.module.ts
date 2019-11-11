import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SetpwdPage } from './setpwd';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SetpwdPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(SetpwdPage),
  ],
})
export class SetpwdPageModule {}
