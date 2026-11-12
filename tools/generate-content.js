#!/usr/bin/env node
// Icebreaker 정적 콘텐츠 페이지 생성 스크립트 (의존성 없음, Node 18+)
//
//   node tools/generate-content.js
//
// app.js의 질문 데이터와 tools/content/*.js의 원고로 아래 파일을 다시 만듭니다.
//   - questions/index.html, questions/<모드>-<카테고리>.html  (질문 모음, 순한맛·매운맛만)
//   - guide/index.html, guide/<slug>.html                     (가이드 글)
//   - about.html, contact.html, 404.html, sitemap.xml
//   - index.html / balance.html / who.html 의 <!-- content:start --> ~ <!-- content:end --> 구간
// 생성된 파일은 그대로 커밋합니다. 배포 시 빌드 단계는 없습니다.
// 질문(app.js)이나 원고를 바꾸면 이 스크립트를 다시 실행해 주세요.

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://icebreaker-de4.pages.dev";
const AD_CLIENT = "ca-pub-9717375299017347";
const TODAY = new Date().toISOString().slice(0, 10);

const { modes: MODE_INFO, categories: CAT_INFO } = require("./content/categories.js");
const GUIDES = require("./content/guides.js");

/* ---------- 질문 데이터 읽기 ---------- */
function loadData() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const start = src.indexOf("const categories = {");
  const end = src.indexOf("const spices = {");
  if (start < 0 || end < 0) throw new Error("app.js에서 질문 데이터 구간을 찾지 못했습니다.");
  const code = src.slice(start, end) +
    "\n;({ categories, questions, balanceCategories, balanceItems, whoCategories, whoItems })";
  const d = vm.runInNewContext(code, {});
  return {
    topic: { categories: d.categories, items: d.questions },
    balance: { categories: d.balanceCategories, items: d.balanceItems },
    who: { categories: d.whoCategories, items: d.whoItems }
  };
}

/* ---------- 유틸 ---------- */
const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// "🌈 상상 & 가정" → { emoji: "🌈", name: "상상 & 가정" }
function splitLabel(label) {
  const i = label.indexOf(" ");
  return { emoji: label.slice(0, i), name: label.slice(i + 1) };
}
const catFile = (mode, key) => `${mode}-${key}.html`;
const cleanUrl = (rel) => SITE + "/" + rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");

function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, "utf8");
}

/* ---------- 공통 레이아웃 ---------- */
const FAVICON = `data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27><text y=%27.9em%27 font-size=%2790%27>🧊</text></svg>`;

// base: 루트까지의 상대 경로("" 또는 "../")
function layout({ rel, base, title, description, body, ads = true, noindex = false, ogType = "website" }) {
  const url = cleanUrl(rel);
  const fullTitle = title.includes("Icebreaker") ? title : `${title} | Icebreaker`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" href="${FAVICON}">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}" />
${noindex ? `  <meta name="robots" content="noindex" />\n` : `  <link rel="canonical" href="${url}" />\n`}  <meta name="theme-color" content="#f4f5f9" />
  <link rel="apple-touch-icon" href="${base}icons/apple-touch-icon.png" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:site_name" content="Icebreaker" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(fullTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${SITE}/icons/icon-512.png" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
  <link rel="stylesheet" href="${base}content.css" />
${ads ? `  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}"
          crossorigin="anonymous"></script>\n` : ""}</head>
<body>
  <div class="wrap">
    <header class="site-header">
      <a class="brand" href="${base}index.html">🧊 Icebreaker</a>
      <nav class="site-nav" aria-label="사이트 메뉴">
        <a href="${base}index.html">💬 대화 주제</a>
        <a href="${base}balance.html">⚖️ 밸런스게임</a>
        <a href="${base}who.html">🎯 이 중 누가?</a>
        <a href="${base}questions/index.html">📚 질문 모음</a>
        <a href="${base}guide/index.html">📝 가이드</a>
      </nav>
    </header>
    <main>
${body}
    </main>
    <footer class="site-footer">
      <p>
        <a href="${base}about.html">소개</a> ·
        <a href="${base}contact.html">문의</a> ·
        <a href="${base}privacy.html">개인정보처리방침</a> ·
        <a href="${base}questions/index.html">질문 모음</a> ·
        <a href="${base}guide/index.html">가이드</a>
      </p>
      <p>© 2026 Icebreaker. 모임의 첫마디를 여는 질문 모음.</p>
    </footer>
  </div>
<script data-goatcounter="https://icebreaker.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

/* ---------- 질문 렌더링 ---------- */
function renderItem(mode, item) {
  if (mode === "balance") {
    return `<li class="vs-item"><span class="opt">${esc(item.a)}</span><span class="vs-mark">vs</span><span class="opt">${esc(item.b)}</span></li>`;
  }
  return `<li>${esc(item.text)}</li>`;
}

function publicItems(data, mode, key) {
  const items = data[mode].items.filter((q) => q.category === key);
  return {
    mild: items.filter((q) => q.spice === "mild"),
    medium: items.filter((q) => q.spice === "medium")
  };
}

/* ---------- 카테고리 페이지 ---------- */
function categoryPage(data, mode, key) {
  const info = MODE_INFO[mode];
  const cat = CAT_INFO[mode][key];
  if (!cat) throw new Error(`tools/content/categories.js에 ${mode}.${key} 소개 문구가 없습니다.`);
  const { emoji, name } = splitLabel(data[mode].categories[key].label);
  const { mild, medium } = publicItems(data, mode, key);
  const total = mild.length + medium.length;
  const listTag = mode === "balance" ? "ul" : "ol";
  const titleNoun = mode === "balance" ? "밸런스게임" : mode === "who" ? "'이 중 누가?' 질문" : "대화 주제 질문";
  const title = `${name} ${titleNoun} ${total}개`;
  const description = `${cat.intro} 순한맛 ${mild.length}개, 매운맛 ${medium.length}개를 모았어요.`;

  const others = Object.keys(data[mode].categories).filter((k) => k !== key)
    .map((k) => `<a class="chip" href="${catFile(mode, k)}">${esc(data[mode].categories[k].label)}</a>`).join("\n          ");

  const body = `
      <nav class="breadcrumb" aria-label="현재 위치"><a href="index.html">질문 모음</a> › <a href="index.html#${mode}">${info.emoji} ${info.name}</a> › ${esc(name)}</nav>
      <h1>${emoji} ${esc(title)}</h1>
      <p class="lead">${esc(cat.intro)}</p>
      <div class="callout"><strong>진행 팁</strong> — ${esc(cat.tip)}</div>

      <section>
        <h2>😋 순한맛 ${mild.length}개 <small>처음 만난 사이에도 편한 질문</small></h2>
        <${listTag} class="q-list">
          ${mild.map((q) => renderItem(mode, q)).join("\n          ")}
        </${listTag}>
      </section>

      <section>
        <h2>🌶️ 매운맛 ${medium.length}개 <small>조금 친해졌다면 솔직하게</small></h2>
        <${listTag} class="q-list">
          ${medium.map((q) => renderItem(mode, q)).join("\n          ")}
        </${listTag}>
      </section>

      <section class="panel">
        <h2>${info.emoji} ${info.name} 이렇게 진행해요</h2>
        <ol>
          ${info.howTo.map((s) => `<li>${esc(s)}</li>`).join("\n          ")}
        </ol>
        <p><a class="btn" href="../${info.app}">${info.emoji} ${info.name} 랜덤으로 뽑기</a></p>
      </section>

      <section>
        <h2>다른 ${info.name} 카테고리</h2>
        <div class="chips">
          ${others}
        </div>
      </section>`;

  return layout({ rel: `questions/${catFile(mode, key)}`, base: "../", title, description, body, ogType: "article" });
}

/* ---------- 질문 모음 허브 ---------- */
function questionsHub(data) {
  const sections = Object.keys(MODE_INFO).map((mode) => {
    const info = MODE_INFO[mode];
    const cards = Object.keys(data[mode].categories).map((key) => {
      const { mild, medium } = publicItems(data, mode, key);
      return `<li><a href="${catFile(mode, key)}"><span class="card-title">${esc(data[mode].categories[key].label)}</span><span class="card-meta">${mild.length + medium.length}개</span><span class="card-desc">${esc(CAT_INFO[mode][key].intro.split(". ")[0].replace(/\.$/, ""))}.</span></a></li>`;
    }).join("\n          ");
    return `
      <section id="${mode}">
        <h2>${info.emoji} ${info.name}</h2>
        <p>${esc(info.hubIntro)} <a href="../${info.app}">앱에서 랜덤으로 뽑기 →</a></p>
        <ul class="cards">
          ${cards}
        </ul>
      </section>`;
  }).join("\n");

  const body = `
      <h1>📚 아이스브레이킹 질문 모음</h1>
      <p class="lead">모임에서 바로 쓸 수 있는 대화 주제, 밸런스게임, '이 중 누가?' 질문을 카테고리별로 정리했어요. 각 페이지에는 첫 만남에도 편한 😋 순한맛과 조금 더 솔직한 🌶️ 매운맛 질문이 나뉘어 있어요.</p>
      <p>질문을 미리 훑어보고 모임 성격에 맞는 카테고리를 고른 뒤, 앱에서 랜덤으로 뽑아 진행하면 준비 시간을 크게 줄일 수 있어요. 어떤 카테고리가 좋을지 모르겠다면 <a href="../guide/situations.html">상황별 추천 가이드</a>를 먼저 읽어 보세요.</p>
${sections}`;
  return layout({ rel: "questions/index.html", base: "../", title: "아이스브레이킹 질문 모음", description: "대화 주제, 밸런스게임, '이 중 누가?' 질문을 47개 카테고리별로 모았어요. 첫 만남에 편한 순한맛부터 솔직한 매운맛까지.", body });
}

/* ---------- 가이드 ---------- */
function guidePage(g) {
  const others = GUIDES.filter((o) => o.slug !== g.slug)
    .map((o) => `<li><a href="${o.slug}.html">${esc(o.title)}</a></li>`).join("\n          ");
  const body = `
      <nav class="breadcrumb" aria-label="현재 위치"><a href="index.html">가이드</a> › ${esc(g.title.split(":")[0])}</nav>
      <article class="article">
        <h1>${esc(g.title)}</h1>
        <p class="lead">${esc(g.description)}</p>
${g.body}
      </article>
      <section class="panel">
        <h2>다른 가이드</h2>
        <ul>
          ${others}
        </ul>
      </section>`;
  return layout({ rel: `guide/${g.slug}.html`, base: "../", title: g.title, description: g.description, body, ogType: "article" });
}

function guideHub() {
  const items = GUIDES.map((g) => `<li><a href="${g.slug}.html"><span class="card-title">${esc(g.title)}</span><span class="card-desc">${esc(g.short)}</span></a></li>`).join("\n          ");
  const body = `
      <h1>📝 아이스브레이킹 가이드</h1>
      <p class="lead">질문만 있다고 분위기가 저절로 풀리지는 않아요. 모임을 진행하는 사람이 알아 두면 좋은 순서, 규칙, 배려 방법을 정리했어요.</p>
      <ul class="cards cards-wide">
          ${items}
      </ul>
      <p>바로 질문이 필요하다면 <a href="../questions/index.html">질문 모음</a>에서 카테고리를 고르거나, <a href="../index.html">대화 주제 뽑기</a>로 시작해 보세요.</p>`;
  return layout({ rel: "guide/index.html", base: "../", title: "아이스브레이킹 가이드", description: "아이스브레이킹 진행법, 상황별 추천, 밸런스게임·'이 중 누가?' 진행 요령, 좋은 질문의 조건, 온라인 회의 팁을 정리한 가이드 모음.", body });
}

/* ---------- 소개·문의·404 ---------- */
function aboutPage(data, counts) {
  const body = `
      <h1>Icebreaker 소개</h1>
      <p class="lead">Icebreaker는 모임의 어색한 첫마디를 대신 열어 주는 무료 웹앱이에요. 소그룹, 동아리, 회사 팀, 친구 모임에서 "무슨 얘기부터 하지?"라는 고민을 줄이기 위해 만들었어요.</p>

      <section class="panel">
        <h2>무엇을 할 수 있나요?</h2>
        <ul>
          <li><a href="index.html">💬 대화 주제</a> — ${Object.keys(data.topic.categories).length}개 카테고리의 열린 질문을 랜덤으로 뽑아 돌아가며 답해요.</li>
          <li><a href="balance.html">⚖️ 밸런스게임</a> — ${Object.keys(data.balance.categories).length}개 카테고리의 A/B 양자택일 질문으로 고르고 이유를 나눠요.</li>
          <li><a href="who.html">🎯 이 중 누가?</a> — ${Object.keys(data.who.categories).length}개 카테고리의 질문에 가장 어울리는 사람을 함께 가리켜요.</li>
        </ul>
        <p>모든 질문은 직접 쓰고 다듬었으며, 현재 세 모드를 합쳐 ${counts.total.toLocaleString("ko-KR")}개의 질문이 있어요. 카테고리별 질문은 <a href="questions/index.html">질문 모음</a>에서 미리 볼 수 있어요.</p>
      </section>

      <section class="panel">
        <h2>질문을 만드는 원칙</h2>
        <ul>
          <li><strong>단계별 수위:</strong> 😋 순한맛은 처음 만난 사이에도 편하게, 🌶️ 매운맛은 조금 친해진 사이에서 솔직하게 답할 수 있도록 나눴어요.</li>
          <li><strong>언제든 건너뛰기:</strong> 모든 질문은 답하지 않고 넘어가도 괜찮다는 전제로 만들었어요.</li>
          <li><strong>상처 주지 않기:</strong> 외모 평가, 비하, 실명 언급, 트라우마나 건강 고백을 강요하는 질문은 넣지 않아요. 신앙과 정치에 관한 질문은 서로의 생각을 존중하는 방향으로 썼어요.</li>
          <li><strong>중복 없이:</strong> 같은 맛·카테고리 안에서는 한 바퀴를 다 돌기 전까지 같은 질문이 다시 나오지 않아요.</li>
        </ul>
      </section>

      <section class="panel">
        <h2>회원가입 없이, 오프라인에서도</h2>
        <p>로그인이나 개인정보 입력 없이 바로 쓸 수 있어요. 휴대폰 홈 화면에 추가하면 앱처럼 실행되고, 한 번 열어 둔 뒤에는 인터넷이 없는 곳에서도 질문을 뽑을 수 있어요. 자세한 정보 처리 내용은 <a href="privacy.html">개인정보처리방침</a>을 참고하세요.</p>
      </section>

      <section class="panel">
        <h2>만든 사람</h2>
        <p>Icebreaker는 개인 개발자가 운영하는 프로젝트예요. 소스 코드는 <a href="https://github.com/Chehok/icebreaker" target="_blank" rel="noopener noreferrer">GitHub</a>에 공개되어 있어요. 질문 제안이나 오류 제보는 <a href="contact.html">문의 페이지</a>로 보내 주세요.</p>
      </section>`;
  return layout({ rel: "about.html", base: "", title: "Icebreaker 소개", description: "모임의 어색한 첫마디를 열어 주는 무료 웹앱 Icebreaker의 기능, 질문을 만드는 원칙, 운영자를 소개합니다.", body, ads: false });
}

function contactPage() {
  const body = `
      <h1>문의하기</h1>
      <p class="lead">질문 제안, 어색하거나 불편한 질문 신고, 오류 제보, 그 밖의 의견을 기다려요.</p>

      <section class="panel">
        <h2>이메일</h2>
        <p><a href="mailto:dev.chehok@gmail.com">dev.chehok@gmail.com</a></p>
        <p>보내 주신 이메일 주소와 내용은 답변에 필요한 범위에서만 사용해요. 보통 일주일 안에 답장을 드려요.</p>
      </section>

      <section class="panel">
        <h2>GitHub 이슈</h2>
        <p>오류 제보나 기능 제안은 <a href="https://github.com/Chehok/icebreaker/issues" target="_blank" rel="noopener noreferrer">GitHub 이슈</a>로 남겨 주셔도 돼요. 이슈는 누구나 볼 수 있으니 개인정보는 적지 말아 주세요.</p>
      </section>

      <section class="panel">
        <h2>이런 내용을 보내 주시면 좋아요</h2>
        <ul>
          <li><strong>질문 제안:</strong> 모드(대화 주제·밸런스게임·이 중 누가?), 원하는 맛(순한맛·매운맛), 카테고리를 함께 적어 주세요.</li>
          <li><strong>불편한 질문 신고:</strong> 질문 문구를 그대로 복사해 보내 주시면 빠르게 확인할 수 있어요.</li>
          <li><strong>오류 제보:</strong> 사용한 기기와 브라우저(예: iPhone Safari, Android Chrome), 어떤 화면에서 무엇을 눌렀는지 알려 주세요.</li>
        </ul>
      </section>`;
  return layout({ rel: "contact.html", base: "", title: "문의하기", description: "Icebreaker 질문 제안, 불편한 질문 신고, 오류 제보 및 문의 방법을 안내합니다.", body, ads: false });
}

function notFoundPage() {
  const body = `
      <h1>페이지를 찾을 수 없어요</h1>
      <p class="lead">주소가 바뀌었거나 없는 페이지예요. 아래에서 원하는 메뉴를 골라 주세요.</p>
      <ul>
        <li><a href="/">💬 대화 주제 뽑기</a></li>
        <li><a href="/balance">⚖️ 밸런스게임</a></li>
        <li><a href="/who">🎯 이 중 누가?</a></li>
        <li><a href="/questions/">📚 질문 모음</a></li>
        <li><a href="/guide/">📝 가이드</a></li>
      </ul>`;
  // 404는 어느 경로에서나 표시되므로 루트 절대 경로를 씁니다.
  return layout({ rel: "404.html", base: "/", title: "페이지를 찾을 수 없어요", description: "요청한 페이지를 찾을 수 없습니다.", body, ads: false, noindex: true });
}

/* ---------- 앱 페이지 안내 구간 ---------- */
function appSection(data, mode) {
  const info = MODE_INFO[mode];
  const cats = Object.keys(data[mode].categories);
  // 카테고리마다 순한맛 첫 질문을 하나씩, 최대 6개
  const samples = cats.slice(0, 6).map((k) => data[mode].items.find((q) => q.category === k && q.spice === "mild")).filter(Boolean);
  const listTag = mode === "balance" ? "ul" : "ol";
  const chips = cats.map((k) => `<a class="cat-link" href="./questions/${catFile(mode, k)}">${esc(data[mode].categories[k].label)}</a>`).join("\n          ");
  const guides = GUIDES.slice(0, 4).map((g) => `<li><a href="./guide/${g.slug}.html">${esc(g.title.split(":")[0])}</a></li>`).join("\n          ");
  return `<!-- content:start (tools/generate-content.js가 생성하는 구간입니다. 직접 수정하지 마세요) -->
    <section class="page-content" aria-labelledby="howto-title">
      <h2 id="howto-title">${info.emoji} ${info.name} 이렇게 즐겨요</h2>
      <p>${esc(info.hubIntro)}</p>
      <ol>
        ${info.howTo.map((s) => `<li>${esc(s)}</li>`).join("\n        ")}
      </ol>

      <h2>예시 질문</h2>
      <${listTag} class="q-list">
        ${samples.map((q) => renderItem(mode, q)).join("\n        ")}
      </${listTag}>

      <h2>카테고리별 질문 모음</h2>
      <p>뽑기 전에 어떤 질문이 있는지 카테고리별로 미리 살펴볼 수 있어요.</p>
      <div class="cat-links">
          ${chips}
      </div>

      <h2>진행 가이드</h2>
      <ul>
          ${guides}
          <li><a href="./guide/index.html">가이드 전체 보기</a></li>
      </ul>
    </section>
    <!-- content:end -->`;
}

function injectAppPage(data, file, mode) {
  const p = path.join(ROOT, file);
  const html = fs.readFileSync(p, "utf8");
  const re = /<!-- content:start[\s\S]*?<!-- content:end -->/;
  if (!re.test(html)) throw new Error(`${file}에 <!-- content:start --> ~ <!-- content:end --> 표시가 없습니다.`);
  fs.writeFileSync(p, html.replace(re, appSection(data, mode)), "utf8");
}

/* ---------- 사이트맵 ---------- */
function sitemap(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
}

/* ---------- 실행 ---------- */
function main() {
  const data = loadData();
  const counts = { total: Object.values(data).reduce((n, m) => n + m.items.length, 0) };
  const pages = [];

  // 예전 생성물 정리
  for (const dir of ["questions", "guide"]) fs.rmSync(path.join(ROOT, dir), { recursive: true, force: true });

  write("questions/index.html", questionsHub(data)); pages.push("questions/index.html");
  for (const mode of Object.keys(MODE_INFO)) {
    for (const key of Object.keys(data[mode].categories)) {
      const rel = `questions/${catFile(mode, key)}`;
      write(rel, categoryPage(data, mode, key)); pages.push(rel);
    }
  }
  write("guide/index.html", guideHub()); pages.push("guide/index.html");
  for (const g of GUIDES) { write(`guide/${g.slug}.html`, guidePage(g)); pages.push(`guide/${g.slug}.html`); }
  write("about.html", aboutPage(data, counts)); pages.push("about.html");
  write("contact.html", contactPage()); pages.push("contact.html");
  write("404.html", notFoundPage());

  injectAppPage(data, "index.html", "topic");
  injectAppPage(data, "balance.html", "balance");
  injectAppPage(data, "who.html", "who");

  const urls = ["index.html", "balance.html", "who.html", ...pages, "privacy.html"].map(cleanUrl);
  write("sitemap.xml", sitemap(urls));
  console.log(`생성 완료: 페이지 ${pages.length + 1}개, 사이트맵 URL ${urls.length}개`);
}

main();
