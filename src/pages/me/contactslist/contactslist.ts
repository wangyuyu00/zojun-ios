import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController } from 'ionic-angular';
import { ContactdetailsPage } from './contactdetails/contactdetails'
import { AddcontactPage } from './addcontact/addcontact'
import { Storage } from "@ionic/storage";
import { WalletProvider } from '../../../providers/wallet';
import { BaseUI } from "../../common/baseui";
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the ContactslistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-contactslist',
  templateUrl: 'contactslist.html',
})
export class ContactslistPage extends BaseUI {
  dataImg: boolean = false;
  contacts: any = [];//联系人列表
  itemArray: any = [];//搜索联系人列表
  myInput:string='';//搜索框内容
  send:boolean = false;//false 不是从发送过来的 true发送过来的
  sendPage:string='';//TokensendPage CollectionsendPage
  token:any={};//TokensendPage CollectionsendPage 页面过来的 再传回去
  constructor(
    public translate: TranslateService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl:AlertController,
    private storage: Storage) {
        super();
      this.send = this.navParams.get('send');
      this.sendPage = this.navParams.get('sendpage');
      this.token = this.navParams.get('token');
     
  }
    ionViewDidLoad() {
        console.log('ionViewDidLoad ContactslistPage');
      
    }
    ionViewWillEnter() {
        this.getContact();
    }
    onInput(){//搜索
        if (this.myInput !== '') {
            console.log(this.myInput)
            this.itemArray = [];
            for (let e of this.contacts) {
                if (e.name === this.myInput || e.walletAddress === this.myInput) {
                    this.itemArray.push(e)
                }
            }
        } else {
            
        }
    }
    onCancel(){//取消搜索

    }
    getContact(){
        this.storage.get('contacts').then((c) => {
            if (c && c.length > 0) {
                console.log('contacts', c)
                this.dataImg = false;
                this.contacts=c;
            } else {
                this.dataImg = true;
            }
        });
    }
    toContactdetails(item){//联系人详情
        if(this.send == true){
          this.navCtrl.getPrevious().data.contsItem = item;
          this.navCtrl.getPrevious().data.token = this.token;
          this.navCtrl.pop();
        }else{
            this.navCtrl.push('ContactdetailsPage',{
                'item':item
            });
        }
    }
    jump(item) {
        if (item != '') {
            this.navCtrl.push(item);
        } else {
          //err
        }
    }
    getResult(msg){
        return super.getI18n(msg,this.translate)
    }
}
