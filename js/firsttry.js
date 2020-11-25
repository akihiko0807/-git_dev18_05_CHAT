

//firebaseのデーターベース（保存させる場所）を使いますよと言うjsのコードを貼り付ける
// xxxxxスクリプトを貼り付ける
const newPostRef = firebase.database().ref();

document.addEventListener('DOMContentLoaded', function () {
  try {
    let app = firebase.app();
    let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
    document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
  } catch (e) {
    console.error(e);
    document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
  }
});

let email = document.getElementById('email').value
let password = document.getElementById('password').value
let auth = document.getElementById('auth')
let emailVerify = document.getElementById('emailVerify')
let USER;

// 認証状態確認、表示処理
let unsubscribe = firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('ログイン済み')
    auth.innerText = 'ログイン済み'
    if (user.emailVerified) emailVerify.innerText = 'メール確認済み'
    else emailVerify.innerText = 'メール確認できていません'
    USER = user
  } else {
    console.log('未ログイン')
    auth.innerText = '未ログイン'
    document.getElementById('emailVerify').innerText = 'ログイン後に確認します。'
  }
})

// 新規登録処理
function signup() {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      console.log('ユーザー作成完了')
      alert('ユーザー作成完了')
    })
    .catch((error) => {
      console.log('ユーザー作成失敗', error);
      alert('ユーザー作成失敗')
    });
}
// ログイン処理
function login() {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log('ログイン完了')
      alert('ログイン完了')
    })
    .catch((error) => {
      console.log('ログイン失敗', error);
      alert('ログイン失敗')
    });
}


// ログアウト処理
function logout() {
  firebase.auth().signOut().then(() => {
    console.log('ログアウトしました')
    alert('ログアウトしました')
    document.getElementById('emailVerify').innerHTML = 'ログイン後に確認します'
  }).catch((error) => {
    console.log('ログアウト失敗', error);
    alert('ログアウト失敗')
  })
}

// 確認メール送信送信処理
function sendVerifyEmail() {
  if (!USER) {
    console.log('ログインしてください')
    alert('ログインしてください')
    return;
  }
  USER.sendEmailVerification().then(function () {
    console.log('メール送信しました')
    alert('メール送信しました')
  }).catch(function (error) {
    console.log('メール送信失敗')
    alert('メール送信失敗')
  });
}


// 送信ボタンをクリックされたら次の処理をする
$("#send").on("click", function () {

  // データを登録で送る
  newPostRef.push({                   // データを送るのはこの方法のみ！
    //名前
    username:$("#username").val(),
    //テキストエリア
    text: $("#text").val()
  })
  // 文字を空にする
  $("#username").val(""); //空にする
  $("#text").val(""); //空にする
});

// 受信処理
newPostRef.on("child_added", function (data) {
  let v = data.val(); //ここに保存されたデータが全て入ってくる
  let k = data.key; // ユニークキー取得
  
  // function (data)のdataにfirebaseのデータが入ってくる

  // let k = data.key; //今回は使いません

  //console.logで受信=firebaseに登録されている中身を確認しよう！
  console.log(v);
  //テンプレートリテラル `` を活用して変数にhtmlを埋め込もう！ 
  let str = `<p>
  ${v.username}<br>
  ${v.text}
  </p>`;

  // ここでデータをhtmlに埋め込む prependには変数を埋め込もう！
  $("#output").prepend(str);
});

$("#text").on("keydown", function (e) {
  // エンターキーで送信出来る様にする
  if(e.keyCode == 13){
    if(e.shiftKey){
      // シフトキーと同時に押された時は送信されないようにする
      $.noop;
    } else if ($("#text").val().replace(/\s/g, "").length > 0){
      // 空白や改行は空文字へ変換されてその上で1文字以上の時のみ送信されつつ、
      // 送信後と同時に行われる改行もなくす。
      e.preventDefault();
      $("#send").click();
      console.log(e);
    }
  } else {
    $.noop;
  }
});