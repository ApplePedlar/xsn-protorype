// これはメインプロセスで動作します
// 設定の読込・保存と、設定画面ウインドウの表示を行います
// 同ディレクトリのindex.html, preload.js, renderer.jsと連携して動作します

import { BrowserWindow, ipcMain } from "electron";
import Store from "electron-store";
import { getAbsoluteFilePath } from "../file_path_utils.js";

// プロセス間通信のチャンネル名 preload.jsと対応している
const saveChannel = "save";
const setDefaultChannel = "set-default";

// ipcMainのハンドラ登録済みフラグ
let handled = false;

// 設定値を保存するためのStoreインスタンス 実際の保存先はMacの場合は~/Library/Application Support/xsn/config.json
const store = new Store();
const settingStoreKey = "setting";

// ウインドウのインスタンス
let win = null;

// 設定画面を開く
export const openSettingWindow = async () => {
  if (!handled) {
    // レンダラ側で保存ボタンが押されたときの処理を登録
    ipcMain.handle(saveChannel, save);
    handled = true;
  }
  // 既に開いてたら一旦閉じる
  if (win) {
    if (!win.isDestroyed()) {
      win.destroy();
    }
  }
  // ウインドウを開く
  win = new BrowserWindow({
    width: 240,
    height: 100,
    webPreferences: {
      preload: getAbsoluteFilePath(import.meta.url, "./preload.js"),
    },
  });
  // ウインドウに表示するHTMLを読み込む
  await win.loadFile(getAbsoluteFilePath(import.meta.url, "./index.html"));
  // ウインドウにフォームのデフォルト値(現在の設定値)を送信
  win.webContents.send(setDefaultChannel, getSetting());
};

// 設定値をstoreに保存し、ウインドウを閉じる
const save = (_event, setting) => {
  store.set(settingStoreKey, setting);
  win.destroy();
};

// storeから設定値を読み込む
export const getSetting = () => {
  return store.get(settingStoreKey) || {};
};