import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutPage } from './about';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AboutPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(AboutPage),
  ],
})
export class AboutPageModule {}
