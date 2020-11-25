

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyAp9VTqjvz-0U4OOmzL40YuwUi9sXTr3ms",
  authDomain: "dev18-chat-ef1ec.firebaseapp.com",
  databaseURL: "https://dev18-chat-ef1ec.firebaseio.com",
  projectId: "dev18-chat-ef1ec",
  storageBucket: "dev18-chat-ef1ec.appspot.com",
  messagingSenderId: "409923044268",
  appId: "1:409923044268:web:2b5420d30ff9a4922ab009"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//firebaseのデーターベース（保存させる場所）を使いますよと言うjsのコードを貼り付ける
// xxxxxスクリプトを貼り付ける
const newPostRef = firebase.database().ref();

//----------------------------------------------
// ドメインとポート番号
//----------------------------------------------
let domain = document.domain;
let port   = (domain === 'localhost')?  5000:80;