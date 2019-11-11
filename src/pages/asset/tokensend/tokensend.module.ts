import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TokensendPage } from './tokensend';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TokensendPage,
  ],
  exports: [TranslateModule],
  imports: [
    TranslateModule,
    IonicPageModule.forChild(TokensendPage),
  ],
})
export class TokensendPageModule {}
