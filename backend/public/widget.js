(function () {
  var settings = window.deskWidgetSettings || {};
  var inboxId = settings.inboxId;
  var baseUrl = settings.baseUrl || "http://localhost:4000";

  if (!inboxId) {
    console.error("[Desk widget] Missing inboxId in window.deskWidgetSettings");
    return;
  }

  var DEFAULT_CFG = {
    brandName: "Chat with us",
    welcomeText: settings.welcomeText || "Kumusta! Paano ka namin matutulungan ngayon?",
    statusText: "Nandito kami",
    footnoteText: "Karaniwang sumasagot sa loob ng ilang minuto",
    accentColor: "#E8A33D",
    bgColor: "#1B2129",
    messagesBgColor: "#12151A",
    teal: "#5CC8C2",
    position: "bottom-right",
    size: "medium",
    chips: [
      { label: "I-track ang order", msg: "Gusto kong i-track ang order ko" },
      { label: "Billing", msg: "May tanong ako tungkol sa billing" },
      { label: "Mag-report ng issue", msg: "May issue akong na-encounter" },
    ],
  };

  var SIZES = {
    small: { w: 320, h: 460 },
    medium: { w: 360, h: 520 },
    large: { w: 400, h: 600 },
  };

  var STORAGE_KEY = "desk_widget_conversation_" + inboxId;
  var state = {
    conversationId: null,
    socket: null,
    open: false,
    initialized: false,
    unread: 0,
  };

  try {
    state.conversationId = localStorage.getItem(STORAGE_KEY) || null;
  } catch (e) {
    /* localStorage unavailable — fine, fresh conversation each visit */
  }

  fetch(baseUrl + "/api/public/inboxes/" + inboxId + "/widget-config")
    .then(function (res) {
      return res.ok ? res.json() : {};
    })
    .catch(function () {
      return {};
    })
    .then(function (remoteCfg) {
      var cfg = Object.assign({}, DEFAULT_CFG, remoteCfg || {});
      buildWidget(cfg);
    });

  function buildWidget(cfg) {
    var size = SIZES[cfg.size] || SIZES.medium;
    var isLeft = cfg.position === "bottom-left";
    var side = isLeft ? "left" : "right";

    // ---------- fonts ----------
    var fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(fontLink);

    // ---------- styles ----------
    var style = document.createElement("style");
    style.textContent = [
      "#desk-widget-stub{position:fixed;bottom:20px;" + side + ":20px;display:flex;align-items:center;gap:10px;",
      "background:#12151A;color:#EDEAE1;border:1px solid rgba(237,234,225,.12);border-radius:999px;",
      "padding:12px 18px 12px 14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);",
      "font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:14px;z-index:999999;",
      "transition:transform .18s ease;border:none;}",
      "#desk-widget-stub:hover{transform:translateY(-2px);}",
      "#desk-widget-stub:focus-visible{outline:2px solid " + cfg.teal + ";outline-offset:3px;}",
      "#desk-widget-stub .desk-dot{width:9px;height:9px;border-radius:50%;background:" + cfg.teal + ";",
      "animation:desk-pulse 2.2s infinite;flex-shrink:0;}",
      "#desk-widget-stub .desk-unread{background:" + cfg.accentColor + ";color:#1A1305;font-family:'IBM Plex Mono',monospace;",
      "font-size:11px;font-weight:500;border-radius:999px;padding:2px 7px;display:none;}",
      "#desk-widget-stub .desk-unread.show{display:inline-block;}",
      "@keyframes desk-pulse{0%{box-shadow:0 0 0 0 rgba(92,200,194,.55);}",
      "70%{box-shadow:0 0 0 8px rgba(92,200,194,0);}100%{box-shadow:0 0 0 0 rgba(92,200,194,0);}}",

      "#desk-widget-panel{position:fixed;bottom:20px;" + side + ":20px;width:" + size.w + "px;max-width:calc(100vw - 32px);",
      "height:" + size.h + "px;max-height:calc(100vh - 48px);background:" + cfg.bgColor + ";border:1px solid rgba(237,234,225,.12);",
      "border-radius:14px;box-shadow:0 24px 60px rgba(0,0,0,.5);display:none;flex-direction:column;",
      "overflow:hidden;z-index:999999;font-family:'Inter',sans-serif;opacity:0;",
      "transform:translateY(16px) scale(.98);transition:opacity .2s ease, transform .2s ease;}",
      "#desk-widget-panel.open{display:flex;opacity:1;transform:translateY(0) scale(1);}",
      "@media (prefers-reduced-motion: reduce){#desk-widget-panel,#desk-widget-stub{transition:none;}}",

      "#desk-widget-header{padding:16px 18px 14px;display:flex;align-items:flex-start;",
      "justify-content:space-between;gap:10px;flex-shrink:0;}",
      "#desk-widget-brand-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;",
      "color:#EDEAE1;display:block;}",
      "#desk-widget-brand-status{display:flex;align-items:center;gap:6px;font-size:12px;color:#A9A79E;",
      "margin-top:3px;}",
      "#desk-widget-brand-status .desk-dot{width:7px;height:7px;border-radius:50%;background:" + cfg.teal + ";",
      "animation:desk-pulse 2.2s infinite;}",
      "#desk-widget-ticket{font-family:'IBM Plex Mono',monospace;font-size:11px;color:" + cfg.accentColor + ";",
      "background:rgba(232,163,61,.1);border:1px solid rgba(232,163,61,.3);border-radius:6px;",
      "padding:4px 8px;white-space:nowrap;}",
      "#desk-widget-close{background:none;border:none;color:#A9A79E;cursor:pointer;font-size:18px;",
      "line-height:1;padding:4px;border-radius:6px;}",
      "#desk-widget-close:hover{color:#EDEAE1;background:#232B35;}",
      "#desk-widget-close:focus-visible{outline:2px solid " + cfg.teal + ";outline-offset:2px;}",

      "#desk-widget-perf{position:relative;height:14px;margin:0 -1px;flex-shrink:0;",
      "background:radial-gradient(circle at 8px 7px, transparent 4.5px, " + cfg.bgColor + " 5px) repeat-x, #12151A;",
      "background-size:16px 14px;}",
      "#desk-widget-perf::before,#desk-widget-perf::after{content:'';position:absolute;top:50%;",
      "width:10px;height:10px;background:#12151A;border-radius:50%;transform:translateY(-50%);}",
      "#desk-widget-perf::before{left:-6px;}",
      "#desk-widget-perf::after{right:-6px;}",

      "#desk-widget-messages{flex:1;overflow-y:auto;padding:16px 18px;display:flex;",
      "flex-direction:column;background:" + cfg.messagesBgColor + ";}",
      "#desk-widget-messages::-webkit-scrollbar{width:6px;}",
      "#desk-widget-messages::-webkit-scrollbar-thumb{background:#232B35;border-radius:99px;}",

      ".desk-msg-wrap{display:flex;flex-direction:column;margin-bottom:10px;max-width:82%;}",
      ".desk-msg-wrap.contact{align-self:flex-end;align-items:flex-end;}",
      ".desk-msg-wrap.other{align-self:flex-start;align-items:flex-start;}",
      ".desk-msg-badge{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.04em;",
      "color:" + cfg.teal + ";margin-bottom:3px;text-transform:uppercase;}",
      ".desk-msg{padding:10px 13px;border-radius:12px;font-size:13.5px;line-height:1.5;",
      "animation:desk-rise .2s ease;}",
      "@keyframes desk-rise{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}",
      ".desk-msg.other{background:#232B35;color:#EDEAE1;border-bottom-left-radius:4px;}",
      ".desk-msg.contact{background:" + cfg.accentColor + ";color:#1A1305;border-bottom-right-radius:4px;font-weight:500;}",
      ".desk-msg-time{font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6B7280;margin-top:4px;}",

      "#desk-widget-typing{align-self:flex-start;display:flex;gap:4px;padding:11px 14px;",
      "background:#232B35;border-radius:12px;border-bottom-left-radius:4px;margin-bottom:10px;}",
      "#desk-widget-typing span{width:6px;height:6px;border-radius:50%;background:#A9A79E;",
      "animation:desk-bounce 1.2s infinite;}",
      "#desk-widget-typing span:nth-child(2){animation-delay:.15s;}",
      "#desk-widget-typing span:nth-child(3){animation-delay:.3s;}",
      "@keyframes desk-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}",
      "30%{transform:translateY(-4px);opacity:1;}}",

      "#desk-widget-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 18px 12px;background:" + cfg.messagesBgColor + ";",
      "flex-shrink:0;}",
      ".desk-chip{font-family:'Inter',sans-serif;font-size:12px;color:" + cfg.teal + ";",
      "background:rgba(92,200,194,.08);border:1px solid rgba(92,200,194,.3);border-radius:999px;",
      "padding:6px 12px;cursor:pointer;}",
      ".desk-chip:hover{background:rgba(92,200,194,.18);}",
      ".desk-chip:focus-visible{outline:2px solid " + cfg.teal + ";outline-offset:2px;}",

      "#desk-widget-form{display:flex;align-items:center;gap:8px;padding:12px 14px;background:" + cfg.bgColor + ";",
      "border-top:1px solid rgba(237,234,225,.12);flex-shrink:0;}",
      "#desk-widget-input{flex:1;background:#232B35;border:1px solid rgba(237,234,225,.12);",
      "color:#EDEAE1;font-family:'Inter',sans-serif;font-size:13.5px;padding:10px 13px;",
      "border-radius:10px;outline:none;min-width:0;}",
      "#desk-widget-input::placeholder{color:#6B7280;}",
      "#desk-widget-input:focus{border-color:" + cfg.teal + ";}",
      "#desk-widget-send{background:" + cfg.accentColor + ";border:none;width:36px;height:36px;border-radius:10px;",
      "display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}",
      "#desk-widget-send:hover{filter:brightness(1.08);}",
      "#desk-widget-send:focus-visible{outline:2px solid " + cfg.teal + ";outline-offset:2px;}",

      "#desk-widget-footnote{text-align:center;font-size:10.5px;color:#6B7280;padding:6px 0 10px;",
      "background:" + cfg.bgColor + ";flex-shrink:0;}",

      "@media (max-width:420px){#desk-widget-panel{right:12px;left:12px;width:auto;bottom:12px;",
      "max-height:calc(100vh - 24px);}#desk-widget-stub{" + side + ":12px;bottom:12px;}}",
    ].join("");
    document.head.appendChild(style);

    // ---------- markup ----------
    var stub = document.createElement("button");
    stub.id = "desk-widget-stub";
    stub.setAttribute("aria-haspopup", "dialog");
    stub.setAttribute("aria-expanded", "false");
    stub.innerHTML =
      '<span class="desk-dot"></span>Suporta<span class="desk-unread" id="desk-widget-unread">1</span>';
    document.body.appendChild(stub);

    var panel = document.createElement("div");
    panel.id = "desk-widget-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat support");
    panel.innerHTML =
      '<div id="desk-widget-header">' +
      '<div><span id="desk-widget-brand-name">' + escapeHtml(cfg.brandName) + '</span>' +
      '<div id="desk-widget-brand-status"><span class="desk-dot"></span>' + escapeHtml(cfg.statusText) + '</div></div>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<span id="desk-widget-ticket">BAGO</span>' +
      '<button id="desk-widget-close" aria-label="Isara ang chat">&#10005;</button>' +
      "</div></div>" +
      '<div id="desk-widget-perf"></div>' +
      '<div id="desk-widget-messages"></div>' +
      '<div id="desk-widget-chips">' +
      (cfg.chips || [])
        .map(function (c) {
          return '<button class="desk-chip" data-msg="' + escapeHtml(c.msg) + '">' + escapeHtml(c.label) + "</button>";
        })
        .join("") +
      "</div>" +
      '<form id="desk-widget-form">' +
      '<input id="desk-widget-input" type="text" placeholder="Mag-type ng mensahe…" autocomplete="off" aria-label="Mensahe" />' +
      '<button id="desk-widget-send" type="submit" aria-label="Ipadala">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1305" stroke-width="2.4" ' +
      'stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line>' +
      '<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>' +
      "</form>" +
      '<div id="desk-widget-footnote">' + escapeHtml(cfg.footnoteText) + "</div>";
    document.body.appendChild(panel);

    var messagesEl = panel.querySelector("#desk-widget-messages");
    var formEl = panel.querySelector("#desk-widget-form");
    var inputEl = panel.querySelector("#desk-widget-input");
    var ticketEl = panel.querySelector("#desk-widget-ticket");
    var chipsEl = panel.querySelector("#desk-widget-chips");
    var unreadEl = stub.querySelector("#desk-widget-unread");

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str == null ? "" : String(str);
      return div.innerHTML;
    }

    // ---------- helpers ----------
    function formatTime(dateStr) {
      var d = dateStr ? new Date(dateStr) : new Date();
      return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
    }

    function appendMessage(msg) {
      var wrap = document.createElement("div");
      var isContact = msg.senderType === "contact";
      wrap.className = "desk-msg-wrap " + (isContact ? "contact" : "other");

      if (!isContact) {
        var badge = document.createElement("div");
        badge.className = "desk-msg-badge";
        badge.textContent = msg.senderType === "bot" ? "AI Agent" : msg.senderName || "Agent";
        wrap.appendChild(badge);
      }

      var bubble = document.createElement("div");
      bubble.className = "desk-msg " + (isContact ? "contact" : "other");
      bubble.textContent = msg.content;
      wrap.appendChild(bubble);

      var time = document.createElement("span");
      time.className = "desk-msg-time";
      time.textContent = formatTime(msg.createdAt);
      wrap.appendChild(time);

      messagesEl.appendChild(wrap);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
      if (document.getElementById("desk-widget-typing")) return;
      var t = document.createElement("div");
      t.id = "desk-widget-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(t);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      var t = document.getElementById("desk-widget-typing");
      if (t) t.remove();
    }

    function setTicket(id) {
      ticketEl.textContent = "#" + id.slice(0, 8).toUpperCase();
    }

    // ---------- open/close ----------
    function openPanel() {
      state.open = true;
      panel.classList.add("open");
      stub.setAttribute("aria-expanded", "true");
      state.unread = 0;
      unreadEl.classList.remove("show");
      inputEl.focus();
      if (!state.initialized) init();
    }
    function closePanel() {
      state.open = false;
      panel.classList.remove("open");
      stub.setAttribute("aria-expanded", "false");
    }
    stub.addEventListener("click", function () {
      state.open ? closePanel() : openPanel();
    });
    panel.querySelector("#desk-widget-close").addEventListener("click", closePanel);

    // ---------- backend wiring ----------
    function init() {
      state.initialized = true;
      if (!state.conversationId) {
        appendMessage({ content: cfg.welcomeText, senderType: "bot", senderName: "AI Agent" });
      } else {
        setTicket(state.conversationId);
      }
      ensureConversation().then(function () {
        loadHistory();
        connectSocket();
      });
    }

    function ensureConversation() {
      if (state.conversationId) return Promise.resolve();
      return fetch(baseUrl + "/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inboxId: inboxId, contactName: "Website visitor" }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (conv) {
          state.conversationId = conv.id;
          setTicket(conv.id);
          try {
            localStorage.setItem(STORAGE_KEY, conv.id);
          } catch (e) {}
        })
        .catch(function () {
          appendMessage({
            content: "Hindi kami makakonekta ngayon. Subukan ulit mamaya.",
            senderType: "bot",
            senderName: "System",
          });
        });
    }

    function loadHistory() {
      fetch(baseUrl + "/api/messages/conversation/" + state.conversationId)
        .then(function (res) {
          return res.json();
        })
        .then(function (msgs) {
          msgs.forEach(appendMessage);
        })
        .catch(function () {});
    }

    function connectSocket() {
      if (window.io) {
        startSocket();
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      script.onload = startSocket;
      document.head.appendChild(script);
    }

    function startSocket() {
      state.socket = window.io(baseUrl);
      state.socket.emit("join_conversation", state.conversationId);
      state.socket.on("new_message", function (msg) {
        if (msg.conversationId !== state.conversationId) return;
        if (msg.senderType === "contact") return; // already shown optimistically
        hideTyping();
        appendMessage(msg);
        if (!state.open) {
          state.unread += 1;
          unreadEl.textContent = state.unread;
          unreadEl.classList.add("show");
        }
      });
    }

    function sendText(text) {
      if (!text) return;
      appendMessage({ content: text, senderType: "contact" });
      showTyping();
      ensureConversation().then(function () {
        fetch(baseUrl + "/api/messages/conversation/" + state.conversationId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, senderType: "contact" }),
        }).catch(function () {
          hideTyping();
        });
      });
    }

    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = "";
      sendText(text);
    });

    chipsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".desk-chip");
      if (!btn) return;
      sendText(btn.dataset.msg);
    });
  }
})();
