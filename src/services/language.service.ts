import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
 // 使用TranslateHttpLoader加载项目的本地语言json配置文件
export function createTranslateLoader(http: HttpClient){
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}