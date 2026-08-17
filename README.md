# Desk — Simplified Chatwoot-like Support Inbox

Isang simplified na bersyon ng Chatwoot: **Inbox, Conversations, Channels, Reports, Agents,
Settings** — may agent login, embeddable website chat widget, at kayang ikonekta sa
**Dify (o sariling AI agent)** at **Meta (Facebook Messenger, Instagram DM, WhatsApp)**.

## Stack

- **Backend**: Node.js + Express + Socket.io (realtime) + Sequelize + SQLite (zero-config;
  madaling i-swap sa Postgres/Supabase kapag ready na for production) + JWT auth
- **Frontend**: React + Vite

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# i-edit ang .env kung meron kang Meta / Dify credentials na ilalagay agad, at palitan
# ang JWT_SECRET
npm run seed     # gumagawa ng admin agent, 2 channels (Website + Facebook), at 1 test conversation
npm run dev       # runs on http://localhost:4000
```

Login credentials pagkatapos ng seed: **admin@example.com / admin123** (baguhin agad sa
Agents page o direkta sa DB kapag production na).

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev       # runs on http://localhost:5173
```

Buksan ang http://localhost:5173 sa browser, mag-sign in gamit ang credentials sa itaas.

## 3. Website chat widget

1. Sa Channels page, i-configure ang "Website Chat" inbox mo — makikita mo doon ang embed
   snippet, halimbawa:

   ```html
   <script>
     window.deskWidgetSettings = {
       inboxId: "your-inbox-id",
       baseUrl: "http://localhost:4000",
     };
   </script>
   <script src="http://localhost:4000/widget.js" async></script>
   ```

2. I-paste ito sa website mo bago ang `</body>`. Lalabas ang chat bubble sa kanang-baba.
3. Para subukan agad nang walang sariling website: buksan ang
   `http://localhost:4000/demo.html` sa browser (palitan muna ang `INBOX_ID_HERE` sa file na
   `backend/public/demo.html` ng totoong inbox id mo).
4. Ang mga bagong mensahe mula sa widget ay lalabas sa Inbox mo nang real-time (kailangan
   naka-login ang dashboard).

## 4. Pagkonekta sa Meta (Facebook / Instagram / WhatsApp)

1. Gumawa ng Meta App sa https://developers.facebook.com/apps (uri: Business)
2. Idagdag ang **Messenger** at/o **WhatsApp** product sa app mo
3. I-deploy muna ang backend mo sa isang publicly-reachable URL (Render/Railway/etc.), o
   gamitin ang `ngrok http 4000` habang nagte-test lang lokal
4. Sa Meta App Dashboard → Webhooks, i-set ang Callback URL sa:
   `https://YOUR_BACKEND_URL/api/integrations/meta/webhook`
   at ang Verify Token dapat kapareho ng `META_VERIFY_TOKEN` sa `.env` mo
5. Sa app UI (Channels page), gumawa ng channel na "Facebook", "Instagram", o "WhatsApp", tapos
   i-configure ang Page Access Token / WhatsApp Phone Number ID + Access Token
6. Ang mga papasok na mensahe sa Messenger/Instagram/WhatsApp ay lalabas na sa Inbox mo nang
   real-time, at ang mga sagot mo (o AI agent replies) ay ipapadala pabalik sa customer

## 5. Pagkonekta sa Dify o sariling AI agent

1. Sa app UI (Settings page), piliin ang channel na gusto mong bigyan ng AI agent
2. Piliin ang provider: **Dify** (ilagay ang Dify API URL + API key mula sa Dify app mo) o
   **Custom** (ilagay ang URL ng sarili mong webhook — POST `{ message, conversationId }`,
   dapat mag-respond ng `{ reply: "..." }`)
3. I-on ang "Auto-reply" para awtomatikong sumagot ang AI agent sa bagong customer messages
4. Gamitin ang "Test connection" button para makasiguro bago i-save

## Project structure

```
backend/
  models/        Agent (with password), Contact, Inbox (channel), Conversation, Message
  middleware/    auth.js (JWT requireAuth / optionalAuth)
  routes/        auth, agents, inboxes, conversations, messages, reports
  routes/integrations/  meta.js (webhook), dify.js (test connection)
  services/      aiAgent.js (Dify/custom AI caller), metaSender.js (send replies to Meta)
  public/        widget.js (embeddable chat widget), demo.html (test page)
  socket.js      Socket.io realtime events
  server.js      entry point

frontend/
  src/pages/     Login.jsx, Inbox.jsx, Channels.jsx, Reports.jsx, Agents.jsx, Settings.jsx
  src/components/ Sidebar.jsx
  src/context/   AuthContext.jsx
  src/api.js, src/socket.js
```

Note sa security ng MVP: public muna (walang auth) ang ilang endpoint na kailangan ng widget
mismo — paggawa ng conversation, pagpapadala ng customer messages, at pagbasa ng sariling
history ng isang conversation (kailangan ang conversationId na UUID). Lahat ng ibang
dashboard endpoints (list ng lahat ng conversations, agents, channels, reports) ay protektado
na ng login.

## Susunod na pwedeng idagdag (roadmap)

- Canned responses / saved replies
- Multi-agent assignment rules / auto-routing
- Email channel (IMAP/SMTP)
- Postgres migration guide papalitan ang SQLite para sa production
- Password reset / forgot password flow
- Agent presence (online/offline) indicators sa dashboard
