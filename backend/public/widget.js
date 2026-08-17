(function () {
  var settings = window.deskWidgetSettings || {};
  var inboxId = settings.inboxId;
  var baseUrl = settings.baseUrl || "http://localhost:4000";
  var welcomeText = settings.welcomeText || "Hi! Paano ka namin matutulungan?";

  if (!inboxId) {
    console.error("[Desk widget] Missing inboxId in window.deskWidgetSettings");
    return;
  }

  var STORAGE_KEY = "desk_widget_conversation_" + inboxId;
  var state = {
    conversationId: null,
    socket: null,
    open: false,
  };

  try {
    state.conversationId = localStorage.getItem(STORAGE_KEY) || null;
  } catch (e) {
    /* localStorage unavailable, fine — will just start a fresh conversation each visit */
  }

  // ---------- styles ----------
  var style = document.createElement("style");
  style.textContent = [
    "#desk-widget-bubble{position:fixed;bottom:20px;right:20px;width:56px;height:56px;",
    "border-radius:50%;background:#2F6F5E;color:#fff;display:flex;align-items:center;",
    "justify-content:center;font-size:26px;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.2);",
    "z-index:999999;font-family:sans-serif;border:none;}",
    "#desk-widget-panel{position:fixed;bottom:88px;right:20px;width:340px;height:460px;",
    "background:#fff;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.25);",
    "display:none;flex-direction:column;overflow:hidden;z-index:999999;",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;}",
    "#desk-widget-panel.open{display:flex;}",
    "#desk-widget-header{background:#17211D;color:#fff;padding:14px 16px;font-weight:600;font-size:14px;}",
    "#desk-widget-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;background:#F6F5F1;}",
    ".desk-msg{max-width:80%;padding:8px 12px;border-radius:12px;font-size:13px;line-height:1.4;}",
    ".desk-msg.in{background:#fff;border:1px solid #E4E2DC;align-self:flex-start;border-bottom-left-radius:3px;}",
    ".desk-msg.out{background:#2F6F5E;color:#fff;align-self:flex-end;border-bottom-right-radius:3px;}",
    "#desk-widget-form{display:flex;border-top:1px solid #E4E2DC;padding:10px;gap:8px;}",
    "#desk-widget-input{flex:1;border:1px solid #E4E2DC;border-radius:8px;padding:8px 10px;font-size:13px;}",
    "#desk-widget-send{background:#2F6F5E;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:13px;cursor:pointer;}",
  ].join("");
  document.head.appendChild(style);

  // ---------- markup ----------
  var bubble = document.createElement("button");
  bubble.id = "desk-widget-bubble";
  bubble.innerHTML = "💬";
  document.body.appendChild(bubble);

  var panel = document.createElement("div");
  panel.id = "desk-widget-panel";
  panel.innerHTML =
    '<div id="desk-widget-header">Chat with us</div>' +
    '<div id="desk-widget-messages"></div>' +
    '<form id="desk-widget-form">' +
    '<input id="desk-widget-input" type="text" placeholder="Type a message..." autocomplete="off" />' +
    '<button id="desk-widget-send" type="submit">Send</button>' +
    "</form>";
  document.body.appendChild(panel);

  var messagesEl = panel.querySelector("#desk-widget-messages");
  var formEl = panel.querySelector("#desk-widget-form");
  var inputEl = panel.querySelector("#desk-widget-input");

  function appendMessage(text, direction) {
    var el = document.createElement("div");
    el.className = "desk-msg " + direction;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  bubble.addEventListener("click", function () {
    state.open = !state.open;
    panel.classList.toggle("open", state.open);
    if (state.open) init();
  });

  var initialized = false;
  function init() {
    if (initialized) return;
    initialized = true;

    if (!state.conversationId) {
      appendMessage(welcomeText, "in");
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
        try {
          localStorage.setItem(STORAGE_KEY, conv.id);
        } catch (e) {}
      });
  }

  function loadHistory() {
    fetch(baseUrl + "/api/messages/conversation/" + state.conversationId)
      .then(function (res) {
        return res.json();
      })
      .then(function (msgs) {
        msgs.forEach(function (m) {
          appendMessage(m.content, m.senderType === "contact" ? "out" : "in");
        });
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
      appendMessage(msg.content, "in");
    });
  }

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = "";
    appendMessage(text, "out");

    ensureConversation().then(function () {
      fetch(baseUrl + "/api/messages/conversation/" + state.conversationId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, senderType: "contact" }),
      });
    });
  });
})();
