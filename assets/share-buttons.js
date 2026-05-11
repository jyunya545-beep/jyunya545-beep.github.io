(function () {
  'use strict';

  var defaultTags = '今日もあいネコ,AI活用,子育て';
  var networks = [
    ['X', 'share-x', function (url, title) { return 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title; }],
    ['Facebook', 'share-fb', function (url) { return 'https://www.facebook.com/sharer/sharer.php?u=' + url; }],
    ['LINE', 'share-line', function (url) { return 'https://social-plugins.line.me/lineit/share?url=' + url; }],
    ['note', 'share-note', function (url) { return 'https://note.com/intent/post?url=' + url + '&hashtags=' + encodeURIComponent(defaultTags); }],
    ['はてブ', 'share-hb', function (url) { return 'https://b.hatena.ne.jp/add?mode=confirm&url=' + url; }],
    ['Pocket', 'share-pocket', function (url, title) { return 'https://getpocket.com/save?url=' + url + '&title=' + title; }],
    ['LinkedIn', 'share-li', function (url) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; }]
  ];

  function pageUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : location.href.split('#')[0];
  }

  function pageTitle() {
    var ogTitle = document.querySelector('meta[property="og:title"]');
    return (ogTitle && ogTitle.content) || document.title || '今日もあいネコ';
  }

  function openShare(event) {
    var href = event.currentTarget.href;
    if (!href) return;
    var width = 720;
    var height = 620;
    var left = Math.max(0, Math.round((screen.width - width) / 2));
    var top = Math.max(0, Math.round((screen.height - height) / 2));
    event.preventDefault();
    window.open(href, 'aineko-share', 'noopener,noreferrer,width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
  }

  function buildButtons(position) {
    var url = encodeURIComponent(pageUrl());
    var title = encodeURIComponent(pageTitle());
    var wrap = document.createElement('nav');
    wrap.className = 'share-buttons share-buttons-' + position;
    wrap.setAttribute('aria-label', 'SNSでシェア');

    var label = document.createElement('span');
    label.className = 'share-label';
    label.textContent = 'シェア';
    wrap.appendChild(label);

    networks.forEach(function (network) {
      var a = document.createElement('a');
      a.className = 'share-btn ' + network[1];
      a.href = network[2](url, title);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = network[0];
      a.addEventListener('click', openShare);
      wrap.appendChild(a);
    });

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'share-btn share-copy';
    copy.textContent = 'リンクコピー';
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(pageUrl()).then(function () {
        copy.textContent = 'コピー済み';
        setTimeout(function () { copy.textContent = 'リンクコピー'; }, 1800);
      }, function () {
        window.prompt('このURLをコピーしてください', pageUrl());
      });
    });
    wrap.appendChild(copy);
    return wrap;
  }

  function injectStyle() {
    if (document.getElementById('share-buttons-style')) return;
    var style = document.createElement('style');
    style.id = 'share-buttons-style';
    style.textContent = [
      '.share-buttons{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0 18px}',
      '.share-buttons-bottom{margin-top:28px;padding-top:18px;border-top:1px solid rgba(100,116,139,.22)}',
      '.share-label{color:#64748b;font:800 12px/1.2 "Yu Gothic UI","Meiryo",system-ui,sans-serif;letter-spacing:.04em}',
      '.share-btn{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:7px 11px;border:0;border-radius:999px;color:#fff!important;text-decoration:none!important;font:800 12px/1.2 "Yu Gothic UI","Meiryo",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.12);transition:filter .15s,transform .15s}',
      '.share-x{background:#111827}.share-fb{background:#1877f2}.share-line{background:#06c755}.share-note{background:#41c9b4}.share-hb{background:#00a4de}.share-pocket{background:#ef4056}.share-li{background:#0a66c2}.share-copy{background:#64748b}',
      '.share-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}',
      '.share-btn:focus-visible{outline:3px solid rgba(54,196,159,.35);outline-offset:2px}',
      '@media(max-width:560px){.share-buttons{gap:6px}.share-label{width:100%}.share-btn{font-size:11px;padding:7px 9px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function init() {
    if (document.querySelector('.share-buttons')) return;
    injectStyle();
    var main = document.querySelector('main') || document.body;
    var topTarget =
      main.querySelector('h1') ||
      document.querySelector('h1') ||
      document.querySelector('.hdr-title') ||
      document.querySelector('header .title') ||
      document.querySelector('header');
    if (topTarget && topTarget.parentNode) {
      topTarget.insertAdjacentElement('afterend', buildButtons('top'));
    }
    main.appendChild(buildButtons('bottom'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
