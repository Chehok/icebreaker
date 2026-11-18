/* 아이스브레이커 "함께하기" 방 서버
 *
 * - POST /rooms               방 만들기 → { code, clientId, key }
 * - GET  /rooms/:code         방 정보(있는지, 리더 이름, 인원)
 * - GET  /rooms/:code/ws      웹소켓 연결 (Durable Object로 전달)
 *
 * 방 하나 = Durable Object 하나(idFromName(code)). WebSocket Hibernation API를 써서
 * 조용할 때는 객체가 잠들고, 상태는 storage("room")에 저장했다가 깨어날 때 다시 읽습니다.
 * 방은 마지막 활동 후 ROOM_TTL_MS가 지나면 알람으로 지워집니다.
 */

const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_MEMBERS = 40;
const NAME_MAX = 10;
const NOTE_MAX = 200;
const MSG_MAX_BYTES = 4096;
const MODES = ["topic", "balance", "who"];
const SPICES = ["mild", "medium", "hot"];

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers }
  });
}

function originAllowed(origin, env) {
  if (!origin) return false;
  let url;
  try { url = new URL(origin); } catch { return false; }
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
  if (url.protocol === "https:" && (url.hostname === "icebreaker-de4.pages.dev" || url.hostname.endsWith(".icebreaker-de4.pages.dev"))) return true;
  const list = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.includes(url.origin);
}

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin"
  };
}

function randomId(bytes = 12) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomCode() {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return String(1000 + (a[0] % 9000));
}

function cleanName(value) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
}

function cleanText(value, max) {
  return String(value ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";
    const allowed = originAllowed(origin, env);
    const cors = allowed ? corsHeaders(origin) : {};

    if (request.method === "OPTIONS") {
      return new Response(null, { status: allowed ? 204 : 403, headers: cors });
    }
    if (url.pathname === "/" || url.pathname === "/health") {
      return json({ ok: true, service: "icebreaker-rooms" }, 200, cors);
    }
    if (!allowed) return json({ error: "origin_not_allowed" }, 403);

    if (url.pathname === "/rooms" && request.method === "POST") {
      let body = {};
      try { body = await request.json(); } catch { /* 빈 요청은 아래에서 거절 */ }
      const name = cleanName(body.name);
      if (!name) return json({ error: "name_required" }, 400, cors);
      const mode = MODES.includes(body.mode) ? body.mode : "topic";
      const spice = SPICES.includes(body.spice) ? body.spice : "mild";
      for (let i = 0; i < 12; i++) {
        const code = randomCode();
        const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
        const res = await stub.fetch("https://room/init", {
          method: "POST",
          body: JSON.stringify({ code, name, mode, spice })
        });
        if (res.status === 409) continue;
        const data = await res.json();
        return json(data, res.status, cors);
      }
      return json({ error: "no_free_code" }, 503, cors);
    }

    const m = url.pathname.match(/^\/rooms\/(\d{4})(\/ws)?$/);
    if (m) {
      const stub = env.ROOMS.get(env.ROOMS.idFromName(m[1]));
      if (m[2]) {
        if (request.headers.get("upgrade") !== "websocket") return json({ error: "expected_websocket" }, 426, cors);
        return stub.fetch(new Request("https://room/ws", request));
      }
      const res = await stub.fetch("https://room/info");
      return json(await res.json(), res.status, cors);
    }
    return json({ error: "not_found" }, 404, cors);
  }
};

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.state = null;
    // 잠든 객체를 깨우지 않고 연결 유지용 ping에 답합니다.
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  async load() {
    if (!this.state) this.state = (await this.ctx.storage.get("room")) || null;
    return this.state;
  }

  async save() {
    this.state.lastActive = Date.now();
    await this.ctx.storage.put("room", this.state);
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const state = await this.load();

    if (url.pathname === "/init") {
      if (state && !state.ended) return json({ error: "code_in_use" }, 409);
      const body = await request.json();
      const leaderId = randomId(8);
      const key = randomId(16);
      this.state = {
        code: body.code,
        createdAt: Date.now(),
        lastActive: Date.now(),
        leaderId,
        members: { [leaderId]: { name: body.name, role: "leader", key, joinedAt: Date.now() } },
        round: null,
        roundCount: 0,
        mode: body.mode,
        spice: body.spice,
        settings: { showResults: true, showVoters: false },
        ended: false
      };
      await this.save();
      return json({ code: body.code, clientId: leaderId, key });
    }

    if (url.pathname === "/info") {
      if (!state || state.ended) return json({ exists: false }, 404);
      return json({
        exists: true,
        code: state.code,
        leaderName: state.members[state.leaderId]?.name || "",
        memberCount: Object.keys(state.members).length
      });
    }

    if (url.pathname === "/ws") {
      if (!state || state.ended) return json({ error: "room_not_found" }, 404);
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      server.serializeAttachment({ clientId: null });
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ error: "not_found" }, 404);
  }

  send(ws, data) {
    try { ws.send(JSON.stringify(data)); } catch { /* 이미 닫힌 연결 */ }
  }

  onlineIds() {
    const ids = new Set();
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment();
      if (a && a.clientId) ids.add(a.clientId);
    }
    return ids;
  }

  async webSocketMessage(ws, raw) {
    if (typeof raw !== "string" || raw.length > MSG_MAX_BYTES) return;
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const state = await this.load();
    if (!state || state.ended) {
      this.send(ws, { t: "ended" });
      ws.close(4004, "room_ended");
      return;
    }
    const att = ws.deserializeAttachment() || {};

    if (msg.t === "hello") return this.onHello(ws, msg);
    if (!att.clientId || !state.members[att.clientId]) return this.send(ws, { t: "error", code: "not_joined" });

    const isLeader = att.clientId === state.leaderId;

    if (isLeader) {
      if (msg.t === "round") return this.onRound(msg);
      if (msg.t === "settings") {
        if (typeof msg.showResults === "boolean") state.settings.showResults = msg.showResults;
        if (typeof msg.showVoters === "boolean") state.settings.showVoters = msg.showVoters;
        if (MODES.includes(msg.mode)) state.mode = msg.mode;
        if (SPICES.includes(msg.spice)) state.spice = msg.spice;
        await this.save();
        return this.broadcast();
      }
      if (msg.t === "end") {
        state.ended = true;
        await this.ctx.storage.deleteAll();
        for (const s of this.ctx.getWebSockets()) {
          this.send(s, { t: "ended" });
          try { s.close(4000, "room_ended"); } catch { /* 무시 */ }
        }
        return;
      }
    }

    if (msg.t === "leave") {
      if (!isLeader) {
        delete state.members[att.clientId];
        if (state.round) delete state.round.responses[att.clientId];
        await this.save();
      }
      ws.serializeAttachment({ clientId: null });
      try { ws.close(4001, "left"); } catch { /* 무시 */ }
      return this.broadcast();
    }

    if (!state.round || isLeader) return;
    const round = state.round;
    let response = null;
    if (msg.t === "pass") response = { type: "pass" };
    else if (round.mode === "topic" && msg.t === "note") {
      const text = cleanText(msg.text, NOTE_MAX);
      if (!text) return;
      response = { type: "note", text, anon: !!msg.anon };
    } else if (round.mode === "balance" && msg.t === "vote" && (msg.choice === "a" || msg.choice === "b")) {
      response = { type: "vote", choice: msg.choice };
    } else if (round.mode === "who" && msg.t === "pick" && state.members[msg.target]) {
      response = { type: "pick", target: msg.target };
    }
    if (!response || msg.round !== round.n) return;
    response.at = Date.now();
    round.responses[att.clientId] = response;
    await this.save();
    this.broadcast();
  }

  async onHello(ws, msg) {
    const state = this.state;
    const clientId = typeof msg.clientId === "string" ? msg.clientId : "";
    const key = typeof msg.key === "string" ? msg.key : "";
    const known = clientId && state.members[clientId];

    if (known && known.key === key) {
      ws.serializeAttachment({ clientId });
      this.send(ws, { t: "welcome", clientId, key, role: known.role });
      return this.broadcast();
    }

    const name = cleanName(msg.name);
    if (!name) return this.send(ws, { t: "need_name" });
    const taken = Object.values(state.members).some((m) => m.name.toLowerCase() === name.toLowerCase());
    if (taken) return this.send(ws, { t: "error", code: "name_taken" });
    if (Object.keys(state.members).length >= MAX_MEMBERS) return this.send(ws, { t: "error", code: "room_full" });

    const id = randomId(8);
    const newKey = randomId(16);
    state.members[id] = { name, role: "player", key: newKey, joinedAt: Date.now() };
    await this.save();
    ws.serializeAttachment({ clientId: id });
    this.send(ws, { t: "welcome", clientId: id, key: newKey, role: "player" });
    this.broadcast();
  }

  async onRound(msg) {
    const state = this.state;
    if (!MODES.includes(msg.mode) || !SPICES.includes(msg.spice)) return;
    const q = msg.question || {};
    const question = msg.mode === "balance"
      ? { a: cleanText(q.a, 200), b: cleanText(q.b, 200) }
      : { text: cleanText(q.text, 300) };
    if (msg.mode === "balance" ? !(question.a && question.b) : !question.text) return;
    state.roundCount += 1;
    state.mode = msg.mode;
    state.spice = msg.spice;
    state.round = {
      n: state.roundCount,
      mode: msg.mode,
      spice: msg.spice,
      label: cleanText(msg.label, 40),
      question,
      responses: {}
    };
    await this.save();
    this.broadcast();
  }

  view(forId) {
    const state = this.state;
    const online = this.onlineIds();
    const isLeader = forId === state.leaderId;
    const members = Object.entries(state.members)
      .sort((a, b) => (a[1].role === "leader" ? -1 : 0) - (b[1].role === "leader" ? -1 : 0) || a[1].joinedAt - b[1].joinedAt)
      .map(([id, m]) => ({ id, name: m.name, role: m.role, online: online.has(id) }));
    const players = members.filter((m) => m.role !== "leader");
    const out = {
      t: "state",
      code: state.code,
      me: { id: forId, role: isLeader ? "leader" : "player", name: state.members[forId]?.name || "" },
      leaderName: state.members[state.leaderId]?.name || "",
      mode: state.mode,
      spice: state.spice,
      settings: state.settings,
      members,
      round: null
    };
    const round = state.round;
    if (!round) return out;

    const responses = round.responses;
    const answered = players.filter((p) => responses[p.id]).length;
    const r = {
      n: round.n, mode: round.mode, spice: round.spice, label: round.label, question: round.question,
      answered, total: players.length,
      mine: responses[forId] || null
    };
    const nameOf = (id) => state.members[id]?.name || "(나간 사람)";

    if (round.mode === "topic") {
      if (isLeader) {
        r.notes = Object.entries(responses)
          .filter(([, v]) => v.type === "note")
          .sort((a, b) => a[1].at - b[1].at)
          .map(([id, v]) => ({ name: v.anon ? "익명" : nameOf(id), text: v.text }));
        r.passes = Object.values(responses).filter((v) => v.type === "pass").length;
      }
    } else if (round.mode === "balance") {
      const a = [], b = [];
      for (const [id, v] of Object.entries(responses)) {
        if (v.type !== "vote") continue;
        (v.choice === "a" ? a : b).push(nameOf(id));
      }
      if (isLeader) r.result = { a, b };
      else if (state.settings.showResults && r.mine) r.result = { a: a.length, b: b.length };
    } else if (round.mode === "who") {
      const tally = new Map();
      for (const [id, v] of Object.entries(responses)) {
        if (v.type !== "pick") continue;
        const t = tally.get(v.target) || { id: v.target, name: nameOf(v.target), count: 0, voters: [] };
        t.count += 1;
        t.voters.push(nameOf(id));
        tally.set(v.target, t);
      }
      const list = [...tally.values()].sort((x, y) => y.count - x.count);
      const showVoters = isLeader && state.settings.showVoters;
      const rows = list.map((t) => ({ id: t.id, name: t.name, count: t.count, voters: showVoters ? t.voters : undefined }));
      if (isLeader) r.result = rows;
      else if (state.settings.showResults && r.mine) r.result = rows;
    }
    out.round = r;
    return out;
  }

  broadcast() {
    if (!this.state) return;
    for (const ws of this.ctx.getWebSockets()) {
      const a = ws.deserializeAttachment();
      if (a && a.clientId && this.state.members[a.clientId]) this.send(ws, this.view(a.clientId));
    }
  }

  async webSocketClose(ws) {
    ws.serializeAttachment({ clientId: null });
    await this.load();
    if (this.state && !this.state.ended) this.broadcast();
  }

  async webSocketError(ws) {
    await this.webSocketClose(ws);
  }

  async alarm() {
    const state = await this.load();
    if (!state) return;
    if (state.ended || Date.now() - state.lastActive >= ROOM_TTL_MS) {
      for (const s of this.ctx.getWebSockets()) {
        this.send(s, { t: "ended" });
        try { s.close(4000, "room_expired"); } catch { /* 무시 */ }
      }
      this.state = null;
      await this.ctx.storage.deleteAll();
    } else {
      await this.ctx.storage.setAlarm(state.lastActive + ROOM_TTL_MS);
    }
  }
}
