/* 아이스브레이커 함께하기(실시간 방) 화면.
   서버: rooms/ Worker. 질문 데이터: data.js. QR: qr.js. 화면 요소는 모두 DOM API로 만들어 사용자 입력을 그대로 HTML로 넣지 않습니다. */
(function () {
  "use strict";

  const API = String(window.ICEBREAKER_ROOMS_URL || "").replace(/\/+$/, "");
  const params = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);

  const MODE_INFO = {
    topic: { label: "대화 주제", categories, items: questions },
    balance: { label: "밸런스게임", categories: balanceCategories, items: balanceItems },
    who: { label: "이 중 누가?", categories: whoCategories, items: whoItems }
  };
  const SPICE_INFO = { mild: "순한맛", medium: "매운맛", hot: "핵매운맛" };
  const LEADER_NAME_KEY = "icebreaker:leaderName";
  const NICK_KEY = "icebreaker:nick";
  const credKey = (code) => `icebreaker:room:${code}`;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* 무시 */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* 무시 */ } }
  };

  let code = /^\d{4}$/.test(params.get("c") || "") ? params.get("c") : "";
  let creds = null;
  let ws = null;
  let pendingName = "";
  let retry = 0;
  let retryTimer = null;
  let pingTimer = null;
  let stopped = false;
  let everOpened = false;
  let last = null;
  let bodyKey = "";
  let whoSelection = null;
  let editingNote = false;
  let lastAnnouncedRound = 0;
  let revealAnnounced = 0;
  let qrRenderedFor = "";
  const bags = Object.create(null);

  /* ---------- 작은 DOM 도우미 ---------- */
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) node.append(c);
    return node;
  }
  const initial = (name) => Array.from(String(name || "?"))[0] || "?";
  function show(id) {
    for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
  }
  function announce(text) { $("announce").textContent = text; }

  function gone(title, text) {
    stopped = true;
    if (ws) try { ws.close(); } catch { /* 무시 */ }
    $("goneTitle").textContent = title;
    $("goneText").textContent = text;
    $("roomPill").hidden = true;
    $("connBanner").hidden = true;
    show("scrGone");
  }

  /* ---------- 공유 ---------- */
  function roomLink() {
    const url = new URL(location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("c", code);
    return url.href;
  }
  async function shareLink(button) {
    const url = roomLink();
    try {
      if (navigator.share) { await navigator.share({ title: "아이스브레이커 방에 들어와요", url }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    let ok = false;
    try { await navigator.clipboard.writeText(url); ok = true; } catch { ok = false; }
    const prev = button.textContent;
    button.textContent = ok ? "링크 복사됨 ✓" : url;
    announce(ok ? "방 링크를 복사했어요." : "링크를 복사하지 못했어요.");
    setTimeout(() => { button.textContent = prev; }, 2000);
  }
  document.querySelectorAll("[data-share-link]").forEach((b) => b.addEventListener("click", () => shareLink(b)));

  function renderQr() {
    if (qrRenderedFor === code) return;
    qrRenderedFor = code;
    for (const [box, px] of [[$("qrBoxLobby"), 168], [$("qrBoxSheet"), 260]]) {
      box.replaceChildren(window.IcebreakerQr.qrSvg(roomLink(), px));
      box.firstChild.setAttribute("role", "img");
      box.firstChild.setAttribute("aria-label", `방 ${code} 참여 QR 코드`);
    }
    $("lobbyCode").textContent = code;
    $("sheetCode").textContent = code;
  }

  /* ---------- 서버 ---------- */
  async function api(path, opts) {
    const res = await fetch(API + path, opts);
    let data = {};
    try { data = await res.json(); } catch { /* 빈 응답 */ }
    return { ok: res.ok, status: res.status, data };
  }

  function connect() {
    if (stopped) return;
    clearTimeout(retryTimer);
    const wsUrl = API.replace(/^http/, "ws") + `/rooms/${code}/ws`;
    let opened = false;
    try { ws = new WebSocket(wsUrl); } catch { scheduleRetry(); return; }
    ws.addEventListener("open", () => {
      opened = true;
      everOpened = true;
      retry = 0;
      $("connBanner").hidden = true;
      const hello = { t: "hello" };
      if (creds) { hello.clientId = creds.clientId; hello.key = creds.key; }
      if (pendingName) hello.name = pendingName;
      ws.send(JSON.stringify(hello));
      clearInterval(pingTimer);
      pingTimer = setInterval(() => { try { ws.send("ping"); } catch { /* 무시 */ } }, 25000);
    });
    ws.addEventListener("message", (e) => {
      if (e.data === "pong") return;
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      onMessage(msg);
    });
    ws.addEventListener("close", async (e) => {
      clearInterval(pingTimer);
      if (stopped) return;
      if (e.code === 4000 || e.code === 4004) return gone("방이 끝났어요", "리더가 방을 닫았거나 오래 쉬어서 정리됐어요.");
      if (e.code === 4001) return;
      if (e.code === 4002) { store.del(credKey(code)); return gone("방에서 나가게 됐어요", "리더가 이 방에서 내보냈어요."); }
      if (!opened) {
        // 연결 자체가 거절되면 방이 있는지 확인합니다.
        try {
          const info = await api(`/rooms/${code}`);
          if (info.status === 404) { store.del(credKey(code)); return gone("방을 찾을 수 없어요", "방 코드를 다시 확인하거나 리더에게 새 QR을 받아 주세요."); }
        } catch { /* 오프라인: 아래에서 재시도 */ }
      }
      scheduleRetry();
    });
  }

  function scheduleRetry() {
    if (stopped) return;
    if (everOpened) $("connBanner").hidden = false;
    retry = Math.min(retry + 1, 6);
    retryTimer = setTimeout(connect, Math.min(1000 * 2 ** (retry - 1), 15000));
  }

  function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify(data)); return true; }
    announce("연결이 끊겨서 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    return false;
  }

  function onMessage(msg) {
    if (msg.t === "welcome") {
      creds = { clientId: msg.clientId, key: msg.key };
      store.set(credKey(code), JSON.stringify(creds));
      if (pendingName && msg.role === "player") store.set(NICK_KEY, pendingName);
      pendingName = "";
      return;
    }
    if (msg.t === "need_name" || (msg.t === "error" && msg.code === "not_joined")) {
      creds = null;
      store.del(credKey(code));
      return showJoin();
    }
    if (msg.t === "error") {
      const text = { name_taken: "이미 방에 있는 이름이에요. 다른 이름을 골라 주세요.", room_full: "방이 꽉 찼어요." }[msg.code] || "문제가 생겼어요. 다시 시도해 주세요.";
      pendingName = "";
      $("joinError").textContent = text;
      $("joinError").hidden = false;
      $("joinBtn").disabled = false;
      return;
    }
    if (msg.t === "kicked") {
      store.del(credKey(code));
      return gone("방에서 나가게 됐어요", "리더가 이 방에서 내보냈어요.");
    }
    if (msg.t === "ended") return gone("방이 끝났어요", "리더가 방을 닫았어요. 함께해 주셔서 고마워요!");
    if (msg.t === "state") render(msg);
  }

  /* ---------- 리더: 질문 고르기 ---------- */
  /* 리더가 고른 카테고리(이 기기·이 방에서만 기억). "all"이면 전체에서 뽑습니다. */
  const CATEGORY_KEY = () => `icebreaker:roomCategory:${code}`;
  let leaderCategory = { mode: "", key: "all" };
  try { leaderCategory = JSON.parse(sessionStorage.getItem(CATEGORY_KEY()) || "null") || leaderCategory; } catch { /* 무시 */ }
  function setLeaderCategory(mode, key) {
    leaderCategory = { mode, key };
    try { sessionStorage.setItem(CATEGORY_KEY(), JSON.stringify(leaderCategory)); } catch { /* 무시 */ }
  }
  function currentCategory(mode) {
    const key = leaderCategory.mode === mode ? leaderCategory.key : "all";
    return key === "all" || MODE_INFO[mode].categories[key] ? key : "all";
  }
  const categoryLabel = (mode, key) => key === "all" ? "✨ 전체" : MODE_INFO[mode].categories[key].label;

  function drawQuestion(mode, spice, category) {
    const cat = category || "all";
    const key = `${mode}|${spice}|${cat}`;
    const pool = MODE_INFO[mode].items.filter((q) => q.spice === spice && (cat === "all" || q.category === cat));
    if (!pool.length) return null;
    let bag = bags[key];
    if (!bag || !bag.length) {
      bag = pool.map((_, i) => i);
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      bags[key] = bag;
    }
    const item = pool[bag.pop()];
    const info = MODE_INFO[mode].categories[item.category];
    const label = info ? info.label.replace(/^\S+\s/, "") : "";
    const question = mode === "balance" ? { a: item.a, b: item.b } : { text: item.text };
    return { question, label };
  }

  /* ---------- 공통 선택 버튼 ---------- */
  function fillToggleGroup(container, options, current, onPick) {
    container.replaceChildren(...options.map(([value, label]) => el("button", {
      type: "button", "aria-pressed": String(value === current), text: label,
      onclick: () => onPick(value)
    })));
  }

  /* ---------- 방 만들기 ---------- */
  let createMode = MODE_INFO[params.get("mode")] ? params.get("mode") : "topic";
  let createSpice = params.get("spice") === "medium" ? "medium" : "mild";
  function renderCreatePickers() {
    fillToggleGroup($("createMode"), Object.entries(MODE_INFO).map(([k, v]) => [k, v.label]), createMode, (v) => { createMode = v; renderCreatePickers(); });
    fillToggleGroup($("createSpice"), [["mild", "순한맛"], ["medium", "매운맛"]], createSpice, (v) => { createSpice = v; renderCreatePickers(); });
  }
  function showCreate() {
    $("leaderName").value = store.get(LEADER_NAME_KEY) || "";
    renderCreatePickers();
    show("scrCreate");
    if (!$("leaderName").value) $("leaderName").focus();
  }
  $("createForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("leaderName").value.trim();
    if (!name) return;
    $("createBtn").disabled = true;
    $("createError").hidden = true;
    try {
      const res = await api("/rooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, mode: createMode, spice: createSpice })
      });
      if (!res.ok) throw new Error(res.data.error || "create_failed");
      store.set(LEADER_NAME_KEY, name);
      code = res.data.code;
      creds = { clientId: res.data.clientId, key: res.data.key };
      store.set(credKey(code), JSON.stringify(creds));
      history.replaceState(null, "", roomLink());
      show("scrLoading");
      connect();
    } catch {
      $("createError").textContent = "방을 만들지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.";
      $("createError").hidden = false;
    } finally {
      $("createBtn").disabled = false;
    }
  });

  /* ---------- 참여하기 ---------- */
  const ADJ = ["웃는", "졸린", "배고픈", "수줍은", "용감한", "느긋한", "신난", "조용한", "엉뚱한", "다정한"];
  const ANIMAL = ["펭귄", "수달", "곰", "여우", "고양이", "다람쥐", "판다", "코알라", "햄스터", "고래"];
  function suggestNames() {
    const set = new Set();
    while (set.size < 3) set.add(`${ADJ[Math.floor(Math.random() * ADJ.length)]} ${ANIMAL[Math.floor(Math.random() * ANIMAL.length)]}`);
    $("nickSuggest").replaceChildren(
      ...[...set].map((n) => el("button", { type: "button", class: "chip", text: n, onclick: () => { $("nickName").value = n; updateNickCount(); } })),
      el("button", { type: "button", class: "chip", "aria-label": "다른 이름 추천", text: "↻", onclick: suggestNames })
    );
  }
  function updateNickCount() { $("nickCount").textContent = `${$("nickName").value.length}/10`; }
  $("nickName").addEventListener("input", updateNickCount);

  async function showJoin() {
    show("scrJoin");
    $("joinRoomLabel").textContent = `방 ${code}`;
    $("nickName").value = $("nickName").value || store.get(NICK_KEY) || "";
    updateNickCount();
    suggestNames();
    try {
      const info = await api(`/rooms/${code}`);
      if (info.status === 404) return gone("방을 찾을 수 없어요", "방 코드를 다시 확인하거나 리더에게 새 QR을 받아 주세요.");
      if (info.ok) $("joinRoomLabel").textContent = `방 ${code} · 리더 ${info.data.leaderName}`;
    } catch { /* 미리보기 실패는 무시 */ }
  }
  $("joinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("nickName").value.trim();
    if (!name) return;
    $("joinError").hidden = true;
    $("joinBtn").disabled = true;
    pendingName = name;
    stopped = false;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ t: "hello", name }));
    else connect();
    setTimeout(() => { $("joinBtn").disabled = false; }, 1500);
  });

  $("codeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("codeInput").value.trim();
    if (!/^\d{4}$/.test(v)) return;
    location.href = `${location.pathname}?c=${v}`;
  });

  /* ---------- 방 화면 그리기 ---------- */
  const MODE_EMOJI = { topic: "💬", balance: "⚖️", who: "🎯" };

  function memberCard(m, meId, opts) {
    const o = opts || {};
    const isMe = m.id === meId;
    const tagName = o.button ? "button" : "div";
    return el(tagName, {
      type: o.button ? "button" : undefined,
      class: `member${isMe && !o.button ? " is-me" : ""}${m.online ? "" : " off"}${o.answered ? " answered" : ""}`,
      "aria-pressed": o.button ? String(!!o.pressed) : undefined,
      disabled: o.disabled,
      onclick: o.onclick
    },
    el("span", { class: "av", "aria-hidden": "true", text: initial(m.name) }),
    el("span", { class: "member-name" }, `${m.name}${isMe && o.button ? " (나)" : ""}`,
      !o.button && (m.role === "leader" || isMe) ? el("small", { text: [m.role === "leader" ? "리더" : "", isMe ? "나" : ""].filter(Boolean).join(" · ") }) : null),
    o.count ? el("span", { class: "vote-badge", text: `${o.count}표` }) : null,
    !o.button ? el("span", { class: `online-dot${m.online ? " on" : ""}`, "aria-label": m.online ? "접속 중" : "연결 끊김" }) : null);
  }

  /* 응답 진행도: 막대 + (리더에게는) 누가 답했는지 */
  function progressBox(s, r, title, showPeople) {
    const pct = r.total ? Math.round((r.answered / r.total) * 100) : 0;
    const answered = new Set(r.answeredIds || []);
    return el("div", { class: "progress-box" },
      el("div", { class: "section-head" },
        el("strong", { text: title }),
        el("span", { class: "progress", text: `${r.answered} / ${r.total}명 응답` })),
      el("div", { class: "pbar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(r.total), "aria-valuenow": String(r.answered), "aria-label": "응답한 사람" },
        el("div", { class: "pfill", style: `width:${pct}%` })),
      showPeople ? el("div", { class: "who-answered" }, s.members.map((m) => el("span", {
        class: `mini${answered.has(m.id) ? " done" : ""}`,
        title: m.name,
        text: m.name
      }))) : null);
  }

  function render(s) {
    last = s;
    const isLeader = s.me.role === "leader";
    const r = s.round;
    show("scrRoom");
    const online = s.members.filter((m) => m.online).length;
    $("roomPill").hidden = false;
    $("roomPillText").textContent = `방 ${s.code} · ${online}명`;
    $("roomMeta").textContent = r ? `${MODE_EMOJI[r.mode]} ${MODE_INFO[r.mode].label} · ${SPICE_INFO[r.spice]}` : isLeader ? "대기실 · 리더" : "대기실";
    $("roomTitle").textContent = r ? `${r.n}번째 질문` : `${s.leaderName} 님의 방`;
    $("meChip").textContent = isLeader ? `리더 · ${s.me.name}` : s.me.name;
    $("qrBtn").hidden = !(isLeader && r);
    $("leaderBar").hidden = !isLeader;
    $("nextInfo").hidden = !isLeader;
    $("leaveBtn").hidden = isLeader;
    const needsReveal = !!(r && r.mode !== "topic" && !r.revealed);
    $("nextBtn").textContent = !r ? "시작하기" : needsReveal ? "결과 공개" : "다음 질문";
    $("nextBtn").dataset.action = needsReveal ? "reveal" : "next";

    $("lobbyLeader").hidden = !(isLeader && !r);
    $("lobbyPlayer").hidden = !(!isLeader && !r);
    $("roundBox").hidden = !r;

    if (isLeader) renderQr();
    if (!r) {
      if (isLeader) {
        $("lobbyCount").textContent = `들어온 사람 ${s.members.length}명`;
        $("lobbyMembers").replaceChildren(
          ...s.members.map((m) => memberCard(m, s.me.id)),
          ...(s.members.length < 2 ? [el("p", { class: "muted small hint-wide", text: "아직 아무도 없어요. QR을 보여 주거나 링크를 공유해 보세요." })] : [])
        );
      } else {
        $("lobbyGrid").replaceChildren(...s.members.map((m) => memberCard(m, s.me.id)));
      }
      bodyKey = "";
      syncSettings(s);
      return;
    }

    // 질문 카드
    const card = $("qCard");
    card.className = `card q-card mode-${r.mode}`;
    $("qLabel").textContent = r.label || MODE_INFO[r.mode].label;
    $("qNum").textContent = `${r.n}번째`;
    const isBalance = r.mode === "balance";
    $("qText").textContent = isBalance ? "둘 중 하나만 고른다면?" : r.question.text;
    // A/B 문구는 아래 선택 버튼에 크게 보이므로 카드에서는 숨깁니다.
    $("qAb").hidden = true;
    if (r.n !== lastAnnouncedRound) {
      lastAnnouncedRound = r.n;
      whoSelection = null;
      editingNote = false;
      bodyKey = "";
      card.classList.remove("enter");
      void card.offsetWidth;
      card.classList.add("enter");
      announce(isBalance ? `새 질문. A: ${r.question.a}. B: ${r.question.b}` : `새 질문. ${r.question.text}`);
    }

    if (r.revealed && revealAnnounced !== r.n) {
      revealAnnounced = r.n;
      announce("결과가 공개됐어요.");
    }

    // 내 답: 입력 중인 쪽지가 지워지지 않도록 바뀐 게 있을 때만 다시 그립니다.
    const mineKey = r.mine ? `${r.mine.type}:${r.mine.choice || r.mine.target || ""}:${r.mine.text || ""}` : "none";
    const resultKey = r.mode === "topic" ? "" : JSON.stringify(r.result || null);
    const key = `${r.n}|${r.mode}|${isLeader}|${mineKey}|${editingNote}|${whoSelection}|${resultKey}|${r.revealed}`;
    if (key !== bodyKey) {
      bodyKey = key;
      $("myBody").replaceChildren(...myBody(s, r, isLeader).filter(Boolean));
    }
    $("resultBody").replaceChildren(...(isLeader ? leaderResults(s, r) : playerResults(s, r)).filter(Boolean));
    syncSettings(s);
  }

  /* ---------- 내 답 (리더·참여자 공통) ---------- */
  function myBody(s, r, isLeader) {
    const mine = r.mine;
    const heading = isLeader ? el("div", { class: "section-head" }, el("strong", { text: "나도 답하기" }), el("span", { class: "muted small", text: "리더도 참여할 수 있어요 · 선택" })) : null;

    if (r.mode === "topic") {
      if (mine && !editingNote) {
        const edit = () => { editingNote = true; bodyKey = ""; render(last); };
        const editBtn = el("button", { type: "button", class: "edit-btn", "aria-label": mine.type === "note" ? "쪽지 고치기" : "쪽지 쓰기", title: mine.type === "note" ? "고치기" : "쓰기", onclick: edit },
          el("span", { "aria-hidden": "true", text: "✎" }), el("span", { text: mine.type === "note" ? "고치기" : "쓰기" }));
        return [heading, mine.type === "note"
          ? el("div", { class: "note mine-note" },
              el("div", { class: "note-head" }, el("b", { text: mine.anon ? "익명으로 보낸 쪽지" : "내가 보낸 쪽지" }), editBtn),
              el("span", { text: mine.text }))
          : el("div", { class: "status-card row" }, el("strong", { text: "이번 질문은 패스했어요" }), editBtn)];
      }
      const ta = el("textarea", { class: "text-input", id: "noteText", maxlength: "200", rows: isLeader ? "2" : "4", placeholder: "떠오르는 대로 짧게 써 보세요" });
      if (mine && mine.type === "note") ta.value = mine.text;
      const anon = el("input", { type: "checkbox", id: "noteAnon" });
      if (mine && mine.anon) anon.checked = true;
      const count = el("span", { class: "muted small", text: `${ta.value.length}/200` });
      ta.addEventListener("input", () => { count.textContent = `${ta.value.length}/200`; });
      const submit = () => {
        const text = ta.value.trim();
        if (!text) { ta.focus(); return; }
        if (send({ t: "note", text, anon: anon.checked, round: r.n })) { editingNote = false; announce("쪽지를 보냈어요."); }
      };
      return [
        heading,
        isLeader ? null : el("label", { class: "field-label", for: "noteText", text: "내 쪽지" }),
        isLeader ? el("label", { class: "sr-only", for: "noteText", text: "내 쪽지" }) : null,
        ta,
        el("div", { class: "hint-row" }, el("label", { class: "check-row", for: "noteAnon" }, anon, "익명으로 보내기"), count),
        el("div", { class: `two-btn${isLeader ? "" : " action-bar"}` },
          el("button", { type: "button", class: "secondary-btn", text: "패스", onclick: () => { if (send({ t: "pass", round: r.n })) editingNote = false; } }),
          el("button", { type: "button", class: isLeader ? "primary small-primary" : "primary", text: "쪽지 보내기", onclick: submit }))
      ];
    }

    if (r.mode === "balance") {
      const choice = mine && mine.type === "vote" ? mine.choice : null;
      // 집계가 보이면 버튼 안에 비율을 채워 보여줍니다.
      const counts = r.result ? { a: r.result.a.length, b: r.result.b.length } : null;
      const locked = r.revealed;
      const total = counts ? counts.a + counts.b : 0;
      const btn = (k, text) => {
        const pct = counts && total ? Math.round((counts[k] / total) * 100) : null;
        return el("button", {
          type: "button", class: `choice ${k}${pct !== null ? " has-result" : ""}`, "aria-pressed": String(choice === k),
          style: pct !== null ? `--pct:${pct}%` : undefined, disabled: locked,
          onclick: () => send({ t: "vote", choice: k, round: r.n })
        },
        el("span", { class: "choice-top" }, el("b", { text: k.toUpperCase() }), choice === k ? el("span", { class: "mine", text: "내 선택" }) : null),
        el("span", { class: "ct", text }),
        pct !== null ? el("span", { class: "pct", text: `${pct}% · ${counts[k]}명` }) : null);
      };
      return [heading, el("div", { class: isLeader ? "choices compact" : "choices" }, btn("a", r.question.a), btn("b", r.question.b)),
        locked ? null : el("button", { type: "button", class: "link-btn", text: mine && mine.type === "pass" ? "패스했어요 · 다시 고르려면 위를 눌러요" : "이번 질문은 패스", onclick: () => send({ t: "pass", round: r.n }) })];
    }

    // 이 중 누가?
    const counts = new Map();
    if (Array.isArray(r.result)) for (const row of r.result) counts.set(row.id, row.count);
    const locked = r.revealed;
    const picked = locked ? (mine && mine.type === "pick" ? mine.target : null) : whoSelection || (mine && mine.type === "pick" ? mine.target : null);
    const sent = mine && mine.type === "pick" && mine.target === picked;
    const pickedName = (s.members.find((m) => m.id === picked) || {}).name;
    return [
      heading || el("div", { class: "section-head" }, el("strong", { text: "한 명을 골라 주세요" }), el("span", { class: "muted small", text: "나도 고를 수 있어요" })),
      el("div", { class: "member-grid" }, s.members.map((m) => memberCard(m, s.me.id, {
        button: true, pressed: m.id === picked, count: counts.get(m.id), disabled: locked,
        onclick: () => { whoSelection = m.id; render(last); }
      }))),
      locked ? null : el("div", { class: `two-btn${isLeader ? "" : " action-bar"}` },
        el("button", { type: "button", class: "secondary-btn", text: mine && mine.type === "pass" ? "패스함" : "패스", onclick: () => { whoSelection = null; send({ t: "pass", round: r.n }); } }),
        el("button", {
          type: "button", class: isLeader ? "primary small-primary" : "primary", disabled: !picked || sent,
          text: sent ? `${pickedName} 지목 완료 ✓` : picked ? `${pickedName} 지목하기` : "지목하기",
          onclick: () => { if (picked) send({ t: "pick", target: picked, round: r.n }); }
        }))
    ];
  }

  /* ---------- 결과 ---------- */
  /* 밸런스게임·이 중 누가?: 리더가 "결과 공개"를 누른 뒤에만 모두에게 같은 결과가 보입니다. */
  function revealedResults(s, r) {
    if (r.mode === "balance") {
      const a = r.result.a || [];
      const b = r.result.b || [];
      const names = (list) => list.length ? list.map((n) => el("span", { class: "name-pill", text: n })) : el("span", { class: "muted small", text: "아무도 없어요" });
      return [balanceBar(a.length, b.length), el("div", { class: "lists" },
        el("div", { class: "list-card a" }, el("strong", { text: `A를 고른 ${a.length}명` }), el("div", { class: "chip-row" }, names(a))),
        el("div", { class: "list-card b" }, el("strong", { text: `B를 고른 ${b.length}명` }), el("div", { class: "chip-row" }, names(b))))];
    }
    return whoResult(r.result, s);
  }

  function hiddenNote(isLeader) {
    return el("div", { class: "reveal-wait" },
      el("span", { class: "lock", "aria-hidden": "true", text: "🔒" }),
      el("span", { text: isLeader ? "결과는 아직 비공개예요. 다 모이면 아래 '결과 공개'를 눌러 주세요." : "리더가 결과를 공개하면 모두에게 한꺼번에 보여요." }));
  }

  function leaderResults(s, r) {
    if (r.mode === "topic") return [progressBox(s, r, "도착한 쪽지", true), ...noteList(r)];
    if (!r.revealed) return [progressBox(s, r, "응답 현황", true), hiddenNote(true)];
    return [progressBox(s, r, r.mode === "balance" ? "결과" : "지목 결과", true), ...revealedResults(s, r)];
  }

  function playerResults(s, r) {
    if (r.mode === "topic") {
      const out = [progressBox(s, r, "참여 현황", false)];
      if (r.notes) out.push(el("strong", { class: "list-title", text: "모두의 쪽지" }), ...noteList(r));
      else if (!r.mine) out.push(el("p", { class: "muted small", text: "쪽지를 보내거나 패스하면 다른 사람들의 쪽지를 볼 수 있어요." }));
      else out.push(el("p", { class: "muted small", text: "리더가 쪽지를 리더 화면에만 보이게 해 두었어요." }));
      return out;
    }
    if (!r.revealed) {
      return [progressBox(s, r, "응답 현황", false), hiddenNote(false),
        r.mine ? el("p", { class: "muted small", text: "결과가 공개되기 전까지는 다시 바꿀 수 있어요." }) : null];
    }
    return [progressBox(s, r, r.mode === "balance" ? "결과" : "지목 결과", false), ...revealedResults(s, r)];
  }

  function noteList(r) {
    const notes = r.notes || [];
    return [
      ...(notes.length
        ? notes.map((n) => el("div", { class: `note${n.mine ? " is-mine" : ""}` },
            el("b", null, n.name, n.mine ? el("span", { class: "me-tag", text: "나" }) : null),
            el("span", { text: n.text })))
        : [el("div", { class: "empty", text: "아직 도착한 쪽지가 없어요." })]),
      r.passes ? el("p", { class: "muted small", text: `${r.passes}명은 이번 질문을 패스했어요.` }) : null
    ];
  }

  function balanceBar(a, b) {
    const total = a + b;
    if (!total) return el("div", { class: "empty", text: "아직 아무도 고르지 않았어요." });
    const pa = Math.round((a / total) * 100);
    const pb = 100 - pa;
    return el("div", { class: "bar", role: "img", "aria-label": `A ${pa}퍼센트, B ${pb}퍼센트` },
      a ? el("div", { class: "ba", style: `width:${pa}%`, text: pa >= 18 ? `A ${pa}%` : "A" }) : null,
      b ? el("div", { class: "bb", style: `width:${pb}%`, text: pb >= 18 ? `${pb}% B` : "B" }) : null);
  }

  function whoResult(rows, s) {
    if (!rows.length) return [el("div", { class: "empty", text: "아직 아무도 지목하지 않았어요." })];
    const max = rows[0].count;
    const top = rows.filter((x) => x.count === max);
    const rest = rows.filter((x) => x.count !== max);
    const out = [el("div", { class: "top1" },
      el("span", { class: "av", "aria-hidden": "true", text: initial(top[0].name) }),
      el("span", { class: "tn" }, el("small", { text: top.length > 1 ? "공동 1위" : "1위" }), el("b", { text: top.map((x) => x.name).join(", ") })),
      el("span", { class: "tc", text: `${max}표` }))];
    if (top.some((x) => x.voters)) {
      out.push(el("p", { class: "muted small", text: top.map((x) => `${x.name} ← ${x.voters.join(", ")}`).join(" / ") }));
    }
    if (rest.length) {
      out.push(el("div", { class: "rank" }, rest.map((x) => el("div", { class: "rank-row" },
        el("div", { class: "rl" }, el("span", { text: x.name }), el("span", { text: `${x.count}표` })),
        el("div", { class: "track" }, el("div", { class: "fill", style: `width:${Math.round((x.count / max) * 100)}%` })),
        x.voters ? el("span", { class: "voters", text: `← ${x.voters.join(", ")}` }) : null))));
    }
    const zero = s.members.filter((m) => !rows.some((x) => x.id === m.id)).map((m) => m.name);
    if (zero.length) out.push(el("p", { class: "muted small", text: `0표: ${zero.join(" · ")}` }));
    return out;
  }

  /* ---------- 리더 조작 ---------- */
  let kickArmed = null;
  function renderKickList(s) {
    const players = s.members.filter((m) => m.role !== "leader");
    $("kickList").replaceChildren(...(players.length ? players.map((m) => el("div", { class: "kick-row" },
      el("span", { class: `online-dot${m.online ? " on" : ""}`, "aria-hidden": "true" }),
      el("span", { class: "kick-name", text: m.name }),
      el("button", {
        type: "button", class: `kick-btn${kickArmed === m.id ? " armed" : ""}`,
        "aria-label": `${m.name} 내보내기`,
        text: kickArmed === m.id ? "한 번 더 누르면 내보내요" : "내보내기",
        onclick: () => {
          if (kickArmed === m.id) { kickArmed = null; send({ t: "kick", target: m.id }); announce(`${m.name} 님을 내보냈어요.`); return; }
          kickArmed = m.id;
          renderKickList(last);
          setTimeout(() => { if (kickArmed === m.id) { kickArmed = null; renderKickList(last); } }, 3000);
        }
      }))) : [el("p", { class: "muted small", text: "아직 들어온 참여자가 없어요." })]));
  }

  function syncSettings(s) {
    if (s.me.role !== "leader") return;
    renderKickList(s);
    fillToggleGroup($("setMode"), Object.entries(MODE_INFO).map(([k, v]) => [k, v.label]), s.mode, (v) => send({ t: "settings", mode: v }));
    fillToggleGroup($("setSpice"), [["mild", "순한맛"], ["medium", "매운맛"]], s.spice, (v) => send({ t: "settings", spice: v }));
    const cat = currentCategory(s.mode);
    fillToggleGroup($("setCategory"),
      [["all", "✨ 전체"], ...Object.entries(MODE_INFO[s.mode].categories).map(([k, v]) => [k, v.label])],
      cat, (v) => { setLeaderCategory(s.mode, v); syncSettings(last); });
    $("nextInfo").textContent = `다음 질문: ${MODE_EMOJI[s.mode]} ${MODE_INFO[s.mode].label} · ${SPICE_INFO[s.spice] || "순한맛"} · ${categoryLabel(s.mode, cat)}`;
    $("setShowResults").checked = !!s.settings.showResults;
    $("setShowVoters").checked = !!s.settings.showVoters;
  }
  $("setShowResults").addEventListener("change", (e) => send({ t: "settings", showResults: e.target.checked }));
  $("setShowVoters").addEventListener("change", (e) => send({ t: "settings", showVoters: e.target.checked }));
  $("settingsBtn").addEventListener("click", () => $("settingsSheet").showModal());
  $("qrBtn").addEventListener("click", () => $("qrSheet").showModal());
  for (const d of [$("settingsSheet"), $("qrSheet")]) {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  }
  $("nextBtn").addEventListener("click", () => {
    if (!last) return;
    if ($("nextBtn").dataset.action === "reveal" && last.round) {
      send({ t: "reveal", round: last.round.n });
      return;
    }
    const spice = last.spice === "medium" ? "medium" : last.spice === "hot" ? "hot" : "mild";
    const picked = drawQuestion(last.mode, spice, currentCategory(last.mode));
    if (!picked) return announce("이 모드와 맛에는 질문이 없어요.");
    send({ t: "round", mode: last.mode, spice, ...picked });
  });
  let endArmed = false;
  $("endBtn").addEventListener("click", () => {
    if (!endArmed) {
      endArmed = true;
      $("endBtn").textContent = "한 번 더 누르면 방이 끝나요";
      setTimeout(() => { endArmed = false; $("endBtn").textContent = "방 끝내기"; }, 3000);
      return;
    }
    send({ t: "end" });
    store.del(credKey(code));
    $("settingsSheet").close();
  });
  $("leaveBtn").addEventListener("click", () => {
    send({ t: "leave" });
    store.del(credKey(code));
    stopped = true;
    location.href = "./";
  });

  /* ---------- 시작 ---------- */
  function start() {
    if (!API) return gone("함께하기를 준비하고 있어요", "곧 열릴 예정이에요. 지금은 혼자 질문 뽑기를 이용해 주세요.");
    if (params.get("new") === "1") return showCreate();
    if (!code) return gone("방 코드를 입력해 주세요", "리더 화면의 QR을 찍거나 4자리 방 코드를 입력하면 들어갈 수 있어요.");
    try { creds = JSON.parse(store.get(credKey(code)) || "null"); } catch { creds = null; }
    if (creds) { show("scrLoading"); connect(); }
    else showJoin();
  }
  start();
})();
