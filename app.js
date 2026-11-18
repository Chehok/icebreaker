/* 앱 설치 버튼: 지원 브라우저에서만 표시하고, 설치된 앱(standalone) 안에서는 링크 공유 버튼으로 바뀝니다. */
const installBtn = document.getElementById("installBtn");
const installGuide = document.getElementById("installGuide");
const standaloneMode = window.matchMedia("(display-mode: standalone)");
const ua = navigator.userAgent;
const isIOS = /iPhone|iPad|iPod/.test(ua) ||
  (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
const isIOSChrome = isIOS && /CriOS/.test(ua);
const isIOSOtherBrowser = isIOS && /FxiOS|EdgiOS/.test(ua);
const isIOSSafari = isIOS && /Version\/[\d.]+.*Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
const isIOSShareInstall = isIOSSafari || isIOSChrome || isIOSOtherBrowser;
const installGuideText = document.getElementById("installGuideText");
if (isIOSChrome) installGuideText.textContent = "크롬 오른쪽 위(또는 주소창)의 공유 버튼 → 홈 화면에 추가를 선택해 주세요.";
else if (isIOSOtherBrowser) installGuideText.textContent = "브라우저의 공유 버튼 → 홈 화면에 추가를 선택해 주세요.";
let installPrompt = null;
let appInstalled = false;

let shareResetTimer = null;

function isStandaloneApp() {
  return standaloneMode.matches || navigator.standalone === true;
}

function updateInstallButton() {
  if (isStandaloneApp()) {
    installPrompt = null;
    if (installGuide.open) installGuide.close();
    installBtn.removeAttribute("aria-haspopup");
    if (!shareResetTimer) installBtn.textContent = "링크 공유";
    installBtn.hidden = false;
    return;
  }
  installBtn.textContent = "앱 설치";
  if (isIOSShareInstall) installBtn.setAttribute("aria-haspopup", "dialog");
  const installed = appInstalled;
  installBtn.hidden = installed || (!isIOSShareInstall && !installPrompt);
  if (installed) {
    installPrompt = null;
    if (installGuide.open) installGuide.close();
  }
}

function shareUrl() {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  return url.href;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* 아래 방식으로 다시 시도합니다. */ }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  field.remove();
  return ok;
}

async function shareLink() {
  const url = shareUrl();
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: document.title, url });
      return;
    } catch (error) {
      if (error.name === "AbortError" || error.name === "InvalidStateError") return;
    }
  }
  const ok = await copyText(url);
  installBtn.textContent = ok ? "링크 복사됨 ✓" : "복사 실패 😢";
  const live = document.getElementById("announcement");
  if (live) live.textContent = ok ? "링크를 클립보드에 복사했어요." : "링크를 복사하지 못했어요.";
  clearTimeout(shareResetTimer);
  shareResetTimer = setTimeout(() => {
    shareResetTimer = null;
    installBtn.textContent = "링크 공유";
  }, 2000);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  updateInstallButton();
});
installBtn.addEventListener("click", async () => {
  if (installBtn.hidden) return;
  if (isStandaloneApp()) {
    await shareLink();
    return;
  }
  if (isIOSShareInstall) {
    installGuide.showModal();
    return;
  }
  const promptEvent = installPrompt;
  if (!promptEvent) return;
  installPrompt = null;
  updateInstallButton();
  try {
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") appInstalled = true;
  } catch {
    /* 취소·브라우저 제한 시 다음 설치 가능 이벤트를 기다립니다. */
  }
  updateInstallButton();
});
const isLocalFile = location.protocol === "file:";
if (isLocalFile) {
  // 파일로 직접 열 때는 호스팅의 확장자 없는 주소 대신 실제 HTML 파일을 엽니다.
  document.querySelectorAll('a[href^="./"]').forEach((link) => {
    if (link.pathname.endsWith("/")) link.pathname += "index.html";
    else if (!/\.[^/]+$/.test(link.pathname)) link.pathname += ".html";
  });
}

/* ===== 함께하기(실시간 방) 입구: 서버 주소가 설정된 경우에만 보입니다 ===== */
const togetherBtn = document.getElementById("togetherBtn");
const togetherSheet = document.getElementById("togetherSheet");
if (togetherBtn && togetherSheet && window.ICEBREAKER_ROOMS_URL && typeof togetherSheet.showModal === "function") {
  togetherBtn.hidden = false;
  togetherBtn.addEventListener("click", () => {
    const create = document.getElementById("togetherCreate");
    const mode = document.body.dataset.mode || "topic";
    const spice = typeof currentSpice === "string" && currentSpice === "medium" ? "medium" : "mild";
    create.href = `./room.html?new=1&mode=${encodeURIComponent(mode)}&spice=${spice}`;
    togetherSheet.showModal();
  });
  togetherSheet.addEventListener("click", (event) => {
    if (event.target === togetherSheet) togetherSheet.close();
  });
}

/* ===== 사용법 · 질문 모음 팝업 ===== */
const guideBtn = document.getElementById("guideBtn");
const guideDialog = document.getElementById("guideDialog");
if (guideBtn && guideDialog && typeof guideDialog.showModal === "function") {
  guideBtn.addEventListener("click", () => {
    guideDialog.showModal();
    guideDialog.scrollTop = 0;
  });
  // 바깥(배경)을 누르면 닫기
  guideDialog.addEventListener("click", (event) => {
    if (event.target === guideDialog) guideDialog.close();
  });
} else if (guideBtn) {
  // <dialog>를 지원하지 않는 오래된 브라우저에서는 질문 모음 페이지로 이동
  guideBtn.addEventListener("click", () => { location.href = isLocalFile ? "./questions/index.html" : "./questions/"; });
}

window.addEventListener("appinstalled", () => {
  appInstalled = true;
  updateInstallButton();
});
if (standaloneMode.addEventListener) standaloneMode.addEventListener("change", updateInstallButton);
else standaloneMode.addListener(updateInstallButton);
updateInstallButton();

/* ===== 공통 설정 ===== */
const spices = {
  mild: { label: "😋 순한맛" },
  medium: { label: "🌶️ 매운맛" },
  hot: { label: "🔥 핵매운맛" }
};

const modes = {
  topic: {
    categories,
    items: questions,
    placeholder: "아래 버튼을 눌러 질문을 뽑아보세요 👇",
    btnLabel: "질문 뽑기 🎯",
    unit: "질문"
  },
  balance: {
    categories: balanceCategories,
    items: balanceItems,
    placeholder: "아래 버튼을 눌러 밸런스게임을 뽑아보세요 👇",
    btnLabel: "밸런스게임 뽑기 ⚖️",
    unit: "밸런스게임"
  },
  who: {
    categories: whoCategories,
    items: whoItems,
    placeholder: "아래 버튼을 눌러 '이 중 누가?' 질문을 뽑아보세요 👇",
    btnLabel: "누구일까 뽑기 🎯",
    unit: "질문"
  }
};

const SPICE_KEY = "icebreaker:spice";
const BAGS_KEY = "icebreaker:bags";
// 풀별 남은 인덱스(b), 마지막 인덱스(l), 전체 크기(n)만 저장합니다.
const drawBags = Object.create(null);

const announcementEl = document.getElementById("announcement");
const questionEl = document.getElementById("question");
const versusEl = document.getElementById("versus");
const badgeEl = document.getElementById("badge");
const btn = document.getElementById("pickBtn");
const counterEl = document.getElementById("counter");
const categoriesEl = document.getElementById("categories");
const spicesEl = document.getElementById("spices");
const whoHintEl = document.getElementById("whoHint");
const titleEl = document.querySelector("h1");

const currentMode = document.body.dataset.mode;
const mode = modes[currentMode];
let currentSpice = "mild";
let hotUnlocked = false;
let titleTaps = 0;
let lastTitleTap = 0;
let currentCategory = "all";

try {
  let savedSpice = localStorage.getItem(SPICE_KEY);
  if (savedSpice === "spicy" || savedSpice === "hot" || savedSpice === "매운맛") {
    /* 예전 맛과 잠긴 핵매운맛은 매운맛으로 이전 */
    savedSpice = "medium";
    currentSpice = savedSpice;
    localStorage.setItem(SPICE_KEY, savedSpice);
  }
  if (Object.hasOwn(spices, savedSpice)) currentSpice = savedSpice;
} catch (e) {
  /* localStorage 사용 불가 시 무시 */
}

try {
  const saved = JSON.parse(localStorage.getItem(BAGS_KEY));
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    Object.entries(saved).forEach(([key, state]) => {
      const [mode, spice, category, extra] = key.split(":");
      if (extra !== undefined || !Object.hasOwn(modes, mode) || !Object.hasOwn(spices, spice) ||
          (category !== "all" && !Object.hasOwn(modes[mode].categories, category))) return;
      const size = getPool(mode, spice, category).length;
      const validIndex = (index) => Number.isInteger(index) && index >= 0 && index < size;
      if (state && state.n === size && Array.isArray(state.b) && state.b.length <= size &&
          state.b.every(validIndex) && new Set(state.b).size === state.b.length &&
          (state.l === null ? state.b.length === 0 || state.b.length === size :
            validIndex(state.l) && !state.b.includes(state.l))) {
        drawBags[key] = { b: state.b, l: state.l, n: size };
      }
    });
  }
} catch (e) {
  /* 저장소 사용 불가·잘못된 JSON은 새 뽑기로 시작 */
}

/* 맛 버튼 */
Object.entries(spices).forEach(([key, { label }]) => {
  const btnEl = document.createElement("button");
  btnEl.className = "spice-btn" + (key === currentSpice ? " active" : "");
  btnEl.dataset.spice = key;
  btnEl.hidden = key === "hot";
  btnEl.type = "button";
  btnEl.textContent = label;
  btnEl.setAttribute("aria-pressed", key === currentSpice ? "true" : "false");
  btnEl.addEventListener("click", () => selectSpice(key));
  spicesEl.appendChild(btnEl);
});

/* 제목을 1.5초 간격 이내로 다섯 번 누르면 핵매운맛 잠금 전환 */
titleEl.addEventListener("click", () => {
  const now = performance.now();
  titleTaps = now - lastTitleTap <= 1500 ? titleTaps + 1 : 1;
  lastTitleTap = now;
  if (titleTaps < 5) return;
  titleTaps = 0;
  hotUnlocked = !hotUnlocked;
  spicesEl.querySelector('[data-spice="hot"]').hidden = !hotUnlocked;
  if (!hotUnlocked && currentSpice === "hot") selectSpice("medium");
  titleEl.classList.remove("shake");
  void titleEl.offsetWidth;
  titleEl.classList.add("shake");
});
titleEl.addEventListener("animationend", () => titleEl.classList.remove("shake"));

function renderChips() {
  categoriesEl.innerHTML = "";
  const defs = [{ key: "all", label: "✨ 전체" }].concat(
    Object.entries(mode.categories).map(([key, { label }]) => ({ key, label }))
  );
  defs.forEach(({ key, label }) => {
    const chip = document.createElement("button");
    chip.className = "chip" + (key === currentCategory ? " active" : "");
    chip.type = "button";
    chip.textContent = label;
    chip.setAttribute("aria-pressed", key === currentCategory ? "true" : "false");
    chip.dataset.key = key;
    chip.addEventListener("click", () => selectCategory(key));
    categoriesEl.appendChild(chip);
  });
}

/* 카테고리 칩은 화면 폭과 관계없이 바텀시트에 둡니다. <dialog> 미지원 브라우저에서는 제자리에 펼쳐 둡니다. */
const categorySlotEl = document.getElementById("categorySlot");
const categoryTriggerEl = document.getElementById("categoryTrigger");
const categoryTriggerValueEl = document.getElementById("categoryTriggerValue");
const categorySheetEl = document.getElementById("categorySheet");
const categorySheetBodyEl = document.getElementById("categorySheetBody");
const sheetSupported = !!(categorySheetEl && typeof categorySheetEl.showModal === "function");

function categoryLabel(key) {
  return key === "all" ? "✨ 전체" : mode.categories[key].label;
}

function updateCategoryTrigger() {
  if (categoryTriggerValueEl) categoryTriggerValueEl.textContent = categoryLabel(currentCategory);
}

function placeCategories() {
  if (!sheetSupported || !categorySlotEl || !categoryTriggerEl) return;
  categorySheetBodyEl.appendChild(categoriesEl);
  categoryTriggerEl.hidden = false;
}

function closeCategorySheet() {
  if (!categorySheetEl.open) return;
  categorySheetEl.classList.add("closing");
  const done = () => {
    categorySheetEl.classList.remove("closing");
    if (categorySheetEl.open) categorySheetEl.close();
  };
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) done();
  else setTimeout(done, 180);
}

if (sheetSupported && categoryTriggerEl) {
  categoryTriggerEl.addEventListener("click", () => {
    categorySheetEl.showModal();
    const active = categoriesEl.querySelector(".chip.active");
    if (active) active.focus();
  });
  categorySheetEl.addEventListener("click", (event) => {
    if (event.target === categorySheetEl) closeCategorySheet();
  });
  categorySheetEl.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeCategorySheet();
  });
  categorySheetEl.addEventListener("close", () => categoryTriggerEl.focus());
}

function getPool(mode = currentMode, spice = currentSpice, category = currentCategory) {
  return modes[mode].items.filter(
    (q) =>
      q.spice === spice &&
      (category === "all" || q.category === category)
  );
}

function getBag(size) {
  const key = `${currentMode}:${currentSpice}:${currentCategory}`;
  if (!drawBags[key] || drawBags[key].n !== size) {
    drawBags[key] = { b: [], l: null, n: size };
  }
  return drawBags[key];
}

function updateCounter() {
  const count = getPool().length;
  const state = getBag(count);
  const drawn = state.l === null ? 0 : count - state.b.length;
  const spiceName = spices[currentSpice].label;
  const catName = currentCategory === "all" ? "전체" : mode.categories[currentCategory].label;
  counterEl.textContent = `${spiceName} · ${catName} · ${mode.unit} ${count}개 · ${drawn}/${count}`;
}

function showPlaceholder() {
  badgeEl.classList.remove("show");
  badgeEl.textContent = "";
  versusEl.classList.remove("show", "pop", "has-choice");
  versusEl.innerHTML = "";
  questionEl.style.display = "";
  questionEl.classList.remove("pop");
  questionEl.classList.add("placeholder");
  questionEl.textContent = mode.placeholder;
  announcementEl.textContent = "";
  whoHintEl.classList.remove("show");
}

function selectSpice(key) {
  if (!Object.hasOwn(spices, key) || (key === "hot" && !hotUnlocked)) return;
  currentSpice = key;
  try {
    localStorage.setItem(SPICE_KEY, key);
  } catch (e) {
    /* 무시 */
  }
  document.querySelectorAll(".spice-btn").forEach((b) => {
    const on = b.dataset.spice === key;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
  document.body.classList.toggle("spicy-mode", key === "medium");
  document.body.classList.toggle("hot-mode", key === "hot");
  showPlaceholder();
  updateCounter();
}

function selectCategory(key) {
  if (key !== "all" && !Object.hasOwn(mode.categories, key)) return;
  currentCategory = key;
  document.querySelectorAll(".chip").forEach((c) => {
    const on = c.dataset.key === key;
    c.classList.toggle("active", on);
    c.setAttribute("aria-pressed", String(on));
  });
  updateCategoryTrigger();
  if (sheetSupported && categorySheetEl.open) closeCategorySheet();
  showPlaceholder();
  updateCounter();
}

function showTopic(item) {
  versusEl.classList.remove("show", "pop", "has-choice");
  versusEl.innerHTML = "";
  questionEl.style.display = "";
  questionEl.classList.remove("placeholder", "pop");
  void questionEl.offsetWidth;
  questionEl.textContent = item.text;
  questionEl.classList.add("pop");
  if (currentMode === "who") whoHintEl.classList.add("show");
}

function chooseOption(btnEl) {
  versusEl.querySelectorAll(".option").forEach((o) => {
    const on = o === btnEl;
    o.classList.toggle("chosen", on);
    o.setAttribute("aria-pressed", on ? "true" : "false");
  });
  versusEl.classList.add("has-choice");
}

function showBalance(item) {
  questionEl.style.display = "none";
  questionEl.classList.remove("pop");
  versusEl.innerHTML = "";
  versusEl.classList.remove("show", "pop", "has-choice");

  [["A", item.a], ["B", item.b]].forEach(([tag, text], i) => {
    if (i === 1) {
      const vs = document.createElement("div");
      vs.className = "vs";
      vs.setAttribute("aria-hidden", "true");
      vs.textContent = "VS";
      versusEl.appendChild(vs);
    }
    const opt = document.createElement("button");
    opt.type = "button";
    opt.className = "option";
    opt.setAttribute("aria-pressed", "false");
    const tagEl = document.createElement("span");
    tagEl.className = "opt-tag";
    tagEl.textContent = tag;
    const textEl = document.createElement("span");
    textEl.textContent = text;
    opt.appendChild(tagEl);
    opt.appendChild(textEl);
    opt.addEventListener("click", () => chooseOption(opt));
    versusEl.appendChild(opt);
  });

  void versusEl.offsetWidth;
  versusEl.classList.add("show", "pop");
}

function pickQuestion() {
  const pool = getPool();
  if (!pool.length) {
    showPlaceholder();
    questionEl.textContent = "이 조건에 맞는 질문이 없어요. 다른 맛이나 카테고리를 골라주세요.";
    announcementEl.textContent = questionEl.textContent;
    return;
  }
  const state = getBag(pool.length);
  if (!state.b.length) {
    state.b = pool.map((_, index) => index);
    for (let i = state.b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.b[i], state.b[j]] = [state.b[j], state.b[i]];
    }
    const end = state.b.length - 1;
    if (end > 0 && state.b[end] === state.l) {
      const j = Math.floor(Math.random() * end);
      [state.b[end], state.b[j]] = [state.b[j], state.b[end]];
    }
  }
  state.l = state.b.pop();
  const item = pool[state.l];
  try {
    localStorage.setItem(BAGS_KEY, JSON.stringify(drawBags));
  } catch (e) {
    /* 저장 실패 시 메모리에서 계속 뽑기 */
  }
  updateCounter();

  badgeEl.textContent = `${spices[item.spice].label} · ${mode.categories[item.category].label}`;
  badgeEl.classList.add("show");

  if (currentMode === "balance") showBalance(item);
  else showTopic(item);
  announcementEl.textContent = `${badgeEl.textContent}. ${currentMode === "balance" ? `A: ${item.a}. B: ${item.b}` : item.text}`;
}

btn.addEventListener("click", pickQuestion);
btn.textContent = mode.btnLabel;
renderChips();
placeCategories();
updateCategoryTrigger();
selectSpice(currentSpice);

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {
    /* 오프라인 첫 방문·등록 제한 환경에서도 질문 뽑기는 계속 동작합니다. */
  });
}
