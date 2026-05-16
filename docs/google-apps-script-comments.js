const COMMENTS_SHEET_NAME = 'comments';
const CONTACTS_SHEET_NAME = 'contacts';
const ADMIN_EMAIL = 'toaruseigyoya@gmail.com';

function doPost(e) {
  const data = e.parameter || {};
  const action = String(data.action || 'comment').toLowerCase();

  if (action === 'contact') {
    return handleContact_(data);
  }

  return handleComment_(data);
}

function doGet(e) {
  const data = e.parameter || {};
  const mode = data.mode || 'page';
  const callback = data.callback;
  const comments = readComments_();

  if (mode === 'recent') {
    const limit = Math.min(Math.max(Number(data.limit || 8), 1), 20);
    return output_({
      ok: true,
      comments: comments
        .filter(row => !row.hidden)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    }, callback);
  }

  const pagePath = normalizePath_(data.pagePath);
  return output_({
    ok: true,
    comments: comments
      .filter(row => !row.hidden && row.pagePath === pagePath)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }, callback);
}

function handleComment_(data) {
  const sheet = getCommentsSheet_();
  const now = new Date();
  const pagePath = normalizePath_(data.pagePath);
  const pageTitle = clean_(data.pageTitle, 160) || pagePath;
  const pageUrl = clean_(data.pageUrl, 500);
  const name = clean_(data.name, 40) || '名前なし';
  const comment = clean_(data.comment, 1200);

  if (!comment) {
    return output_({ ok: false, error: 'comment_required' }, data.callback);
  }

  const id = Utilities.getUuid();
  sheet.appendRow([
    id,
    now.toISOString(),
    pagePath,
    pageTitle,
    pageUrl,
    name,
    comment,
    false,
    digest_(String(data.userAgent || '')),
    ''
  ]);

  notifyComment_(pageTitle, pageUrl, pagePath, name, comment);
  return output_({ ok: true, id: id }, data.callback);
}

function handleContact_(data) {
  const sheet = getContactsSheet_();
  const now = new Date();
  const id = Utilities.getUuid();
  const kind = clean_(data.kind, 80);
  const name = clean_(data.name, 80) || '未入力';
  const replyTo = clean_(data.replyTo, 160);
  const targetUrl = clean_(data.url, 500);
  const message = clean_(data.message, 3000);
  const pageUrl = clean_(data.pageUrl, 500);

  if (!message) {
    return output_({ ok: false, error: 'message_required' }, data.callback);
  }

  sheet.appendRow([
    id,
    now.toISOString(),
    kind,
    name,
    replyTo,
    targetUrl,
    message,
    pageUrl,
    false,
    ''
  ]);

  notifyContact_(kind, name, replyTo, targetUrl, message, pageUrl);
  return output_({ ok: true, id: id }, data.callback);
}

function getCommentsSheet_() {
  return getSheet_(COMMENTS_SHEET_NAME, [
    'id',
    'createdAt',
    'pagePath',
    'pageTitle',
    'pageUrl',
    'name',
    'comment',
    'hidden',
    'userAgentHash',
    'memo'
  ]);
}

function getContactsSheet_() {
  return getSheet_(CONTACTS_SHEET_NAME, [
    'id',
    'createdAt',
    'kind',
    'name',
    'replyTo',
    'targetUrl',
    'message',
    'pageUrl',
    'handled',
    'memo'
  ]);
}

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function readComments_() {
  const sheet = getCommentsSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values.slice(1).map(row => ({
    id: String(row[0] || ''),
    createdAt: String(row[1] || ''),
    pagePath: normalizePath_(row[2]),
    pageTitle: String(row[3] || ''),
    pageUrl: String(row[4] || ''),
    name: String(row[5] || '名前なし'),
    comment: String(row[6] || ''),
    hidden: row[7] === true || String(row[7]).toUpperCase() === 'TRUE'
  })).filter(row => row.id && row.comment);
}

function notifyComment_(pageTitle, pageUrl, pagePath, name, comment) {
  if (!ADMIN_EMAIL) return;
  const subject = 'サイトにコメントがありました: ' + pageTitle;
  const body = [
    'サイトにコメントが投稿されました。',
    '',
    'ページ: ' + pageTitle,
    'URL: ' + (pageUrl || pagePath),
    '名前: ' + name,
    '',
    'コメント:',
    comment,
    '',
    '非表示にする場合は、スプレッドシートの comments シートで hidden 列を TRUE にしてください。'
  ].join('\n');
  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function notifyContact_(kind, name, replyTo, targetUrl, message, pageUrl) {
  if (!ADMIN_EMAIL) return;
  const subject = 'サイトからお問い合わせがありました: ' + (kind || '種別未入力');
  const body = [
    'サイトからお問い合わせが送信されました。',
    '',
    '種別: ' + (kind || '未入力'),
    '名前: ' + name,
    '返信先: ' + (replyTo || '未入力'),
    '対象URL: ' + (targetUrl || '未入力'),
    '送信ページ: ' + (pageUrl || '未入力'),
    '',
    '内容:',
    message
  ].join('\n');

  const options = replyTo ? { replyTo: replyTo } : {};
  MailApp.sendEmail(ADMIN_EMAIL, subject, body, options);
}

function output_(obj, callback) {
  const json = JSON.stringify(obj);
  const safeCallback = String(callback || '').match(/^[A-Za-z_$][0-9A-Za-z_$]*$/) ? callback : '';
  const text = safeCallback ? safeCallback + '(' + json + ');' : json;
  return ContentService
    .createTextOutput(text)
    .setMimeType(safeCallback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function clean_(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function normalizePath_(value) {
  let path = String(value || '/').trim();
  if (!path.startsWith('/')) path = '/' + path;
  path = path.replace(/\/index\.html$/, '/');
  return path || '/';
}

function digest_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
