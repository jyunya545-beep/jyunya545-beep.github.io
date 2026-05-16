(function () {
  'use strict';

  var text = {
    tags: '\u4eca\u65e5\u3082\u3042\u3044\u30cd\u30b3,AI\u6d3b\u7528,\u5b50\u80b2\u3066',
    site: '\u4eca\u65e5\u3082\u3042\u3044\u30cd\u30b3',
    share: '\u30b7\u30a7\u30a2',
    shareWith: '\u3067\u30b7\u30a7\u30a2',
    copyLink: '\u30ea\u30f3\u30af\u3092\u30b3\u30d4\u30fc',
    copied: '\u30b3\u30d4\u30fc\u6e08\u307f',
    copyPrompt: '\u3053\u306eURL\u3092\u30b3\u30d4\u30fc\u3057\u3066\u304f\u3060\u3055\u3044'
  };

  var prText = '\u3053\u306e\u30b5\u30a4\u30c8\u306b\u306f\u5e83\u544a\u30fb\u30a2\u30d5\u30a3\u30ea\u30a8\u30a4\u30c8\u30ea\u30f3\u30af\u3092\u542b\u3080\u5834\u5408\u304c\u3042\u308a\u307e\u3059\u3002';
  var commentsKeyPrefix = 'aineko_comments:';
  var commentsEndpoint = window.AINEKO_SITE_ENDPOINT || window.AINEKO_COMMENTS_ENDPOINT || '';

  var analytics = {
    cloudflareToken: '36c9e0653d3a4c43b0193186cc1c1234',
    hostnames: ['toaruseigyoya.github.io']
  };

  var icons = {
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.2 2.9h3.2l-7 8 8.2 10.2h-6.4l-5-6.3-5.7 6.3H2.3l7.5-8.4L2 2.9h6.6l4.5 5.7 5.1-5.7Zm-1.1 16.4h1.8L7.6 4.6H5.7l11.4 14.7Z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8.1V6.3c0-.9.3-1.4 1.5-1.4H18V1.7c-.5-.1-2-.2-3.1-.2-3 0-5 1.8-5 5.1v1.5H6.6v3.6h3.3v10.8H14V11.7h3.4l.5-3.6H14Z"/></svg>',
    line: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 10.6c0-4.1-4.1-7.4-9.2-7.4S2 6.5 2 10.6c0 3.7 3.3 6.8 7.8 7.3.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.1.8.8.4.9-.4 4.9-2.9 6.7-5 1.6-1.7 2.5-3.2 2.5-4.9ZM8.1 12.8H6.3V8.7h1.1v3.1h.7v1Zm2.2 0H9.2V8.7h1.1v4.1Zm4.4 0h-1.1l-1.6-2.2v2.2h-1.1V8.7H12l1.6 2.3V8.7h1.1v4.1Zm3.2-3.1h-1.8v.6h1.6v1h-1.6v.6h1.8v1h-2.9V8.7h2.9v1Z"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h8.7c3.3 0 5.3 2.1 5.3 5.3V20h-4.1V9.7c0-1.1-.6-1.8-1.8-1.8H9.1V20H5V4Z"/></svg>',
    hatena: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h7.1c2.7 0 4.4 1.3 4.4 3.5 0 1.4-.7 2.4-2 3 1.7.5 2.6 1.8 2.6 3.7 0 2.6-1.9 4.2-5 4.2H5V4Zm4.1 5.7h2.1c.9 0 1.4-.4 1.4-1.2s-.5-1.2-1.4-1.2H9.1v2.4Zm0 5.4h2.4c1 0 1.6-.5 1.6-1.4 0-.9-.6-1.4-1.6-1.4H9.1v2.8ZM18.3 4h3.2v9.3h-3.2V4Zm0 11.2h3.2v3.2h-3.2v-3.2Z"/></svg>',
    pocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v6.8c0 4.4-3.6 8.2-8 8.2s-8-3.8-8-8.2V4.5Zm4.3 5.2 3.7 3.6 3.7-3.6-1.5-1.6-2.2 2.2-2.2-2.2-1.5 1.6Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 8.7h3.7V20H5.1V8.7ZM7 3.2c1.2 0 2.1.9 2.1 2.1S8.2 7.4 7 7.4s-2.1-.9-2.1-2.1.9-2.1 2.1-2.1Zm4 5.5h3.5v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.7 0 4.4 2.4 4.4 5.6v6h-3.7v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H11V8.7Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7V4h12v12h-3v4H4V7h4Zm2 0h7v7h1V6h-8v1Zm-4 3v8h8v-8H6Z"/></svg>'
  };

  var networks = [
    { label: 'X', className: 'share-x', icon: icons.x, url: function (url, title) { return 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title; } },
    { label: 'Facebook', className: 'share-fb', icon: icons.facebook, url: function (url) { return 'https://www.facebook.com/sharer/sharer.php?u=' + url; } },
    { label: 'LINE', className: 'share-line', icon: icons.line, url: function (url) { return 'https://social-plugins.line.me/lineit/share?url=' + url; } },
    { label: 'note', className: 'share-note', icon: icons.note, url: function (url) { return 'https://note.com/intent/post?url=' + url + '&hashtags=' + encodeURIComponent(text.tags); } },
    { label: 'Hatena Bookmark', className: 'share-hb', icon: icons.hatena, url: function (url) { return 'https://b.hatena.ne.jp/add?mode=confirm&url=' + url; } },
    { label: 'Pocket', className: 'share-pocket', icon: icons.pocket, url: function (url, title) { return 'https://getpocket.com/save?url=' + url + '&title=' + title; } },
    { label: 'LinkedIn', className: 'share-li', icon: icons.linkedin, url: function (url) { return 'https://www.linkedin.com/sharing/share-offsite/?url=' + url; } }
  ];

  function pageUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : location.href.split('#')[0];
  }

  function pageTitle() {
    var ogTitle = document.querySelector('meta[property="og:title"]');
    return (ogTitle && ogTitle.content) || document.title || text.site;
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

  function srOnly(label) {
    return '<span class="share-sr">' + label + '</span>';
  }

  function buildButtons(position) {
    var url = encodeURIComponent(pageUrl());
    var title = encodeURIComponent(pageTitle());
    var wrap = document.createElement('nav');
    wrap.className = 'share-buttons share-buttons-' + position;
    wrap.setAttribute('aria-label', 'SNS' + text.shareWith);

    networks.forEach(function (network) {
      var a = document.createElement('a');
      a.className = 'share-btn ' + network.className;
      a.href = network.url(url, title);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = network.label + text.shareWith;
      a.setAttribute('aria-label', network.label + text.shareWith);
      a.innerHTML = network.icon + srOnly(network.label);
      a.addEventListener('click', openShare);
      wrap.appendChild(a);
    });

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'share-btn share-copy';
    copy.title = text.copyLink;
    copy.setAttribute('aria-label', text.copyLink);
    copy.innerHTML = icons.copy + srOnly(text.copyLink);
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(pageUrl()).then(function () {
        copy.setAttribute('aria-label', text.copied);
        copy.title = text.copied;
        setTimeout(function () {
          copy.setAttribute('aria-label', text.copyLink);
          copy.title = text.copyLink;
        }, 1800);
      }, function () {
        window.prompt(text.copyPrompt, pageUrl());
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
      '.share-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}',
      '.share-title-row h1{margin-bottom:0!important;min-width:0}',
      '.share-title-row .share-buttons-top{flex:0 0 auto;justify-content:flex-end;margin:2px 0 0}',
      '.share-buttons-bottom{margin-top:28px;padding-top:18px;border-top:1px solid rgba(100,116,139,.22);justify-content:flex-end}',
      '.share-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:0;border-radius:999px;color:#fff!important;text-decoration:none!important;cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.12);transition:filter .15s,transform .15s}',
      '.share-btn svg{width:18px;height:18px;fill:currentColor;display:block}',
      '.share-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
      '.share-x{background:#111827}.share-fb{background:#1877f2}.share-line{background:#06c755}.share-note{background:#41c9b4}.share-hb{background:#00a4de}.share-pocket{background:#ef4056}.share-li{background:#0a66c2}.share-copy{background:#64748b}',
      '.share-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}',
      '.share-btn:focus-visible{outline:3px solid rgba(54,196,159,.35);outline-offset:2px}',
      '.global-pr-notice,.pr-notice{max-width:1040px;margin:18px auto 0;padding:0 18px;color:#8a7890!important;font-size:.9rem!important;font-weight:600!important;line-height:1.8!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;display:block!important}',
      '.global-pr-notice span,.pr-notice span{color:inherit!important;font:inherit!important;background:transparent!important;border:0!important;min-width:0!important;min-height:0!important;padding:0!important;border-radius:0!important}',
      '.global-pr-label,.pr-label{font-weight:800!important;margin-right:.45em!important}',
      '.site-comments{max-width:920px;margin:34px auto 18px;padding:0 18px;color:#273044;font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",sans-serif}',
      '.site-comments-inner{background:rgba(255,255,255,.92);border:1px solid #f0dccb;border-radius:14px;box-shadow:0 12px 30px rgba(85,70,50,.08);padding:18px}',
      '.site-comments h2{font-size:1.18rem;line-height:1.4;margin:0 0 12px;color:#273044;border:0;padding:0}',
      '.comment-list{display:grid;gap:10px;margin:0 0 18px}',
      '.comment-item{border-top:1px solid #eef2f7;padding-top:12px}',
      '.comment-item:first-child{border-top:0;padding-top:0}',
      '.comment-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:baseline;margin-bottom:5px}',
      '.comment-author{font-weight:900;color:#273044}',
      '.comment-date{font-size:.78rem;color:#8a7890;font-weight:800}',
      '.comment-body{white-space:pre-wrap;color:#4f5b73;line-height:1.75;font-size:.95rem}',
      '.comment-replies{display:grid;gap:10px;margin:10px 0 0 18px;padding-left:12px;border-left:3px solid #eef2f7}',
      '.comment-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}',
      '.comment-action{border:0;background:transparent;color:#0f7f68;font:inherit;font-size:.82rem;font-weight:900;padding:0;cursor:pointer}',
      '.comment-action:hover{text-decoration:underline}',
      '.comment-empty{color:#8a7890;font-size:.92rem;line-height:1.7;margin:0 0 18px}',
      '.comment-form{display:grid;gap:10px;border-top:1px solid #eef2f7;padding-top:14px}',
      '.comment-form-title{font-weight:900;color:#273044;font-size:1rem}',
      '.comment-form label{display:grid;gap:5px;color:#4f5b73;font-size:.82rem;font-weight:900}',
      '.comment-form input,.comment-form textarea{width:100%;border:1.5px solid #dbe8f6;border-radius:10px;background:#fff;color:#273044;font:inherit;padding:10px 11px}',
      '.comment-form textarea{min-height:132px;resize:vertical}',
      '.comment-form button{justify-self:start;border:0;border-radius:10px;background:#0f7f68;color:#fff;font:inherit;font-weight:900;padding:10px 14px;cursor:pointer}',
      '.comment-form button:disabled{background:#aeb9c5;cursor:not-allowed}',
      '.comment-note{color:#8a7890;font-size:.82rem;line-height:1.7;margin:0}',
      '.comment-status{font-weight:900;font-size:.88rem;line-height:1.6;margin:0;color:#0f7f68}',
      '.recent-comments{background:#fff;border:1px solid #f0dccb;border-radius:14px;padding:14px;display:grid;gap:8px}',
      '.recent-comments h2{font-size:.96rem;line-height:1.4;margin:0;color:#273044}',
      '.recent-comment-list{display:grid;gap:8px;max-height:150px;overflow-y:auto;padding-right:6px}',
      '.recent-comment-list::-webkit-scrollbar{width:8px}.recent-comment-list::-webkit-scrollbar-thumb{background:#d9c7ba;border-radius:999px}.recent-comment-list::-webkit-scrollbar-track{background:#f8eee5;border-radius:999px}',
      '.recent-comment-link{display:grid;gap:2px;color:#65708a!important;text-decoration:none!important;font-size:.84rem;line-height:1.5;border-top:1px solid #f0dccb;padding-top:8px}',
      '.recent-comment-link:first-child{border-top:0;padding-top:0}',
      '.recent-comment-link strong{color:#273044;font-size:.88rem}',
      '.recent-comment-link:hover strong{text-decoration:underline}',
      '@media(max-width:760px){.share-title-row{display:block}.share-title-row .share-buttons-top{justify-content:flex-start;margin:10px 0 14px}}',
      '@media(max-width:560px){.share-buttons{gap:7px}.share-btn{width:34px;height:34px}.share-btn svg{width:17px;height:17px}.site-comments{padding-inline:14px}.site-comments-inner{padding:16px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function gameDescription() {
    if (window.GAME && window.GAME.desc) return window.GAME.desc;

    var metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.content && metaDescription.content.indexOf('今日もあいネコのページです') === -1) {
      return metaDescription.content;
    }

    var ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && ogDescription.content && ogDescription.content.indexOf('今日もあいネコのページです') === -1) {
      return ogDescription.content;
    }

    var sub = document.querySelector('.hdr-sub');
    if (sub && sub.textContent.trim()) return sub.textContent.trim();

    var firstParagraph = document.querySelector('main p, .app p, .game p');
    if (firstParagraph && firstParagraph.textContent.trim()) return firstParagraph.textContent.trim();

    return 'Web上で動作するブラウザゲームです。';
  }

  function gameTitle() {
    if (window.GAME && window.GAME.title) return window.GAME.title;

    var h1 = document.querySelector('h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();

    var hdr = document.querySelector('.hdr-title');
    if (hdr && hdr.textContent.trim()) return hdr.textContent.trim();

    return pageTitle().replace(/\s*\|\s*無料ゲーム\s*$/, '');
  }

  function injectGameHeaderStyle() {
    if (document.getElementById('game-standard-header-style')) return;
    var style = document.createElement('style');
    style.id = 'game-standard-header-style';
    style.textContent = [
      'body.game-detail-standardized{display:block!important;place-items:initial!important;padding:0!important}',
      '.game-standard-header{max-width:980px;margin:0 auto;padding:18px 20px 10px;color:#273044;font-family:"Segoe UI","Yu Gothic UI","Hiragino Sans",sans-serif}',
      '.game-standard-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}',
      '.game-breadcrumbs{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:40px;color:#64748b;font-size:.9rem;font-weight:900}',
      '.game-breadcrumbs a{color:#0f7f68!important;text-decoration:none!important;font-weight:900!important}',
      '.game-breadcrumbs a:hover{text-decoration:underline!important}',
      '.game-standard-header .share-buttons{margin:0;justify-content:flex-end}',
      '.game-standard-title{font-size:clamp(1.8rem,5vw,2.8rem);line-height:1.2;letter-spacing:0;margin:10px 0 6px;color:#273044;font-weight:900}',
      '.game-standard-desc{max-width:720px;color:#65708a;font-size:1rem;line-height:1.75;font-weight:750;margin:0}',
      '.game-hidden-heading{display:none!important}',
      'body.game-detail-standardized>header{display:none!important}',
      'body.game-detail-standardized .game,body.game-detail-standardized .app{margin-left:auto!important;margin-right:auto!important;margin-bottom:34px!important}',
      'body.game-detail-standardized main{margin-left:auto!important;margin-right:auto!important}',
      'body.game-detail-standardized main>a[href="../"],body.game-detail-standardized .game>.head,body.game-detail-standardized .app>.head,body.game-detail-standardized main>.head{display:none!important}',
      '@media(max-width:700px){.game-standard-header{padding-inline:14px}.game-standard-top{display:block}.game-standard-header .share-buttons{justify-content:flex-start;margin-top:8px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function isGameDetailPage() {
    return /^\/games\/[^/]+\/?$/.test(location.pathname);
  }

  function initGameDetailHeader() {
    injectStyle();
    injectPrNotice();
    injectGameHeaderStyle();
    document.body.classList.add('game-detail-standardized');

    var title = gameTitle();
    var description = gameDescription();
    var originalH1 = document.querySelector('h1');
    if (originalH1) originalH1.classList.add('game-hidden-heading');

    var header = document.createElement('section');
    header.className = 'game-standard-header';
    header.innerHTML =
      '<div class="game-standard-top">' +
        '<nav class="game-breadcrumbs" aria-label="パンくずリスト">' +
          '<a href="/">ホーム</a><span>›</span><a href="/games/">無料ゲーム一覧</a>' +
        '</nav>' +
      '</div>' +
      '<h1 class="game-standard-title"></h1>' +
      '<p class="game-standard-desc"></p>';

    header.querySelector('.game-standard-top').appendChild(buildButtons('top'));
    header.querySelector('.game-standard-title').textContent = title;
    header.querySelector('.game-standard-desc').textContent = description;
    document.body.insertBefore(header, document.body.firstChild);
  }

  function injectPrNotice() {
    if (document.querySelector('.global-pr-notice') || document.querySelector('.pr-notice')) return;
    var notice = document.createElement('div');
    notice.className = 'global-pr-notice';
    notice.setAttribute('role', 'note');
    notice.setAttribute('aria-label', '\u5e83\u544a\u8868\u8a18');
    notice.innerHTML = '<span class="global-pr-label">PR</span><span>' + prText + '</span>';

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(notice, footer);
      return;
    }

    (document.querySelector('main') || document.body).appendChild(notice);
  }

  function placeTopButtonsWithTitle(titleNode) {
    if (!titleNode || !titleNode.parentNode) return false;

    var row = document.createElement('div');
    row.className = 'share-title-row';
    titleNode.parentNode.insertBefore(row, titleNode);
    row.appendChild(titleNode);
    row.appendChild(buildButtons('top'));
    return true;
  }

  function initAnalytics() {
    if (!analytics.cloudflareToken) return;
    if (analytics.hostnames.indexOf(location.hostname) === -1) return;
    if (document.getElementById('cloudflare-web-analytics')) return;

    var script = document.createElement('script');
    script.id = 'cloudflare-web-analytics';
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({
      token: analytics.cloudflareToken,
      spa: false
    }));
    document.head.appendChild(script);
  }

  function commentsStorageKey() {
    return commentsKeyPrefix + location.pathname.replace(/\/$/, '') + location.search;
  }

  function pagePath() {
    return location.pathname.replace(/\/index\.html$/, '/');
  }

  function commentsUrl(params) {
    params._ts = Date.now();
    var query = Object.keys(params).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    return commentsEndpoint + (commentsEndpoint.indexOf('?') === -1 ? '?' : '&') + query;
  }

  function loadCommentsJsonp(params, onDone) {
    if (!commentsEndpoint) {
      onDone(null);
      return;
    }

    var callbackName = 'ainekoCommentsCallback' + Date.now() + Math.floor(Math.random() * 10000);
    var script = document.createElement('script');
    var finished = false;

    window[callbackName] = function (data) {
      finished = true;
      delete window[callbackName];
      script.remove();
      onDone(data);
    };

    script.onerror = function () {
      if (finished) return;
      delete window[callbackName];
      script.remove();
      onDone(null);
    };

    params.callback = callbackName;
    script.charset = 'UTF-8';
    script.src = commentsUrl(params);
    document.head.appendChild(script);
  }

  function postComment(data) {
    if (!commentsEndpoint) return false;

    var iframeName = 'ainekoCommentPostFrame';
    var iframe = document.querySelector('iframe[name="' + iframeName + '"]');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.hidden = true;
      document.body.appendChild(iframe);
    }

    var form = document.createElement('form');
    form.method = 'post';
    form.action = commentsEndpoint;
    form.target = iframeName;
    form.style.display = 'none';

    Object.keys(data).forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    setTimeout(function () {
      form.remove();
    }, 1000);
    return true;
  }

  function randomToken() {
    if (window.crypto && window.crypto.getRandomValues) {
      var bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.prototype.map.call(bytes, function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    }
    return String(Date.now()) + String(Math.random()).slice(2);
  }

  function commentTokenKey(id) {
    return 'aineko_comment_token:' + id;
  }

  function rememberCommentToken(id, token) {
    try {
      localStorage.setItem(commentTokenKey(id), token);
    } catch (error) {}
  }

  function getCommentToken(id) {
    try {
      return localStorage.getItem(commentTokenKey(id));
    } catch (error) {
      return '';
    }
  }

  function loadComments() {
    try {
      var raw = localStorage.getItem(commentsStorageKey());
      var comments = raw ? JSON.parse(raw) : [];
      return Array.isArray(comments) ? comments : [];
    } catch (error) {
      return [];
    }
  }

  function saveComments(comments) {
    try {
      localStorage.setItem(commentsStorageKey(), JSON.stringify(comments));
      return true;
    } catch (error) {
      return false;
    }
  }

  function formatDate(value) {
    try {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function renderComments(list, comments, reload) {
    list.innerHTML = '';
    comments = comments.filter(function (comment) {
      return comment && comment.id && comment.id !== 'id' && comment.comment && comment.pagePath !== '/pagePath';
    });
    if (!comments.length) {
      var empty = document.createElement('p');
      empty.className = 'comment-empty';
      empty.textContent = '\u307e\u3060\u30b3\u30e1\u30f3\u30c8\u306f\u3042\u308a\u307e\u305b\u3093\u3002';
      list.appendChild(empty);
      return;
    }

    var grouped = {};
    comments.forEach(function (comment) {
      var parentId = comment.parentId || '';
      if (!grouped[parentId]) grouped[parentId] = [];
      grouped[parentId].push(comment);
    });

    function renderOne(comment, parent) {
      var item = document.createElement('article');
      item.className = 'comment-item';

      var meta = document.createElement('div');
      meta.className = 'comment-meta';

      var author = document.createElement('span');
      author.className = 'comment-author';
      author.textContent = comment.name || '\u540d\u524d\u306a\u3057';

      var date = document.createElement('time');
      date.className = 'comment-date';
      date.dateTime = comment.createdAt || comment.date;
      date.textContent = formatDate(comment.createdAt || comment.date);

      var body = document.createElement('p');
      body.className = 'comment-body';
      body.textContent = comment.comment || comment.body || '';

      var actions = document.createElement('div');
      actions.className = 'comment-actions';

      var reply = document.createElement('button');
      reply.type = 'button';
      reply.className = 'comment-action';
      reply.textContent = '\u8fd4\u4fe1';
      reply.addEventListener('click', function () {
        var form = document.querySelector('.comment-form');
        if (!form) return;
        form.elements.parentId.value = comment.id || '';
        form.querySelector('.comment-form-title').textContent = '\u8fd4\u4fe1\u3059\u308b';
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.elements.comment.focus();
      });
      actions.appendChild(reply);

      var token = getCommentToken(comment.id || '');
      if (token) {
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'comment-action';
        remove.textContent = '\u524a\u9664';
        remove.addEventListener('click', function () {
          if (!window.confirm('\u3053\u306e\u30b3\u30e1\u30f3\u30c8\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f')) return;
          postComment({
            action: 'deleteComment',
            id: comment.id || '',
            deleteToken: token
          });
          setTimeout(function () {
            if (typeof reload === 'function') reload();
          }, 1200);
        });
        actions.appendChild(remove);
      }

      meta.appendChild(author);
      meta.appendChild(date);
      item.appendChild(meta);
      item.appendChild(body);
      item.appendChild(actions);

      var children = grouped[comment.id || ''] || [];
      if (children.length) {
        var replies = document.createElement('div');
        replies.className = 'comment-replies';
        children.forEach(function (child) {
          renderOne(child, replies);
        });
        item.appendChild(replies);
      }

      parent.appendChild(item);
    }

    (grouped[''] || []).forEach(function (comment) {
      renderOne(comment, list);
    });
  }

  function initComments() {
    if (document.querySelector('.site-comments')) return;
    injectStyle();

    var main = document.querySelector('main') || document.body;
    var comments = document.createElement('section');
    comments.className = 'site-comments';
    comments.id = 'comments';
    comments.setAttribute('aria-label', '\u30b3\u30e1\u30f3\u30c8\u6b04');
    comments.innerHTML =
      '<div class="site-comments-inner">' +
        '<h2>\u30b3\u30e1\u30f3\u30c8</h2>' +
        '<div class="comment-list" aria-live="polite"></div>' +
        '<form class="comment-form">' +
          '<div class="comment-form-title">\u30b3\u30e1\u30f3\u30c8\u3059\u308b</div>' +
          '<label>\u540d\u524d<input name="name" autocomplete="name" maxlength="40" placeholder="\u540d\u524d"></label>' +
          '<label>\u30b3\u30e1\u30f3\u30c8<textarea name="comment" required maxlength="1200" placeholder="\u30b3\u30e1\u30f3\u30c8\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044"></textarea></label>' +
          '<input type="hidden" name="parentId">' +
          '<button type="submit">\u9001\u4fe1\u3059\u308b</button>' +
          '<p class="comment-status" role="status"></p>' +
          '<p class="comment-note"></p>' +
        '</form>' +
      '</div>';

    main.appendChild(comments);

    var list = comments.querySelector('.comment-list');
    var form = comments.querySelector('.comment-form');
    var nameInput = form.elements.name;
    var bodyInput = form.elements.comment;
    var parentInput = form.elements.parentId;
    var button = form.querySelector('button');
    var status = form.querySelector('.comment-status');
    var note = form.querySelector('.comment-note');
    var reloadComments = function () {
      loadCommentsJsonp({ mode: 'page', pagePath: pagePath() }, function (data) {
        renderComments(list, data && data.comments ? data.comments : [], reloadComments);
      });
    };

    if (commentsEndpoint) {
      note.textContent = '\u9001\u4fe1\u3055\u308c\u305f\u30b3\u30e1\u30f3\u30c8\u306f\u3059\u3050\u306b\u8868\u793a\u3055\u308c\u307e\u3059\u3002\u7ba1\u7406\u8005\u304c\u5fc5\u8981\u306b\u5fdc\u3058\u3066\u975e\u8868\u793a\u306b\u3057\u307e\u3059\u3002';
      reloadComments();
    } else {
      button.disabled = true;
      status.textContent = '\u30b3\u30e1\u30f3\u30c8\u6a5f\u80fd\u306f\u8a2d\u5b9a\u4e2d\u3067\u3059\u3002';
      note.textContent = '\u30b3\u30e1\u30f3\u30c8\u9001\u4fe1\u5148\u306e\u8a2d\u5b9a\u5f8c\u3001\u5168\u54e1\u306b\u8868\u793a\u3055\u308c\u308b\u30b3\u30e1\u30f3\u30c8\u6b04\u3068\u3057\u3066\u52d5\u4f5c\u3057\u307e\u3059\u3002';
      renderComments(list, []);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var body = bodyInput.value.trim();
      if (!body) return;

      var comment = {
        id: randomToken(),
        name: nameInput.value.trim() || '\u540d\u524d\u306a\u3057',
        comment: body,
        body: body,
        parentId: parentInput.value || '',
        createdAt: new Date().toISOString(),
        date: new Date().toISOString()
      };
      var deleteToken = randomToken();
      rememberCommentToken(comment.id, deleteToken);

      if (commentsEndpoint) {
        button.disabled = true;
        status.textContent = '\u9001\u4fe1\u4e2d\u3067\u3059\u3002';
        postComment({
          action: 'comment',
          id: comment.id,
          parentId: comment.parentId,
          deleteToken: deleteToken,
          pagePath: pagePath(),
          pageTitle: pageTitle(),
          pageUrl: pageUrl(),
          name: comment.name,
          comment: body
        });
        setTimeout(function () {
          loadCommentsJsonp({ mode: 'page', pagePath: pagePath() }, function (data) {
            renderComments(list, data && data.comments ? data.comments : [comment], reloadComments);
            status.textContent = '\u9001\u4fe1\u3057\u307e\u3057\u305f\u3002';
            button.disabled = false;
          });
        }, 1200);
        bodyInput.value = '';
        parentInput.value = '';
        form.querySelector('.comment-form-title').textContent = '\u30b3\u30e1\u30f3\u30c8\u3059\u308b';
        return;
      }

      status.textContent = '\u30b3\u30e1\u30f3\u30c8\u6a5f\u80fd\u306f\u8a2d\u5b9a\u4e2d\u3067\u3059\u3002';
    });
  }

  function renderRecentComments(container, comments) {
    if (!comments || !comments.length) return;
    var list = container.querySelector('.recent-comment-list');
    list.innerHTML = '';

    comments.forEach(function (comment) {
      var linkPath = comment.pagePath || '/';
      try {
        if (/^https?:\/\//.test(linkPath)) {
          linkPath = new URL(linkPath).pathname;
        }
      } catch (error) {
        linkPath = '/';
      }
      if (linkPath.charAt(0) !== '/') linkPath = '/' + linkPath;
      linkPath = linkPath.replace(/\/index\.html$/, '/');
      if (linkPath === '/pagePath') linkPath = '/';

      var title = displayCommentTitle(comment.pageTitle, linkPath);

      var link = document.createElement('a');
      link.className = 'recent-comment-link';
      link.href = linkPath + '#comments';
      link.innerHTML =
        '<strong></strong>' +
        '<span></span>';
      link.querySelector('strong').textContent = title;
      link.querySelector('span').textContent = formatDate(comment.createdAt || comment.date) + ' / ' + (comment.name || '\u540d\u524d\u306a\u3057') + ' / ' + String(comment.comment || comment.body || '').slice(0, 40);
      list.appendChild(link);
    });
  }

  function displayCommentTitle(title, path) {
    var map = {
      '/': '\u30db\u30fc\u30e0',
      '/about/': '\u3053\u306e\u30b5\u30a4\u30c8\u306b\u3064\u3044\u3066(\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb)',
      '/note/': 'note\u6295\u7a3f\u8a18\u4e8b\u4e00\u89a7',
      '/instagram/': 'Instagram\u6295\u7a3f\u4e00\u89a7',
      '/tools/': '\u516c\u958b\u30c4\u30fc\u30eb\u4e00\u89a7',
      '/games/': '\u7121\u6599\u30b2\u30fc\u30e0\u4e00\u89a7',
      '/articles/': '\u3042\u3044\u30cd\u30b3\u65e5\u8a18',
      '/contact/': '\u304a\u554f\u3044\u5408\u308f\u305b',
      '/privacy/': '\u30d7\u30e9\u30a4\u30d0\u30b7\u30fc\u30dd\u30ea\u30b7\u30fc',
      '/disclaimer/': '\u514d\u8cac\u4e8b\u9805'
    };
    if (map[path]) return map[path];

    var value = String(title || path || '\u30da\u30fc\u30b8').trim();
    if (!value || value === 'pageTitle') return path === '/' ? map['/'] : path;
    value = value.split('|')[0].split('\uff5c')[0].trim();
    return value || (path === '/' ? map['/'] : path);
  }

  function initRecentComments() {
    if (!commentsEndpoint) return;
    if (location.pathname !== '/' && location.pathname !== '/index.html') return;
    if (document.querySelector('.recent-comments')) return;

    var target = document.querySelector('.profile') || document.querySelector('.update-history');
    if (!target) return;

    var box = document.createElement('section');
    box.className = 'recent-comments';
    box.setAttribute('aria-label', '\u6700\u8fd1\u306e\u30b3\u30e1\u30f3\u30c8');
    box.innerHTML = '<h2>\u6700\u8fd1\u306e\u30b3\u30e1\u30f3\u30c8</h2><div class="recent-comment-list"></div>';
    if (target.classList && target.classList.contains('profile')) {
      target.appendChild(box);
    } else if (target.parentNode) {
      target.parentNode.insertBefore(box, target.nextSibling);
    }

    loadCommentsJsonp({ mode: 'recent', limit: 8 }, function (data) {
      if (!data || !data.comments || !data.comments.length) {
        box.remove();
        return;
      }
      renderRecentComments(box, data.comments);
    });
  }

  function init() {
    initAnalytics();
    if (document.querySelector('.share-buttons')) {
      injectStyle();
      injectPrNotice();
      initComments();
      initRecentComments();
      return;
    }
    if (isGameDetailPage()) {
      initGameDetailHeader();
      initComments();
      return;
    }
    injectStyle();
    injectPrNotice();
    var main = document.querySelector('main') || document.body;
    var explicitTarget = document.querySelector('[data-share-target="top"]');
    if (explicitTarget) {
      explicitTarget.appendChild(buildButtons('top'));
    } else {
      var topTarget =
        main.querySelector('h1') ||
        document.querySelector('h1') ||
        document.querySelector('.hdr-title') ||
        document.querySelector('header .title') ||
        document.querySelector('header');
      if (topTarget && topTarget.parentNode) {
        if (topTarget.tagName && topTarget.tagName.toLowerCase() === 'h1') {
          placeTopButtonsWithTitle(topTarget);
        } else {
          topTarget.insertAdjacentElement('afterend', buildButtons('top'));
        }
      }
    }
    main.appendChild(buildButtons('bottom'));
    initComments();
    initRecentComments();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
