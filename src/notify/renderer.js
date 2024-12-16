// id="clickable"のDOM要素がクリックされたらrunClickEventを実行
// runClickEventはpreload.jsで定義されており、click-eventチャンネルにイベントを送信します。
// click-eventチャンネルはメインプロセスのnotify.jsでハンドリングされており、最終的にはonClick関数が実行されます。
document.getElementById("clickable").addEventListener("click", async () => {
  await window.electronAPI.runClickEvent();
});
