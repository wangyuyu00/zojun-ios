import { Loading, LoadingController, Toast, ToastController } from "ionic-angular";
import { TranslateService } from '@ngx-translate/core';

export abstract class BaseUI {
  protected showLoading(loadingCtr: LoadingController,
    message: string): Loading {
    let loader = loadingCtr.create({
      content: message,
    });
    loader.present();
    return loader;
  }

  protected showToast(toastCtrl: ToastController,
    message: string): Toast {
    let toast = toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
    return toast;
  }
  protected generateContactGroup(arr: Array<string>) {
    if (!String.prototype.localeCompare) {
      console.error('localeCompare function not found');
      return [];
    }

    //enTmp cnArray
    let enResult = this.sortEnContacts(arr);
    let sortResult = enResult.enTmp;
    let cnArray = enResult.cnArray;
    let speacialRes = enResult.speacial
    let enKey = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let letters = "*abcdefghjklmnopqrstwxyz".split('');
    let zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split('');
    for (let i = 0; i < letters.length; i++) {
      let letter = letters[i].toUpperCase();
      let curr;
      if (sortResult[letter]) {
        curr = sortResult[letter];
      } else if ('*' != letters[i]) {
        curr = sortResult[letter] = [];
      }

      for (var j = 0; j < cnArray.length; j++) {
        if ((!zh[i - 1] || zh[i - 1].localeCompare(cnArray[j].displayName, 'zh') <= 0) && cnArray[j].displayName.localeCompare(zh[i], 'zh') == -1) {
          try{
            curr.push(cnArray[j]);
          } catch(err){
            console.log("未识别标识符!")
          }
        }
      }
    }
    let contactResult = [];
    for (let k = 0; k < enKey.length; k++) {
      let item = sortResult[enKey[k]];
      if (item && item.length > 0)
        contactResult.push({ letter: enKey[k], contact: item });
    }
    if (speacialRes.length !== 0) {
      contactResult.push({ letter: "#", contact: speacialRes });
    }
    return contactResult;
  }
  protected sortEnContacts(contactList: Array<any>) {
    let en = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
      'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let speacialReg = /^[\u4E00-\u9FA5A-Za-z]/
    let enTmp = {};
    let cnArray = [];
    let speacialArray = []
    for (var i = 0; i < contactList.length; i++) {
      let letter = contactList[i].displayName.toUpperCase().charAt(0);
      if(speacialReg.test(letter)){
        en.indexOf(letter) >= 0? (enTmp[letter] == undefined?enTmp[letter] = []:"",enTmp[letter].push(contactList[i])): cnArray.push(contactList[i])
      } else{
        speacialArray.push(contactList[i]);
      }
    }
    return { 'enTmp': enTmp, 'cnArray': cnArray, 'speacial': speacialArray };
  }
  public numFormat(num) {
    num = Math.abs(num);
    if (num.toString().indexOf('.') != -1) {
        let newnum = (Number(num.toString().slice(0, num.toString().indexOf('.'))) || 0).toString();
        let result = '';
        while (newnum.length > 3) {
            result = ',' + newnum.toString().slice(-3) + result;
            newnum = newnum.toString().slice(0, newnum.length - 3);
        }
        if (newnum) { result = newnum + result; }
        return result + num.toString().slice(num.toString().indexOf('.'));
    } else {
        let newnum = (Number(num) || 0).toString()
        let result = '';
        while (newnum.length > 3) {
            result = ',' + newnum.toString().slice(-3) + result;
            newnum = newnum.toString().slice(0, newnum.length - 3);
        }
        if (newnum) { result = newnum + result; }
        return result;
    }
  }
  protected contactObject(array){
     if(Object.prototype.toString.call(array)!== '[object Array]') return;
     let newObj :any = {};
    array.forEach((e,index) => {
      if(e.walletAddress){
        newObj[e.walletAddress] = {}
        newObj[e.walletAddress]["name"] = e.name
        newObj[e.walletAddress]["index"] = index
     } 
    });
    return newObj;
  }

  protected getI18n(address:string,translate:TranslateService):string{
    let result:string;
    translate.get(address).subscribe((res)=>{
      result = res;
    })
    return result;
  }
}
