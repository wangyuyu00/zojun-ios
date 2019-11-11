import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AddsubchainPage } from "./addsubchain/addsubchain";
import { SubchaindetailsPage } from "./subchaindetails/subchaindetails";
import { HttpClient } from "@angular/common/http";
import { BaseUI } from "../common/baseui";
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the SubchainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-subchain",
  templateUrl: "subchain.html"
})
export class SubchainPage extends BaseUI {
  tabs: string = "pass";
  subChainList: any = [];
  page: number = 1; //子链分页
  banners: any = [];
  constructor(
    public navCtrl: NavController,
    private http: HttpClient,
    public navParams: NavParams,
    public translate: TranslateService
  ) {
    super();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SubchainPage");
  }
  ionViewWillEnter() {
    this.getSubChainList();
    this.getSubBanners();
  }
  getSubChainList() {
    //获取子链列表
    try {
      this.http
        .post("https://mobao.halobtc.com/api/scsList", {
          page: this.page
        })
        .subscribe(data => {
          // console.log('data',typeof(data.data));
          // let res = JSON.parse(data)
          let res = JSON.stringify(data);
          let res1 = JSON.parse(res);
          this.subChainList = res1.data.list;
          console.log(res1);
        });
    } catch (e) {
      console.log(e);
    }
  }
  getSubBanners() {
    //获取子链轮播
    try {
      this.http
        .get("https://mobao.halobtc.com/api/scsFlashList")
        .subscribe(data => {
          // console.log('data',typeof(data.data));
          // let res = JSON.parse(data)
          let res = JSON.stringify(data);
          let res1 = JSON.parse(res);
          this.banners = res1.data;
          console.log(res1);
        });
    } catch (e) {
      console.log(e);
    }
  }
  toSubDetails(item) {
    this.navCtrl.push("SubchaindetailsPage", {
      detail: item
    });
  }
  jump(item) {
    if (item != "") {
      this.navCtrl.push(item);
    } else {
      //err
    }
  }
  getResult(msg) {
    return super.getI18n(msg, this.translate)
  }
}
