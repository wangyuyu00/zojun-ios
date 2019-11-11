import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CollectiondetailsPage } from './collectiondetails/collectiondetails';
import { WalletProvider } from '../../../providers/wallet';
import { TranslateService } from '@ngx-translate/core';
import { BaseUI } from "../../common/baseui";

/**
 * Generated class for the CollectionlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-collectionlist',
  templateUrl: 'collectionlist.html',
})
export class CollectionlistPage extends BaseUI {
  collection:any = {};//路由传过来的收藏品名称
  collectionList:any=[];//获取的该名称下面的 有几个ID
  user:any={};
  flag:boolean=false;//没有更多
  constructor(
    public navCtrl: NavController, 
    public walletProvider: WalletProvider, 
    public translate: TranslateService,
    public navParams: NavParams) {
      super();
      this.collection = this.navParams.get('item');
      if(this.collection.value == 0){
         this.flag = true;
      }
      this.user = this.navParams.get('user');
      this.ownerCollections();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CollectionlistPage');
  }
  async ownerCollections(){// 获得某个用户的在一个收藏品合约中的所有TokenId
      this.collectionList = await this.walletProvider.ownerCollections(this.collection.code,this.user.address);
      console.log(this.collectionList);
  }
  jump(ID){
      this.navCtrl.push('CollectiondetailsPage',{
          'collection':this.collection,
          'ID':ID
      });
  }
  getResult(msg){
    return super.getI18n(msg,this.translate)
  }
}
