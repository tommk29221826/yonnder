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
  { title: "それから",             author: "夏目 漱石",   url: "https://www.aozora.gr.jp/cards/000148/files/711_14729.html" },
  { title: "三四郎",               author: "夏目 漱石",   url: "https://www.aozora.gr.jp/cards/000148/files/794_14946.html" },
  { title: "羅生門",               author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/127_15260.html" },
  { title: "蜘蛛の糸",             author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/92_14545.html" },
  { title: "鼻",                   author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/42_15228.html" },
  { title: "藪の中",               author: "芥川 龍之介", url: "https://www.aozora.gr.jp/cards/000879/files/179_15237.html" },
  { title: "舞姫",                 author: "森 鴎外",     url: "https://www.aozora.gr.jp/cards/000129/files/682_14948.html" },
  { title: "高瀬舟",               author: "森 鴎外",     url: "https://www.aozora.gr.jp/cards/000129/files/681_16714.html" },
  { title: "雁",                   author: "森 鴎外",     url: "https://www.aozora.gr.jp/cards/000129/files/680_20385.html" },
  { title: "富嶽百景",             author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/2144_8504.html" },
  { title: "走れメロス",           author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/1567_14913.html" },
  { title: "人間失格",             author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/301_14817.html" },
  { title: "斜陽",                 author: "太宰 治",     url: "https://www.aozora.gr.jp/cards/000035/files/1565_8559.html" },
  { title: "銀河鉄道の夜",         author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/456_15050.html" },
  { title: "注文の多い料理店",     author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/1927_18597.html" },
  { title: "風の又三郎",           author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/470_15380.html" },
  { title: "セロ弾きのゴーシュ",   author: "宮沢 賢治",   url: "https://www.aozora.gr.jp/cards/000081/files/470_15380.html" },
  { title: "伊豆の踊子",           author: "川端 康成",   url: "https://www.aozora.gr.jp/cards/001332/files/49888_46045.html" },
  { title: "みだれ髪",             author: "与謝野 晶子", url: "https://www.aozora.gr.jp/cards/000885/files/3651_10021.html" },
  { title: "一握の砂",             author: "石川 啄木",   url: "https://www.aozora.gr.jp/cards/000153/files/816_20298.html" },
  { title: "悲しき玩具",           author: "石川 啄木",   url: "https://www.aozora.gr.jp/cards/000153/files/817_19085.html" },
];

// ---------------------------------------------------
// 一文ガチャ用データ
// CSVロードの成否に関わらず常に有効なデータとして保持する
// quote フィールドを持つ作品のみ対象となる
// ---------------------------------------------------
const QUOTE_BOOKS = [
  {
    title:  "人間失格",
    author: "太宰 治",
    url:    "https://www.aozora.gr.jp/cards/000035/files/301_14817.html",
    quote:  "恥の多い生涯を送って来ました。",
  },
  {
    title:  "吾輩は猫である",
    author: "夏目 漱石",
    url:    "https://www.aozora.gr.jp/cards/000148/files/789_14547.html",
    quote:  "吾輩は猫である。名前はまだ無い。",
  },
  {
    title:  "走れメロス",
    author: "太宰 治",
    url:    "https://www.aozora.gr.jp/cards/000035/files/1567_14913.html",
    quote:  "メロスは激怒した。",
  },
  {
    title:  "羅生門",
    author: "芥川 龍之介",
    url:    "https://www.aozora.gr.jp/cards/000879/files/127_15260.html",
    quote:  "ある日の暮方のことである。",
  },
  {
    title:  "こころ",
    author: "夏目 漱石",
    url:    "https://www.aozora.gr.jp/cards/000148/files/773_14836.html",
    quote:  "私はその人を常に先生と呼んでいた。",
  },
  {
    title:  "舞姫",
    author: "森 鴎外",
    url:    "https://www.aozora.gr.jp/cards/000129/files/682_14948.html",
    quote:  "石炭をば早や積み果てつ。",
  },
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
// 作者ガチャ用定数
// ---------------------------------------------------
const AUTHOR_PAGE_SIZE = 10;

// ---------------------------------------------------
// アプリの状態
// ---------------------------------------------------
let books            = [];      // 作品一覧（CSV or サンプル）
let currentBook      = null;    // 現在表示中の作品
let lastBookKey      = null;    // 直前に表示した作品のキー（連続表示防止）
let authorMap        = {};      // 作者名 -> 作品配列 のマップ
let authorList       = [];      // 作者名一覧
let currentAuthor    = null;    // 現在表示中の作者
let authorBookOffset = 0;       // 作者の作品一覧の現在の表示件数
let currentMode      = "idle";  // 表示モード: "idle" | "book" | "author" | "quote"
let answerRevealed   = false;   // 一文ガチャで答えを表示済みかどうか

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
  buildAuthorMap();
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

  console.log("一文ガチャの対象件数:", QUOTE_BOOKS.length, "件");
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
// 作者マップ構築
// ---------------------------------------------------

/** books 配列から author ごとに作品をグループ化する */
function buildAuthorMap() {
  authorMap = {};
  for (const book of books) {
    if (!authorMap[book.author]) {
      authorMap[book.author] = [];
    }
    authorMap[book.author].push(book);
  }
  authorList = Object.keys(authorMap);
}

// ---------------------------------------------------
// ローディング状態制御
// ---------------------------------------------------

/** データ読み込み中/完了の UI 状態を切り替える */
function setLoadingState(loading) {
  const hintEl    = document.getElementById("hint-msg");
  const btnRandom = document.getElementById("btn-random");
  const btnAuthor = document.getElementById("btn-author");
  const btnQuote  = document.getElementById("btn-quote");

  if (loading) {
    hintEl.textContent = "作品データを読み込み中...";
    hintEl.classList.remove("hidden");
    btnRandom.disabled = true;
    btnRandom.textContent = "読み込み中...";
    btnAuthor.disabled = true;
    btnAuthor.textContent = "読み込み中...";
    btnQuote.disabled = true;
    btnQuote.textContent = "読み込み中...";
  } else {
    hintEl.textContent = "「作品ガチャ」を押して作品を表示してください";
    btnRandom.disabled = false;
    btnRandom.textContent = "作品ガチャ";
    btnAuthor.disabled = false;
    btnAuthor.textContent = "作者ガチャ";
    btnQuote.disabled = false;
    btnQuote.textContent = "一文ガチャ";
  }
}

// ---------------------------------------------------
// 作品ガチャ
// ---------------------------------------------------

/**
 * 「読んだ」に登録されていない未読作品の一覧を返す。
 * 一度も仕分けしていない作品も未読として扱う。
 * @returns {Object[]}
 */
function getUnreadBooks() {
  const readKeys = new Set(getList(STORAGE_KEY_READ).map(makeKey));
  return books.filter(b => !readKeys.has(makeKey(b)));
}

/**
 * pool からランダムに1件選ぶ。lastBookKey と一致する作品は除外し、
 * 候補が0件になった場合（pool に1件しかない場合）は pool 全体から選ぶ。
 * @param {Object[]} pool
 * @returns {Object}
 */
function pickRandom(pool) {
  const candidates = pool.filter(b => makeKey(b) !== lastBookKey);
  const source     = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

/** ランダムに1件の作品を選んで表示する（未読作品を優先）*/
function showRandomBook() {
  if (books.length === 0) {
    showError("作品データが読み込まれていません。");
    return;
  }

  currentMode = "book";

  // 未読作品（「読んだ」に登録されていない作品）を優先する
  const unread = getUnreadBooks();
  const pool   = unread.length > 0 ? unread : books;

  currentBook = pickRandom(pool);
  lastBookKey = makeKey(currentBook);

  // 作者ガチャセクションを隠す
  document.getElementById("author-section").classList.add("hidden");
  // 一文ガチャ表示を隠す
  hideQuoteDisplay();

  renderBook(currentBook);
  enableActionButtons(true);
  hideError();
}

// ---------------------------------------------------
// 作者ガチャ
// ---------------------------------------------------

/** ランダムに1人の作者を選んで表示する */
function showRandomAuthor() {
  if (authorList.length === 0) {
    showError("作者データが読み込まれていません。");
    return;
  }

  currentMode = "author";

  // 一文ガチャ表示を隠す（作品ガチャで表示されたカードはそのままにする）
  if (currentMode === "quote") {
    hideQuoteDisplay();
  }

  const index = Math.floor(Math.random() * authorList.length);
  currentAuthor    = authorList[index];
  authorBookOffset = 0;

  renderAuthorSection(currentAuthor);
  hideError();
}

/** 作者ガチャのセクションを描画する */
function renderAuthorSection(author) {
  const section  = document.getElementById("author-section");
  const nameEl   = document.getElementById("author-name");
  const countEl  = document.getElementById("author-book-count");
  const listEl   = document.getElementById("author-book-list");
  const moreBtn  = document.getElementById("btn-more-books");

  const bookList = authorMap[author] || [];

  nameEl.textContent  = author;
  countEl.textContent = "作品数：" + bookList.length + "件";

  // 最初の AUTHOR_PAGE_SIZE 件を表示
  authorBookOffset = Math.min(AUTHOR_PAGE_SIZE, bookList.length);
  renderAuthorBookItems(listEl, bookList, 0, authorBookOffset);

  // 「もっと見る」ボタンの表示切替
  if (bookList.length > authorBookOffset) {
    moreBtn.classList.remove("hidden");
  } else {
    moreBtn.classList.add("hidden");
  }

  section.classList.remove("hidden");
}

/**
 * 作者の作品リスト項目を描画する（start 以上 end 未満）
 * start === 0 のとき一覧をリセットしてから描画する
 */
function renderAuthorBookItems(listEl, bookList, start, end) {
  if (start === 0) {
    listEl.innerHTML = "";
  }

  for (let i = start; i < end; i++) {
    const book = bookList[i];
    const li   = document.createElement("li");

    const numSpan = document.createElement("span");
    numSpan.className   = "book-num";
    numSpan.textContent = (i + 1) + ".";
    li.appendChild(numSpan);

    if (book.url) {
      const a = document.createElement("a");
      a.className   = "book-link";
      a.textContent = book.title;
      a.href        = book.url;
      a.target      = "_blank";
      a.rel         = "noopener noreferrer";
      li.appendChild(a);

      const tag = document.createElement("a");
      tag.className   = "aozora-tag";
      tag.textContent = "青空文庫で読む";
      tag.href        = book.url;
      tag.target      = "_blank";
      tag.rel         = "noopener noreferrer";
      li.appendChild(tag);
    } else {
      const span = document.createElement("span");
      span.className   = "book-no-link";
      span.textContent = book.title;
      li.appendChild(span);
    }

    listEl.appendChild(li);
  }
}

/** 「もっと見る」で次の AUTHOR_PAGE_SIZE 件を追加表示する */
function showMoreAuthorBooks() {
  if (!currentAuthor) return;

  const bookList = authorMap[currentAuthor] || [];
  const listEl   = document.getElementById("author-book-list");
  const moreBtn  = document.getElementById("btn-more-books");

  const newEnd = Math.min(authorBookOffset + AUTHOR_PAGE_SIZE, bookList.length);
  renderAuthorBookItems(listEl, bookList, authorBookOffset, newEnd);
  authorBookOffset = newEnd;

  if (authorBookOffset >= bookList.length) {
    moreBtn.classList.add("hidden");
  }
}

// ---------------------------------------------------
// 一文ガチャ
// ---------------------------------------------------

/** 一文ガチャ: quote を持つ作品からランダムに1件選んで表示する */
function showRandomQuote() {
  if (QUOTE_BOOKS.length === 0) {
    showError("一文データがありません。");
    return;
  }

  currentMode    = "quote";
  answerRevealed = false;

  // 連続で同じ一文が出ないよう lastBookKey で除外する
  const candidates = QUOTE_BOOKS.filter(b => makeKey(b) !== lastBookKey);
  const pool       = candidates.length > 0 ? candidates : QUOTE_BOOKS;
  currentBook      = pool[Math.floor(Math.random() * pool.length)];
  lastBookKey      = makeKey(currentBook);

  // 作者ガチャセクションを隠す
  document.getElementById("author-section").classList.add("hidden");
  // 作品ガチャの表示を隠す
  document.getElementById("book-info").classList.add("hidden");

  renderQuoteMode();
  enableActionButtons(true);
  hideError();
}

/** 一文ガチャの表示を描画する */
function renderQuoteMode() {
  const hintEl      = document.getElementById("hint-msg");
  const quoteDisplay = document.getElementById("quote-display");
  const quoteTextEl  = document.getElementById("quote-text");
  const quoteAnswer  = document.getElementById("quote-answer");
  const titleEl      = document.getElementById("quote-book-title");
  const authorEl     = document.getElementById("quote-book-author");
  const revealBtn    = document.getElementById("btn-reveal-answer");

  // ヒントを隠して一文表示エリアを表示
  hintEl.classList.add("hidden");
  quoteTextEl.textContent = currentBook.quote;

  // 作品名・著者名をセットしておき、最初は隠す
  titleEl.textContent  = currentBook.title;
  authorEl.textContent = "著者：" + currentBook.author;
  quoteAnswer.classList.add("hidden");

  // 「答えを見る」ボタンを表示
  revealBtn.classList.remove("hidden");

  quoteDisplay.classList.remove("hidden");

  // 青空文庫ボタンは URL がある場合のみ有効
  document.getElementById("btn-aozora").disabled = !currentBook.url;
}

/** 「答えを見る」ボタンが押されたときの処理 */
function revealAnswer() {
  if (currentMode !== "quote") return;

  answerRevealed = true;
  document.getElementById("quote-answer").classList.remove("hidden");
  document.getElementById("btn-reveal-answer").classList.add("hidden");
}

/** 一文ガチャの表示エリアをすべて隠すユーティリティ */
function hideQuoteDisplay() {
  document.getElementById("quote-display").classList.add("hidden");
  document.getElementById("quote-answer").classList.add("hidden");
  document.getElementById("btn-reveal-answer").classList.add("hidden");
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

  // 対象カテゴリに追加して保存（quote フィールドは保存不要なので除外）
  const bookToSave = { title: book.title, author: book.author, url: book.url };
  targetList.push(bookToSave);
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

/** 作品情報をカードに表示する（作品ガチャモード用）*/
function renderBook(book) {
  const hintEl   = document.getElementById("hint-msg");
  const bookInfo = document.getElementById("book-info");
  const titleEl  = document.getElementById("book-title");
  const authorEl = document.getElementById("book-author");

  // 一文ガチャ表示を隠す
  hideQuoteDisplay();

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
  document.getElementById("btn-author").addEventListener("click", showRandomAuthor);
  document.getElementById("btn-quote").addEventListener("click",  showRandomQuote);
  document.getElementById("btn-read").addEventListener("click",   markAsRead);
  document.getElementById("btn-unread").addEventListener("click", markAsUnread);
  document.getElementById("btn-aozora").addEventListener("click", openAozora);
  document.getElementById("btn-more-books").addEventListener("click", showMoreAuthorBooks);
  document.getElementById("btn-reveal-answer").addEventListener("click", revealAnswer);
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
