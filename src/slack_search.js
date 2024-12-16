// これはメインプロセスで動作します
// SlackAPIから定期的にメッセージを取得し、Storeに保存します
// setting/setting.jsから設定を取得して使用します

import { WebClient } from "@slack/web-api";
import Store from "electron-store";
import { getSetting } from "./setting/setting.js";

const store = new Store(); // メッセージを保存するstore
const latestDMStoreKey = "latest-dm"; // 最新DMを保存するstoreのキー
const latestMentionStoreKey = "latest-mention"; // 最新メンションを保存するstoreのキー
const messageForNotifyStoreKey = "message-for-notify"; // 通知用のメッセージを保存するstoreのキー
const interval = 15 * 1000; // 検索実行間隔(ms)
let username = null; // Slackのユーザー名
let receiveMessageHandler = null; // 新着メッセージが来たことをmain.jsに通知するためのハンドラ

// Slack検索を開始
// handler: 新着メッセージが来たことを通知するためのハンドラ
// 定期的にsearch関数を実行する
export const startSlackSearch = async (handler) => {
  console.log("startSlackSearch");
  receiveMessageHandler = handler;
  setInterval(search, interval);
  search();
};

// Slack検索を実行
const search = async () => {
  console.log("search");
  // 設定を取得
  const setting = getSetting();
  if (!setting.slackToken) {
    // SlackTokenが未設定の場合は何もしない
    return;
  }
  // ユーザー名を取得(未取得の場合)
  username = username || (await getUsername(setting));
  if (!username) {
    return;
  }
  // 最新DMを取得
  const dm = await searchInner(setting, "to:me");
  const latestDM = store.get(latestDMStoreKey) || {};
  // 新着判定
  if (dm && dm.ts > (latestDM.ts || 0)) {
    console.log(dm);
    store.set(latestDMStoreKey, dm); // 次回新着判定用に保存
    store.set(messageForNotifyStoreKey, dm); // 通知用storeに保存
    receiveMessageHandler(dm); // 通知
    return;
  }

  // 最新メンションを取得
  const mention = await searchInner(setting, `'@${username}'`);
  const latestMention = store.get(latestMentionStoreKey) || {};
  // 新着判定
  if (mention && mention.ts > (latestMention.ts || 0)) {
    console.log(mention);
    store.set(latestMentionStoreKey, mention); // 次回新着判定用に保存
    store.set(messageForNotifyStoreKey, mention); // 通知用storeに保存
    receiveMessageHandler(mention); // 通知
    return;
  }
};

// Slack Web Clientを使用して検索結果を取得
const searchInner = async (setting, query) => {
  const client = new WebClient(setting.slackToken);
  return client.search
    .messages({ query: query, sort: "timestamp", sortDir: "desc" })
    .then((result) => {
      if (result.error) {
        return null;
      }
      if (result.messages.matches.length == 0) {
        return null;
      }
      return result.messages.matches[0];
    })
    .catch((error) => {
      return null;
    });
};

// Slack Web Clientを使用してユーザー名を取得
const getUsername = async (setting) => {
  const client = new WebClient(setting.slackToken);
  return await client.auth
    .test()
    .then((result) => {
      if (result.ok) {
        return result.user;
      }
      return null;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};
