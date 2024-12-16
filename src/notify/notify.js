// storeから最新メッセージを取得し、通知ダイアログを表示します

import { getAbsoluteFilePath } from "../file_path_utils.js";
import { BrowserWindow, ipcMain, shell, screen } from "electron";

let message = null; // 通知するメッセージ
let win = null; // ウインドウのインスタンス
let handled = false; // ipcMainのハンドラ登録済みフラグ

// 通知画面を表示します
export const openNotifyWindow = async (newMessage) => {
  // 引数を保存
  message = newMessage;

  // クリックイベントのハンドラを登録
  if (!handled) {
    ipcMain.handle("click-event", onClick);
    handled = true;
  }

  // 既にウインドウを開いてたら何もしない
  if (win) {
    return;
  }

  // プライマリディスプレイを取得し、その座標とサイズを使って全画面表示でウインドを開く
  const display = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    x: display.workArea.x,
    y: display.workArea.y,
    width: display.workArea.width,
    height: display.workArea.height,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: getAbsoluteFilePath(import.meta.url, "./preload.js"),
    },
  });
  await win.loadFile(getAbsoluteFilePath(import.meta.url, "./index.html"));
};

// 通知画面がクリックされたときの処理
const onClick = () => {
  // SlackのURLを生成して開く。
  // URLはslack://なのでSlack.appが開き、クエリ文字列に対応した画面が表示される
  const slackUrl = createSlackUrl(message);
  console.log(slackUrl);
  shell.openExternal(slackUrl);
  win.destroy(); // 通知画面を閉じる
  win = null;
};

// SlackのURLを生成
const createSlackUrl = (message) => {
  let slackUrl =
    "slack://channel?team=" +
    message.team +
    "&id=" +
    message.channel.id +
    "&message=" +
    message.ts;
  // threads_tsを付加することでスレッド内のメッセージを表示できる
  const threadTsIndex = message.permalink.indexOf("?thread_ts=");
  if (threadTsIndex != -1) {
    slackUrl += "&" + message.permalink.substring(threadTsIndex + 1);
  }
  return slackUrl;
};
