const COMMENTS_SHEET_NAME = 'comments';
const CONTACTS_SHEET_NAME = 'contacts';
const ADMIN_EMAIL = 'toaruseigyoya@gmail.com';
const COMMENT_LIMIT_10_MINUTES = 5;
const COMMENT_LIMIT_24_HOURS = 20;

function doPost(e) {
  const data = e.parameter || {};
  const action = String(data.action || 'comment').toLowerCase();

  if (action === 'contact') {
    return handleContact_(data);
  }
  if (action === 'deletecomment') {
    return handleDeleteComment_(data);
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
        .filter(row => !row.hidden && !row.deleted)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    }, callback);
  }

  const pagePath = normalizePath_(data.pagePath);
  return output_({
    ok: true,
    comments: comments
      .filter(row => !row.hidden && !row.deleted && row.pagePath === pagePath)
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

  const fingerprintHash = digest_(clean_(data.fingerprint || data.userAgent, 1200));
  const blockReason = spamBlockReason_(fingerprintHash, comment, now);
  const id = clean_(data.id, 80) || Utilities.getUuid();
  const parentId = clean_(data.parentId, 80);
  const deleteToken = clean_(data.deleteToken, 120) || Utilities.getUuid();
  sheet.appendRow([
    id,
    now.toISOString(),
    pagePath,
    pageTitle,
    pageUrl,
    name,
    comment,
    Boolean(blockReason),
    fingerprintHash,
    blockReason ? 'auto_blocked: ' + blockReason : '',
    parentId,
    deleteToken,
    false,
    fingerprintHash,
    blockReason
  ]);

  if (blockReason) {
    notifyBlockedComment_(pageTitle, pageUrl, pagePath, name, comment, blockReason);
    return output_({ ok: false, error: 'rate_limited', reason: blockReason }, data.callback);
  }

  notifyComment_(pageTitle, pageUrl, pagePath, name, comment);
  return output_({ ok: true, id: id }, data.callback);
}

function handleDeleteComment_(data) {
  const sheet = getCommentsSheet_();
  const id = clean_(data.id, 80);
  const deleteToken = clean_(data.deleteToken, 120);
  if (!id || !deleteToken) {
    return output_({ ok: false, error: 'invalid_delete_request' }, data.callback);
  }

  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[0] || '') === id && String(row[11] || '') === deleteToken) {
      sheet.getRange(i + 1, 8).setValue(true);
      sheet.getRange(i + 1, 13).setValue(true);
      return output_({ ok: true }, data.callback);
    }
  }

  return output_({ ok: false, error: 'not_found' }, data.callback);
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
    'memo',
    'parentId',
    'deleteToken',
    'deleted',
    'fingerprintHash',
    'blockedReason'
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
  } else {
    const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    headers.forEach((header, index) => {
      if (!current[index]) {
        sheet.getRange(1, index + 1).setValue(header);
      }
    });
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
    hidden: row[7] === true || String(row[7]).toUpperCase() === 'TRUE',
    parentId: String(row[10] || ''),
    deleted: row[12] === true || String(row[12]).toUpperCase() === 'TRUE',
    fingerprintHash: String(row[13] || row[8] || ''),
    blockedReason: String(row[14] || '')
  })).filter(row => row.id && row.id !== 'id' && row.comment && row.pagePath !== '/pagePath');
}

function spamBlockReason_(fingerprintHash, comment, now) {
  if (!fingerprintHash) return '';

  const comments = readComments_();
  const recent = comments.filter(row => row.fingerprintHash === fingerprintHash);
  const nowMs = now.getTime();
  const tenMinutes = 10 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  const count10Min = recent.filter(row => nowMs - new Date(row.createdAt).getTime() <= tenMinutes).length;
  if (count10Min >= COMMENT_LIMIT_10_MINUTES) {
    return 'too_many_comments_10min';
  }

  const count24Hours = recent.filter(row => nowMs - new Date(row.createdAt).getTime() <= oneDay).length;
  if (count24Hours >= COMMENT_LIMIT_24_HOURS) {
    return 'too_many_comments_24h';
  }

  const normalized = normalizeCommentText_(comment);
  const duplicate = recent.some(row =>
    nowMs - new Date(row.createdAt).getTime() <= oneDay &&
    normalizeCommentText_(row.comment) === normalized
  );
  if (duplicate) {
    return 'duplicate_comment_24h';
  }

  return '';
}

function normalizeCommentText_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
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

function notifyBlockedComment_(pageTitle, pageUrl, pagePath, name, comment, reason) {
  if (!ADMIN_EMAIL) return;
  const subject = 'コメントを自動規制しました: ' + pageTitle;
  const body = [
    'コメントを自動規制し、非表示で保存しました。',
    '',
    '理由: ' + reason,
    'ページ: ' + pageTitle,
    'URL: ' + (pageUrl || pagePath),
    '名前: ' + name,
    '',
    'コメント:',
    comment,
    '',
    '表示する場合は、スプレッドシートの comments シートで hidden を FALSE にしてください。'
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
