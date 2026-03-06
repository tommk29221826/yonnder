// ===================================================
// 暇つぶし読書仕分けアプリ - script.js
// ===================================================

// ---------------------------------------------------
// サンプルデータ（青空文庫の実在作品）
// 将来的に loadBooks() を差し替えることで外部データに切り替えられます
// ---------------------------------------------------
const SAMPLE_BOOKS = [
  { title: "吾輩は猫である", author: "夏目漱石" },
  { title: "坊つちやん", author: "夏目漱石" },
  { title: "こころ", author: "夏目漱石" },
  { title: "三四郎", author: "夏目漱石" },
  { title: "それから", author: "夏目漱石" },
  { title: "門", author: "夏目漱石" },
  { title: "行人", author: "夏目漱石" },
  { title: "道草", author: "夏目漱石" },
  { title: "明暗", author: "夏目漱石" },
  { title: "虞美人草", author: "夏目漱石" },
  { title: "羅生門", author: "芥川龍之介" },
  { title: "藪の中", author: "芥川龍之介" },
  { title: "鼻", author: "芥川龍之介" },
  { title: "芋粥", author: "芥川龍之介" },
  { title: "地獄変", author: "芥川龍之介" },
  { title: "蜘蛛の糸", author: "芥川龍之介" },
  { title: "杜子春", author: "芥川龍之介" },
  { title: "河童", author: "芥川龍之介" },
  { title: "或阿呆の一生", author: "芥川龍之介" },
  { title: "歯車", author: "芥川龍之介" },
  { title: "舞姫", author: "森鴎外" },
  { title: "高瀬舟", author: "森鴎外" },
  { title: "山椒大夫", author: "森鴎外" },
  { title: "阿部一族", author: "森鴎外" },
  { title: "雁", author: "森鴎外" },
  { title: "ヰタ・セクスアリス", author: "森鴎外" },
  { title: "伊豆の踊子", author: "川端康成" },
  { title: "雪国", author: "川端康成" },
  { title: "眠れる美女", author: "川端康成" },
  { title: "山の音", author: "川端康成" },
  { title: "富嶽百景", author: "太宰治" },
  { title: "走れメロス", author: "太宰治" },
  { title: "斜陽", author: "太宰治" },
  { title: "人間失格", author: "太宰治" },
  { title: "グッド・バイ", author: "太宰治" },
  { title: "女生徒", author: "太宰治" },
  { title: "津軽", author: "太宰治" },
  { title: "ヴィヨンの妻", author: "太宰治" },
  { title: "銀河鉄道の夜", author: "宮沢賢治" },
  { title: "注文の多い料理店", author: "宮沢賢治" },
  { title: "風の又三郎", author: "宮沢賢治" },
  { title: "セロ弾きのゴーシュ", author: "宮沢賢治" },
  { title: "春と修羅", author: "宮沢賢治" },
  { title: "オツベルと象", author: "宮沢賢治" },
  { title: "雨ニモマケズ", author: "宮沢賢治" },
  { title: "江戸川乱歩傑作選", author: "江戸川乱歩" },
  { title: "D坂の殺人事件", author: "江戸川乱歩" },
  { title: "心理試験", author: "江戸川乱歩" },
  { title: "屋根裏の散歩者", author: "江戸川乱歩" },
  { title: "人間椅子", author: "江戸川乱歩" },
];

// ---------------------------------------------------
// localStorage のキー定数
// ---------------------------------------------------
const STORAGE_KEY_READ   = "hima_read_books";
const STORAGE_KEY_UNREAD = "hima_unread_books";

// ---------------------------------------------------
// アプリの状態
// ---------------------------------------------------
let books        = [];       // 作品一覧
let currentBook  = null;     // 現在表示中の作品
let lastBookKey  = null;     // 直前に表示した作品のキー（連続表示防止）

// ---------------------------------------------------
// ページ読み込み時の初期化
// ---------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/** アプリ初期化 */
function initApp() {
  loadBooks();           // 作品データをセット
  renderStats();         // 件数を表示
  renderLists();         // 保存済み一覧を表示
  bindEvents();          // ボタンイベントを登録
}

// ---------------------------------------------------
// データ読み込み
// ---------------------------------------------------

/**
 * 作品データをセットする関数
 *
 * 【差し替えポイント】
 * 将来的に青空文庫APIや外部JSONから取得する場合は
 * この関数の中身を書き換えてください。
 * books 配列に { title, author } の形式でデータを入れれば動きます。
 *
 * 例（fetch を使う場合）:
 *   const res = await fetch("https://example.com/aozora.json");
 *   const data = await res.json();
 *   books = data.map(item => ({ title: item.title, author: item.person_name }));
 */
function loadBooks() {
  books = SAMPLE_BOOKS;
}

// ---------------------------------------------------
// ランダム表示
// ---------------------------------------------------

/** ランダムに1件の作品を選んで表示する */
function showRandomBook() {
  if (books.length === 0) {
    showError("作品データが読み込まれていません。");
    return;
  }

  // 連続して同じ作品が出ないよう除外リストを作る
  const candidates = books.filter(b => makeKey(b) !== lastBookKey);

  // 候補が0件（作品が1件しかない場合）は全体から選ぶ
  const pool = candidates.length > 0 ? candidates : books;

  const index = Math.floor(Math.random() * pool.length);
  currentBook  = pool[index];
  lastBookKey  = makeKey(currentBook);

  renderBook(currentBook);
  enableActionButtons(true);
  hideError();
}

// ---------------------------------------------------
// 仕分け保存
// ---------------------------------------------------

/** 現在の作品を「読んだ」として保存する */
function markAsRead() {
  if (!currentBook) return;
  saveBook(currentBook, STORAGE_KEY_READ, STORAGE_KEY_UNREAD);
}

/** 現在の作品を「読んでない」として保存する */
function markAsUnread() {
  if (!currentBook) return;
  saveBook(currentBook, STORAGE_KEY_UNREAD, STORAGE_KEY_READ);
}

/**
 * 作品を保存する（重複チェック付き）
 * @param {Object} book        - 保存する作品 { title, author }
 * @param {string} targetKey   - 保存先 localStorage キー
 * @param {string} oppositeKey - 反対側の localStorage キー（重複確認用）
 */
function saveBook(book, targetKey, oppositeKey) {
  const targetList   = getList(targetKey);
  const oppositeList = getList(oppositeKey);
  const key          = makeKey(book);

  // 既に同じカテゴリに保存済みなら何もしない
  if (targetList.some(b => makeKey(b) === key)) {
    return;
  }

  // 反対カテゴリにあれば削除して付け替える
  const filtered = oppositeList.filter(b => makeKey(b) !== key);
  saveList(oppositeKey, filtered);

  // 対象カテゴリに追加して保存
  targetList.push(book);
  saveList(targetKey, targetList);

  renderStats();
  renderLists();
}

// ---------------------------------------------------
// localStorage 操作
// ---------------------------------------------------

/** localStorage から作品一覧を取得する */
function getList(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("localStorage の読み込みに失敗しました:", e);
    return [];
  }
}

/** localStorage に作品一覧を保存する */
function saveList(storageKey, list) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (e) {
    console.error("localStorage への保存に失敗しました:", e);
    showError("保存に失敗しました。ストレージの空き容量を確認してください。");
  }
}

// ---------------------------------------------------
// 画面描画
// ---------------------------------------------------

/** 作品情報をカードに表示する */
function renderBook(book) {
  const hint     = document.querySelector(".hint");
  const bookInfo = document.getElementById("book-info");
  const titleEl  = document.getElementById("book-title");
  const authorEl = document.getElementById("book-author");

  hint.classList.add("hidden");
  bookInfo.classList.remove("hidden");
  titleEl.textContent  = book.title;
  authorEl.textContent = "著者：" + book.author;
}

/** 件数カウンターを更新する */
function renderStats() {
  const readCount   = getList(STORAGE_KEY_READ).length;
  const unreadCount = getList(STORAGE_KEY_UNREAD).length;

  document.getElementById("count-read").textContent   = readCount;
  document.getElementById("count-unread").textContent = unreadCount;
}

/** 保存済み一覧を更新する */
function renderLists() {
  const readList   = getList(STORAGE_KEY_READ);
  const unreadList = getList(STORAGE_KEY_UNREAD);

  renderBookList("list-read",   readList);
  renderBookList("list-unread", unreadList);
}

/**
 * 指定した <ul> 要素に作品リストを描画する
 * @param {string}   ulId  - <ul> 要素の id
 * @param {Object[]} list  - 作品の配列
 */
function renderBookList(ulId, list) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = "";

  if (list.length === 0) {
    const li = document.createElement("li");
    li.className   = "empty-item";
    li.textContent = "まだありません";
    ul.appendChild(li);
    return;
  }

  list.forEach(book => {
    const li     = document.createElement("li");
    const title  = document.createElement("span");
    const author = document.createElement("span");

    title.className   = "item-title";
    title.textContent = book.title;

    author.className   = "item-author";
    author.textContent = "／" + book.author;

    li.appendChild(title);
    li.appendChild(author);
    ul.appendChild(li);
  });
}

// ---------------------------------------------------
// エラー表示
// ---------------------------------------------------

/** エラーメッセージを表示する */
function showError(message) {
  const errEl = document.getElementById("error-msg");
  errEl.textContent = message;
  errEl.classList.remove("hidden");

  // カード内のヒントと作品情報を隠す
  document.querySelector(".hint").classList.add("hidden");
  document.getElementById("book-info").classList.add("hidden");
}

/** エラーメッセージを非表示にする */
function hideError() {
  document.getElementById("error-msg").classList.add("hidden");
}

// ---------------------------------------------------
// ボタン制御
// ---------------------------------------------------

/** 「読んだ」「読んでない」ボタンの有効/無効を切り替える */
function enableActionButtons(enabled) {
  document.getElementById("btn-read").disabled   = !enabled;
  document.getElementById("btn-unread").disabled = !enabled;
}

/** ボタンにイベントリスナーを登録する */
function bindEvents() {
  document.getElementById("btn-random").addEventListener("click", showRandomBook);
  document.getElementById("btn-read").addEventListener("click",   markAsRead);
  document.getElementById("btn-unread").addEventListener("click", markAsUnread);
}

// ---------------------------------------------------
// ユーティリティ
// ---------------------------------------------------

/**
 * 作品を一意に識別するキー文字列を生成する
 * 重複チェックや連続表示防止に使用
 * @param {Object} book - { title, author }
 * @returns {string}
 */
function makeKey(book) {
  return book.title + "__" + book.author;
}
