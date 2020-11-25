//----------------------------------------------
// Firebase UIの設定
//----------------------------------------------
var uiConfig = {
  // ログイン完了時のリダイレクト先
  signInSuccessUrl: 'done.html',

  // 利用する認証機能
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID  //メール認証
  ],

  // 利用規約のURL(任意で設定)
  tosUrl: 'http://example.com/kiyaku/',
  // プライバシーポリシーのURL(任意で設定)
  privacyPolicyUrl: 'http://example.com/privacy'
};

var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);