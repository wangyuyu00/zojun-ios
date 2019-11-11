/**
 * mobao第三方应用接口
 * 
 * 
 */

var pkg = {version: '1.0.0'};

export function MLIB_FUNCTION(address, networkVersion, data = {},  locale = "zh_cn") {

    var version = pkg.version;
    return `
        if(!window.moac){
            window.moac = {};
            moac.isMobao = true;
            moac.networkVersion = "${networkVersion}";
            moac.version = "${version}";
            moac.selectedAddress = "${address}";
            moac.callbackObj = {};

            // 保存回调
            moac.addCallback = function(id, callback) {
                moac.callbackObj[id] = callback;
            };
            moac.enable = function(callback){
                var params = { type:'enable'};
                params = genParams(params, callback);
                try{
                    cordova_iab.postMessage(JSON.stringify(params));  
                }catch(err){
                    moac.callback(params['callback'] ,{code:"fail",message:err.message});
                }
            };

            moac.sendAsync = function(payload, callback) {
                var params = { type:'sendAsync', data: payload };
                params = genParams(params, callback);
                try{
                    cordova_iab.postMessage(JSON.stringify(params));  
                }catch(err){
                    moac.callback(params['callback'] ,{code:"fail",message:err.message});
                }
            };
              
            moac.callback = function(id, data){
                var fn = moac.callbackObj[id];
                if(fn === undefined){
                  fn = window[id];
                }
                if(fn === undefined){
                  throw new Error('no callback function');
                  return;
                }
                fn.apply(this,[data]);
                delete moac.callbackObj[id]; 
            };

            function genParams(param, callback){
                var params = Object.assign({}, param);
                if(typeof callback === 'function'){
                  var id = 'MOAC_CB_' + new Date().getTime();
                  moac.addCallback(id, callback);
                  params['callback'] = id;
                }else{
                  params['callback'] = callback;
                }
                return params;
            };
        }   
    `;
}