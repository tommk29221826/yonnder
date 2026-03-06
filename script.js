// ===================================================
// 暇つぶし読書仕分けアプリ - script.js
// ===================================================

// ---------------------------------------------------
// フォールバック用サンプルデータ（青空文庫の実在作品）
// CSV読み込みに失敗した場合に使用されます
// ---------------------------------------------------
const SAMPLE_BOOKS = [
  { title: "吾輩は猫である",       author: "夏目 漱石",   url: "https://www.aozora.gr.jp/cards/000148/files/789_14547.html" },
  { title: "坊つちやん",           author: "夏目 漱石",   url: "https://www.aozora.gr.jp/cards/000148/files/752_14964.html" },
  { title: "こころ",               author: "夏目 漱石",   url: "https://www.aozora.gr.jp/cards/000148/files/773_14836.html" },
  { title: "羅生門",               author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/127_15260.html" },
  { title: "蜘蛛の糸",             author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/92_14545.html" },
  { title: "舞姫",                 author: "森 鴎外",     url: "https://www.aozora.gr.jp/cards/000129/files/682_14948.html" },
  { title: "高瀬舟",               author: "森 鴎外",     url: "https://www.aozora.gr.jp/cards/000129/files/681_16714.html" },
  { title: "富嶽百景",             author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/2144_8504.html" },
  { title: "走れメロス",           author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/1567_14913.html" },
  { title: "人間失格",             author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/301_14817.html" },
  { title: "銀河鉄道の夜",         author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/456_15050.html" },
  { title: "注文の多い料理店",     author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/1927_18597.html" },
];

// ---------------------------------------------------
// 青空文庫 CSV URL
// ---------------------------------------------------
const AOZORA_CSV_ZIP_URL = "https://www.aozora.gr.jp/index_pages/list_person_all_extended_utf8.zip";

// ---------------------------------------------------
// localStorage のキー定数
// ---------------------------------------------------
const STORAGE_KEY_READ   = "hima_read_books";
const STORAGE_KEY_UNREAD = "hima_unread_books";

// ---------------------------------------------------
// アプリの状態
// ---------------------------------------------------
let books        = [];   // 作品一覧
let currentBook  = null; // 現在表示中の作品
let lastBookKey  = null; // 直前に表示した作品のキー（連続表示防止）

// ---------------------------------------------------
// ページ読み込み時の初期化
// ---------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/** アプリ初期化 */
async function initApp() {
  setLoadingState(true);
  await loadBooks();
  setLoadingState(false);
  renderStats();
  renderLists();
  bindEvents();
}

// ---------------------------------------------------
// データ読み込み
// ---------------------------------------------------

/**
 * 青空文庫の公開CSVを取得して作品データをセットする。
 * 失敗した場合は SAMPLE_BOOKS にフォールバックする。
 */
async function loadBooks() {
  try {
    const response = await fetch(AOZORA_CSV_ZIP_URL);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // ZIP 内の CSV ファイルを取得
    const csvFileEntry = zip.file(/\.csv$/i)[0];
    if (!csvFileEntry) throw new Error("CSV file not found in ZIP");

    // UTF-8 として正しくデコード
    const uint8 = await csvFileEntry.async("uint8array");
    const csvText = new TextDecoder("utf-8").decode(uint8);

    const parsed = parseAozoraCsv(csvText);
    if (parsed.length === 0) throw new Error("No books parsed from CSV");

    books = parsed;
    console.info("青空文庫CSV読み込み完了:", books.length, "件");
  } catch (e) {
    console.warn("青空文庫CSVの読み込みに失敗しました。サンプルデータを使用します:", e);
    books = SAMPLE_BOOKS;
  }
}

/**
 * 青空文庫の拡張CSVテキストをパースして作品配列を返す。
 * @param {string} csvText - UTF-8 CSV テキスト
 * @returns {{ title: string, author: string, url: string }[]}
 */
function parseAozoraCsv(csvText) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);

  const idx = {
    workId:    headers.indexOf("作品ID"),
    title:     headers.indexOf("作品名"),
    lastName:  headers.indexOf("姓"),
    firstName: headers.indexOf("名"),
    copyright: headers.indexOf("作品著作権フラグ"),
    htmlUrl:   headers.indexOf("XHTML/HTMLファイルURL"),
    cardUrl:   headers.indexOf("図書カードURL"),
  };

  if (idx.workId < 0 || idx.title < 0 || idx.lastName < 0) return [];

  const result = [];
  const seenWorkIds = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = parseCsvLine(line);

    const workId = cols[idx.workId] || "";
    if (!workId || seenWorkIds.has(workId)) continue;
    seenWorkIds.add(workId);

    // 著作権あり（まだパブリックドメインでない）は除外
    if (idx.copyright >= 0 && cols[idx.copyright] === "あり") continue;

    const title     = cols[idx.title] || "";
    const lastName  = cols[idx.lastName] || "";
    const firstName = cols[idx.firstName] || "";
    const author    = (lastName + " " + firstName).trim();

    if (!title || !author) continue;

    // 読めるURL: HTMLファイル優先、なければ図書カード
    const htmlUrl = idx.htmlUrl >= 0 ? (cols[idx.htmlUrl] || "") : "";
    const cardUrl = idx.cardUrl >= 0 ? (cols[idx.cardUrl] || "") : "";
    const url = htmlUrl || cardUrl;

    result.push({ title, author, url });
  }

  return result;
}

/**
 * CSV の1行をフィールドの配列に分割する（ダブルクォート対応）。
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // エスケープされたダブルクォート
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------
// ローディング状態制御
// ---------------------------------------------------

/** データ読み込み中/完了の UI 状態を切り替える */
function setLoadingState(loading) {
  const hintEl    = document.getElementById("hint-msg");
  const btnRandom = document.getElementById("btn-random");

  if (loading) {
    hintEl.textContent = "作品データを読み込み中...";
    hintEl.classList.remove("hidden");
    btnRandom.disabled = true;
    btnRandom.textContent = "読み込み中...";
  } else {
    hintEl.textContent = "「ランダム表示」を押して作品を表示してください";
    btnRandom.disabled = false;
    btnRandom.textContent = "ランダム表示";
  }
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

  const index     = Math.floor(Math.random() * pool.length);
  currentBook     = pool[index];
  lastBookKey     = makeKey(currentBook);

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
 * @param {Object} book        - 保存する作品 { title, author, url }
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
  const hintEl   = document.getElementById("hint-msg");
  const bookInfo = document.getElementById("book-info");
  const titleEl  = document.getElementById("book-title");
  const authorEl = document.getElementById("book-author");

  hintEl.classList.add("hidden");
  bookInfo.classList.remove("hidden");
  titleEl.textContent  = book.title;
  authorEl.textContent = "著者：" + book.author;

  // 青空文庫URLの有無でボタンの有効/無効を切り替える
  const btnAozora = document.getElementById("btn-aozora");
  btnAozora.disabled = !book.url;
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
  document.getElementById("hint-msg").classList.add("hidden");
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
  // 青空文庫ボタンは currentBook の url の有無で別途制御するため、
  // enabled=false のとき（作品未表示時）のみ無効化する
  if (!enabled) {
    document.getElementById("btn-aozora").disabled = true;
  }
}

/** 現在表示中の作品の青空文庫ページを新しいタブで開く */
function openAozora() {
  if (!currentBook || !currentBook.url) return;
  window.open(currentBook.url, "_blank", "noopener,noreferrer");
}

/** ボタンにイベントリスナーを登録する */
function bindEvents() {
  document.getElementById("btn-random").addEventListener("click", showRandomBook);
  document.getElementById("btn-read").addEventListener("click",   markAsRead);
  document.getElementById("btn-unread").addEventListener("click", markAsUnread);
  document.getElementById("btn-aozora").addEventListener("click", openAozora);
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
