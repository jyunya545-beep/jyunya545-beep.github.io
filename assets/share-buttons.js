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
      '.share-buttons-bottom{margin-top:28px;padding-top:18px;border-top:1px solid rgba(100,116,139,.22)}',
      '.share-btn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;padding:0;border:0;border-radius:999px;color:#fff!important;text-decoration:none!important;cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.12);transition:filter .15s,transform .15s}',
      '.share-btn svg{width:18px;height:18px;fill:currentColor;display:block}',
      '.share-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
      '.share-x{background:#111827}.share-fb{background:#1877f2}.share-line{background:#06c755}.share-note{background:#41c9b4}.share-hb{background:#00a4de}.share-pocket{background:#ef4056}.share-li{background:#0a66c2}.share-copy{background:#64748b}',
      '.share-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}',
      '.share-btn:focus-visible{outline:3px solid rgba(54,196,159,.35);outline-offset:2px}',
      '.global-pr-notice,.pr-notice{max-width:1040px;margin:18px auto 0;padding:0 18px;color:#8a7890!important;font-size:.78rem!important;font-weight:600!important;line-height:1.7!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;display:block!important}',
      '.global-pr-notice span,.pr-notice span{color:inherit!important;font:inherit!important;background:transparent!important;border:0!important;min-width:0!important;min-height:0!important;padding:0!important;border-radius:0!important}',
      '.global-pr-label,.pr-label{font-weight:800!important;margin-right:.45em!important}',
      '@media(max-width:560px){.share-buttons{gap:7px}.share-btn{width:34px;height:34px}.share-btn svg{width:17px;height:17px}}'
    ].join('');
    document.head.appendChild(style);
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

  function init() {
    initAnalytics();
    if (document.querySelector('.share-buttons')) return;
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
        topTarget.insertAdjacentElement('afterend', buildButtons('top'));
      }
    }
    main.appendChild(buildButtons('bottom'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
