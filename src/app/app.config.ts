export class AppConfig {
    public static secretDec(user, pass, data) {//解
        function _decrypt(priv, ciphertext) {
            let blob;
            let s = sjcl.decrypt(priv, ciphertext);
            blob = JSON.parse(s);
            return blob;
        }

        let key;
        try {
            key = '' + user.length + '|' + user + pass;
            return _decrypt(key, data);
        } catch (e1) {
            // try old style
            try {
                key = user + pass;
                let blob = _decrypt(key, data);
                return blob;
            } catch (e2) {
                return false;
            }
        }
    };
    public static secretEnc(username, password, bl){//加
        let key = "" + username.length + '|' + username + password;
        return sjcl.encrypt(key, JSON.stringify(bl));
    }
}