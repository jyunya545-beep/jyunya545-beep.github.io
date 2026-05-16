const TO_EMAIL = 'toaruseigyoya@gmail.com';

function doPost(e) {
  const data = e.parameter || {};
  const kind = data.kind || 'not selected';
  const name = data.name || 'not entered';
  const replyTo = data.replyTo || '';
  const pageUrl = data.pageUrl || '';
  const targetUrl = data.url || 'not entered';
  const message = data.message || '';
  const sentAt = data.sentAt || new Date().toISOString();

  const subject = 'Aineko contact: ' + kind;
  const body = [
    'Kind: ' + kind,
    'Name: ' + name,
    'Reply-To: ' + (replyTo || 'not entered'),
    'Target URL: ' + targetUrl,
    'Source page: ' + pageUrl,
    'Sent at: ' + sentAt,
    '',
    'Message:',
    message
  ].join('\n');

  const options = { name: 'Aineko contact form' };
  if (replyTo) {
    options.replyTo = replyTo;
  }

  MailApp.sendEmail(TO_EMAIL, subject, body, options);

  return ContentService
    .createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
