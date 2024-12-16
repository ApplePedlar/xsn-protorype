// これはメインプロセスで動作します
// app.whenReady().thenがこのアプリのエントリーポイントです
// このファイルはアプリケーション全体の制御を担当します

import { app, Tray, Menu } from "electron";
import { getSetting, openSettingWindow } from "./setting/setting.js";
import { startSlackSearch } from "./slack_search.js";
import { openNotifyWindow } from "./notify/notify.js";
import { getAbsoluteFilePath } from "./file_path_utils.js";

// アプリケーションが起動したときの処理
app.whenReady().then(() => {
  // タスクトレイの初期化
  initTray();
  // Dockアイコンを非表示
  app.dock.hide();
  // 設定を読み込む
  const setting = getSetting();
  // SlackTokenが未設定の場合は設定画面を開く
  if (!setting.slackToken) {
    openSettingWindow();
  }
  // Slack検索定期実行を開始
  startSlackSearch(onReceiveNewMessage);
});

// タスクトレイの初期化
const initTray = () => {
  let imgFilePath = getAbsoluteFilePath(import.meta.url, "../resources/trayicon.png");
  const tray = new Tray(imgFilePath);
  tray.setToolTip(app.name);
  const contextMenu = Menu.buildFromTemplate([
    { label: "設定", click: openSettingWindow },
    { label: "終了", role: "quit" },
  ]);
  tray.setContextMenu(contextMenu);
};

// 新しいメッセージを受信したときの処理
const onReceiveNewMessage = (notifiedMessage) => {
  // 通知を表示
  openNotifyWindow(notifiedMessage);
  // TODO ここで履歴保存とかやりたい
};

// ウインドウを全部閉じたときの処理
// デフォルト動作はアプリ終了なので空の関数を設定して終了しないようにする
app.on("window-all-closed", () => {});