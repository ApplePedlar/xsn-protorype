// このファイルはレンダラープロセスで実行されます。
// DOMを操作することができます。
// node_modulesやNode.js組み込みモジュールを使うことはできません。
// window.electronAPI(preload.jsで定義)を通じてメインプロセスと通信を行います。

// フォームエレメントを取得
const slackToken = document.getElementById("slack-token");
const saveButton = document.getElementById("save-button");

// 保存ボタンが押されたら設定値をメインプロセスに送信
saveButton.addEventListener("click", async () => {
  setting = {};
  setting.slackToken = slackToken.value;
  await window.electronAPI.saveSetting(setting);
});

// メインプロセスからデフォルト値を受け取ってフォームにセット
window.electronAPI.onSetDefault((_event, setting) => {
  if (setting.slackToken) {
    slackToken.value = setting.slackToken;
  }
});