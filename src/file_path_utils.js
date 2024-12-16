// これはメインプロセス用です。
// ファイルパスに関する汎用的な関数を定義しています。

import path from "node:path";
import { fileURLToPath } from "url";

// 相対パスを絶対パスに変換
// 第一引数には import.meta.url を渡すこと。
export const getAbsoluteFilePath = (importMetaURL, relativePath) => {
  return path.join(path.dirname(fileURLToPath(importMetaURL)), relativePath);
};