let user = firebase.auth().onAuthStateChanged( (user) => {
  console.log(user);

  //------------------------------------
  // 未ログイン状態で訪れた場合
  //------------------------------------
  if(user === null){
    showMessage('Not Login', 'ログインが必要な画面です');
    return(false);
  }

  //------------------------------------
  // メアド確認済み
  //------------------------------------
  if( user.emailVerified ) {
    showMessage('Tech Meetup', `${user.displayName}さん、こんにちは。`);
    $(".container").removeClass("hidden");
    $("header>h2").css('display', 'none');
    $("#username").val(`${user.displayName}`)
  }
  //------------------------------------
  // メアド未確認
  //------------------------------------
  else {
    user.sendEmailVerification()
      .then(()=>{
        showMessage('Send confirm mail', `${user.email}宛に確認メールを送信しました`);
      })
      .catch((error)=>{
        showMessage('[Error] Can not send mail', `${user.email}宛に確認メールを送信できませんでした: ${error}`);
      });
  }
});

function showMessage(title, msg) {
  document.querySelector('h1').innerText    = title;
  document.querySelector('#info').innerHTML = msg;
}

// 送信ボタンをクリックされたら次の処理をする
$("#send").on("click", function () {
  var now = new Date();
  // データを登録で送る
  newPostRef.push({                   // データを送るのはこの方法のみ！
    date: now.getFullYear() + ',' 
    + (now.getMonth()+1) + '/' 
    + now.getDate() + ','
    + now.getHours() + ':'
    + now.getMinutes()
    ,
    //名前
    username: $("#username").val(),
    //テキストエリア
    text: $("#text").val()
  })
  // 文字を空にする
  $("#text").val(""); //空にする
});

$("#text").on("keydown", function (e) {
  // エンターキーで送信出来る様にする
  if(e.keyCode == 13){
    if(e.shiftKey){
      // シフトキーと同時に押された時は送信されないようにする
      $.noop;
    } else if ($(this).val().replace(/\s+/g, "").length > 0){
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
// 受信処理
newPostRef.on("child_added", function (data) {
  //ここに保存されたデータが全て入ってくる
  // function (data)のdataにfirebaseのデータが入ってくる
  // let k = data.key;
  let v = data.val();
  //console.logで受信=firebaseに登録されている中身を確認しよう！
  //テンプレートリテラル `` を活用して変数にhtmlを埋め込もう！ 
  let str = `
  <p class="output-date">${v.date}</p>
  <p class="output-username">${v.username}<br>
  <p class="output-text">${v.text}</p>
  `;
  // ここでデータをhtmlに埋め込む prependには変数を埋め込もう！
  $("#output").prepend(str);
  // $("#output").prepend(str);
});

const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-stream');
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');
  const remoteVideos = document.getElementById('js-remote-streams');
  const roomId = document.getElementById('js-room-id');
  const roomMode = document.getElementById('js-room-mode');
  const localText = document.getElementById('js-local-text');
  const sendTrigger = document.getElementById('js-send-trigger');
  const messages = document.getElementById('js-messages');

  // sfuモードとmeshモード(サーバーへの負担とかの話)の選択をaタグのハッシュで切り替える関数
  const getRoomModeByHash = () => (location.hash === '#sfu' ? 'sfu' : 'mesh');

  roomMode.textContent = getRoomModeByHash();
  window.addEventListener(
    // ハッシュチェンジで発火
    'hashchange',
    () => (roomMode.textContent = getRoomModeByHash())
  );
  
  // ユーザー自身のカメラの設定
  const localStream = await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .catch(console.error);

  // Render local stream
  localVideo.muted = true;
  localVideo.srcObject = localStream;
  localVideo.playsInline = true;
  await localVideo.play().catch(console.error);

  // peer(電話番号的なもの)の設定、SkyWayで取得したAPIKeyをここに入力
  // eslint-disable-next-line require-atomic-updates
  const peer = (window.peer = new Peer({
    key: 'b5981b2c-5860-49b4-8d70-131b9ab631e2',
    debug: 3,
  }));

  // 入室の設定
  joinTrigger.addEventListener('click', () => {
    // Note that you need to ensure the peer has connected to signaling server
    // before using methods of peer instance.
    if (!peer.open) {
      return;
    }
    // ルーム名を指定してルームに参加（peer.joinRoom）
    const room = peer.joinRoom(roomId.value, {
      mode: getRoomModeByHash(),
      stream: localStream,
    });
    // 接続が成功するとopenイベントが発火する,onceは複数回実行されても1度しか実行しない関数を返す
    room.once('open', () => {
      messages.textContent += `=== ${roomId.value}へあなたが入室しました ===\n`;
    });
    // 他の人が入ってきたpeerJoinイベントで発火するメッセージ
    room.on('peerJoin', peerId => {
      messages.textContent += `=== ${peerId} joined ===\n`;
    });

    // Render remote stream for new peer join in the room
    room.on('stream', async stream => {
      const newVideo = document.createElement('video');
      newVideo.srcObject = stream;
      newVideo.playsInline = true;
      // mark peerId to find it later at peerLeave event
      newVideo.setAttribute('data-peer-id', stream.peerId);
      remoteVideos.append(newVideo);
      await newVideo.play().catch(console.error);
    });

    room.on('data', ({ data, displayName }) => {
      console.log(data);
      console.log(user.displayName);
      // Show a message sent to the room and who sent
      messages.textContent += `${displayName}: ${data}\n`;
    });

    // for closing room members
    room.on('peerLeave', peerId => {
      const remoteVideo = remoteVideos.querySelector(
        `[data-peer-id="${peerId}"]`
      );
      remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `=== ${peerId} left ===\n`;
    });

    // for closing myself
    room.once('close', () => {
      sendTrigger.removeEventListener('click', onClickSend);
      messages.textContent += '== You left ===\n';
      Array.from(remoteVideos.children).forEach(remoteVideo => {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
        remoteVideo.remove();
      });
    });

    sendTrigger.addEventListener('click', onClickSend);
    leaveTrigger.addEventListener('click', () => room.close(), { once: true });

    function onClickSend() {
      // Send message to all of the peers in the room via websocket
      room.send(localText.value);

      messages.textContent += `${peer.id}: ${localText.value}\n`;
      localText.value = '';
    }
  });

  peer.on('error', console.error);
})();