/* 홈 화면 설치: 지원 브라우저에서만 표시 */
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

function updateInstallButton() {
  const installed = appInstalled || standaloneMode.matches || navigator.standalone === true;
  installBtn.hidden = installed || (!isIOSShareInstall && !installPrompt);
  if (installed) {
    installPrompt = null;
    if (installGuide.open) installGuide.close();
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  updateInstallButton();
});
installBtn.addEventListener("click", async () => {
  if (installBtn.hidden) return;
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
window.addEventListener("appinstalled", () => {
  appInstalled = true;
  updateInstallButton();
});
if (standaloneMode.addEventListener) standaloneMode.addEventListener("change", updateInstallButton);
else standaloneMode.addListener(updateInstallButton);
if (isIOSShareInstall) installBtn.setAttribute("aria-haspopup", "dialog");
updateInstallButton();

/* ===== 💬 대화 주제 모드 데이터 ===== */
const categories = {
  imagine: { label: "🌈 상상 & 가정" },
  favorite: { label: "🍔 취향 & 최애" },
  daily: { label: "💬 나의 일상" },
  faith: { label: "✝️ 신앙 이야기" },
  love: { label: "💘 연애 & 썸" },
  tmi: { label: "👥 자기소개 & TMI" },
  hobby: { label: "🎮 덕질 & 취미" },
  deep: { label: "🥲 진지 토크" },
  travel: { label: "🌏 여행 & 버킷리스트" },
  food: { label: "🍽️ 먹부림 & 맛집" },
  memory: { label: "🕰️ 어린 시절 & 추억" },
  politics: { label: "🏛️ 정치 & 사회" },
  invest: { label: "📈 투자 & 돈" },
  work: { label: "💼 직장 & 학교" },
  content: { label: "📺 콘텐츠 & 드라마" },
  season: { label: "☀️ 날씨 & 계절" },
  place: { label: "🏘️ 동네 & 장소" },
  pet: { label: "🐶 반려동물 & 동물" },
  habit: { label: "⏰ 습관 & 루틴" },
  shop: { label: "🛍️ 쇼핑 & 소비" },
  school: { label: "🎒 학창시절" },
  silly: { label: "👽 만약에 & 엉뚱 질문" },
  thanks: { label: "💐 칭찬 & 고마움" }
};

const mildQuestions = [
  { text: "무인도에 딱 3가지만 가져갈 수 있다면?", category: "imagine" },
  { text: "타임머신이 생긴다면 과거와 미래 중 어디로 갈래?", category: "imagine" },
  { text: "로또 1등에 당첨되면 가장 먼저 하고 싶은 일은?", category: "imagine" },
  { text: "초능력 하나를 가질 수 있다면 어떤 능력?", category: "imagine" },
  { text: "만약 동물로 다시 태어난다면 어떤 동물이 되고 싶어?", category: "imagine" },
  { text: "하루 동안 다른 사람이 될 수 있다면 누가 되고 싶어?", category: "imagine" },
  { text: "휴대폰 없이 하루를 버틸 수 있을까?", category: "imagine" },
  { text: "하루가 25시간이라면 늘어난 한 시간을 어떻게 쓸래?", category: "imagine" },
  { text: "10년 뒤 나는 어떤 모습일 것 같아?", category: "imagine" },

  { text: "옷을 한 가지 색으로만 입는다면 무슨 색을 고를래?", category: "favorite" },
  { text: "가장 좋아하는 향이나 냄새는 뭐야?", category: "favorite" },
  { text: "계속 모으고 싶을 만큼 좋아하는 물건은?", category: "favorite" },
  { text: "내 방에 딱 한 장 걸어두고 싶은 사진이나 그림은?", category: "favorite" },
  { text: "좋아하는 물건을 고를 때 디자인과 편리함 중 뭐가 더 중요해?", category: "favorite" },
  { text: "노래방 18번(애창곡)은 뭐야?", category: "favorite" },
  { text: "가장 가보고 싶은 콘서트나 공연은?", category: "favorite" },
  { text: "가장 좋아하는 이모지 하나만 고른다면?", category: "favorite" },
  { text: "비행기·기차·영화관에서 가장 좋아하는 자리는?", category: "favorite" },

  { text: "가장 최근에 크게 웃었던 순간은 언제였어?", category: "daily" },
  { text: "오늘 하루 중 가장 여유로웠던 시간은?", category: "daily" },
  { text: "요즘 계속 미루고만 있는 '해야 하는 일'은?", category: "daily" },
  { text: "스트레스받을 때 나만의 해소법이 있어?", category: "daily" },
  { text: "요즘 일상에서 자주 쓰는 나만의 감탄사는?", category: "daily" },
  { text: "친구들 사이에서 내 별명이나 이미지는?", category: "daily" },
  { text: "요즘 평일 저녁은 주로 어떻게 보내?", category: "daily" },
  { text: "일상에서 딱 하나 자동으로 처리됐으면 하는 일은?", category: "daily" },
  { text: "오늘 하루에 제목을 붙인다면?", category: "daily" },
  { text: "오늘 집에서 나오기 직전에 한 일은?", category: "daily" },
  { text: "최근에 처음 해본 작은 일은?", category: "daily" },
  { text: "오늘 하루를 색깔로 표현한다면 무슨 색?", category: "daily" },

  { text: "식사 전 감사 인사를 한다면 오늘은 뭐라고 하고 싶어?", category: "faith" },
  { text: "가장 좋아하는 성경 구절이나 마음에 남는 말씀은?", category: "faith" },
  { text: "일상 속 작은 바람 하나를 기도로 표현한다면?", category: "faith" },
  { text: "하나님을 가장 가깝게 느꼈던 순간은 언제였어?", category: "faith" },
  { text: "가장 좋아하는 찬양 한 곡을 꼽는다면?", category: "faith" },
  { text: "성경 인물 중에 한 명과 하루를 보낼 수 있다면 누구?", category: "faith" },
  { text: "신앙생활을 하면서 가장 크게 변한 점이 있다면?", category: "faith" },
  { text: "요즘 내 신앙에 힘이 되어주는 사람이나 공동체는?", category: "faith" },
  { text: "천국에 가면 하나님께 가장 먼저 여쭤보고 싶은 것은?", category: "faith" },
  { text: "예배나 종교 모임에서 가장 편안하게 느끼는 순서는?", category: "faith" },

  { text: "내 이상형의 조건 딱 3가지만 꼽는다면?", category: "love" },
  { text: "첫눈에 반한 경험이 있어?", category: "love" },
  { text: "연애할 때 가장 중요하게 생각하는 건 뭐야?", category: "love" },
  { text: "어떤 말이나 행동을 보면 로맨틱하다고 느껴?", category: "love" },
  { text: "썸과 연애의 결정적인 차이는 뭐라고 생각해?", category: "love" },
  { text: "받아보고 싶은 로맨틱한 이벤트가 있다면?", category: "love" },
  { text: "데이트할 때 각자 보내는 시간은 얼마나 있으면 좋을까?", category: "love" },
  { text: "영화나 드라마에서 기억에 남는 고백 장면은?", category: "love" },
  { text: "누군가에게 처음 호감을 느끼는 포인트는?", category: "love" },
  { text: "완벽한 데이트 코스를 짠다면?", category: "love" },

  { text: "사람들이 나에 대해 가장 많이 오해하는 점은?", category: "tmi" },
  { text: "나만 아는 나의 의외의 모습이 있다면?", category: "tmi" },
  { text: "내 MBTI는 뭐고, 잘 맞는 것 같아?", category: "tmi" },
  { text: "사진을 찍을 때 나도 모르게 짓는 표정은?", category: "tmi" },
  { text: "처음 자기소개할 때 꼭 덧붙이고 싶은 내 이야기는?", category: "tmi" },
  { text: "남들은 잘 모르는 나만의 특기가 있어?", category: "tmi" },
  { text: "내 인생 최고의 자랑거리 하나는?", category: "tmi" },
  { text: "스스로 생각하는 나의 최대 장점은?", category: "tmi" },
  { text: "요즘 나의 소소한 목표가 있다면?", category: "tmi" },
  { text: "나를 설명하는 해시태그 3개를 만든다면?", category: "tmi" },

  { text: "요즘 가장 빠져 있는 최애(아이돌/캐릭터/작품)는?", category: "hobby" },
  { text: "처음 해보고 생각보다 재미있었던 취미는?", category: "hobby" },
  { text: "내 취미를 보여주는 물건을 딱 하나 가져온다면?", category: "hobby" },
  { text: "요즘 즐겨 하는 게임이나 앱이 있어?", category: "hobby" },
  { text: "새로 도전해보고 싶은 취미가 있다면?", category: "hobby" },
  { text: "인생 노래 플레이리스트에 꼭 있는 곡은?", category: "hobby" },
  { text: "누군가 내 취미에 입문한다면 어떤 순서로 알려주고 싶어?", category: "hobby" },
  { text: "취미 때문에 밤새운 적 있어?", category: "hobby" },
  { text: "최근에 새로 알게 된 '입덕 포인트'가 있어?", category: "hobby" },
  { text: "내 취미를 함께 즐길 모임을 만든다면 이름을 뭐라고 지을래?", category: "hobby" },

  { text: "작지만 뿌듯했던 최근의 성취는?", category: "deep" },
  { text: "남들과 비교하지 않고 내 성장을 확인하는 기준은?", category: "deep" },
  { text: "나에게 '행복'이란 무엇일까?", category: "deep" },
  { text: "지금의 나에게 가장 필요한 한마디는?", category: "deep" },
  { text: "5년 전의 나에게 해주고 싶은 말이 있다면?", category: "deep" },
  { text: "새로운 도전을 할 때 용기를 주는 한마디를 만든다면?", category: "deep" },
  { text: "나에게 가장 소중한 것 세 가지는?", category: "deep" },
  { text: "요즘 내 마음을 가장 크게 채우고 있는 감정은?", category: "deep" },
  { text: "어떤 사람으로 기억되고 싶어?", category: "deep" },
  { text: "삶에서 절대 포기할 수 없는 가치는 뭐야?", category: "deep" },

  { text: "죽기 전에 꼭 가보고 싶은 나라 한 곳은?", category: "travel" },
  { text: "인생 최고의 여행지를 꼽는다면?", category: "travel" },
  { text: "혼자 떠나는 여행 vs 함께 가는 여행?", category: "travel" },
  { text: "버킷리스트에 꼭 있는 것 하나는?", category: "travel" },
  { text: "당장 한 달 살기를 한다면 어디서?", category: "travel" },
  { text: "여행 갈 때 절대 안 빼먹는 준비물은?", category: "travel" },
  { text: "가장 인상 깊었던 여행의 순간은?", category: "travel" },
  { text: "국내 여행지 중 강력 추천하는 곳은?", category: "travel" },
  { text: "여행 스타일이 계획형이야, 즉흥형이야?", category: "travel" },
  { text: "언젠가 꼭 도전해보고 싶은 액티비티가 있다면?", category: "travel" },

  { text: "한 끼에 가장 푸짐하게 먹었던 메뉴는?", category: "food" },
  { text: "요즘 꽂혀 있는 음식이나 메뉴가 있어?", category: "food" },
  { text: "혼자서도 자주 가는 나만의 맛집이 있다면?", category: "food" },
  { text: "라면에 절대 빠지면 안 되는 것은?", category: "food" },
  { text: "야식으로 가장 자주 시키는 메뉴는?", category: "food" },
  { text: "호불호 갈리지만 내가 사랑하는 음식은?", category: "food" },
  { text: "해외 음식 중 다시 먹고 싶은 것은?", category: "food" },
  { text: "직접 만들 수 있는 요리 중 자신 있는 메뉴는?", category: "food" },
  { text: "먹어보고 실망했던 유명 맛집이 있어?", category: "food" },
  { text: "가장 기억에 남는 음식의 식감은?", category: "food" },

  { text: "어릴 때 장래희망이 뭐였어?", category: "memory" },
  { text: "어릴 때 집에서 가족과 즐겨 하던 놀이는?", category: "memory" },
  { text: "어릴 때 진짜라고 믿었던 엉뚱한 이야기는?", category: "memory" },
  { text: "어릴 때 가장 좋아했던 만화나 게임은?", category: "memory" },
  { text: "어릴 때 보물처럼 아꼈던 물건은?", category: "memory" },
  { text: "가장 그리운 어린 시절의 순간은?", category: "memory" },
  { text: "용돈을 받으면 주로 어디에 썼어?", category: "memory" },
  { text: "어릴 때 가장 무서워했던 것은?", category: "memory" },
  { text: "다시 돌아가고 싶은 나이가 있다면?", category: "memory" },
  { text: "어릴 때 떠난 여행 중 가장 기억에 남는 장면은?", category: "memory" },

  { text: "하루 동안 대통령이 된다면 가장 먼저 하고 싶은 일은?", category: "politics" },
  { text: "딱 하나의 법을 새로 만들 수 있다면 어떤 법?", category: "politics" },
  { text: "우리 동네에 꼭 생겼으면 하는 공공시설이 있다면?", category: "politics" },
  { text: "만약 공휴일을 하나 더 만든다면 무슨 날로?", category: "politics" },
  { text: "공공 예산을 한 분야에 더 쓸 수 있다면 어디에 쓰고 싶어?", category: "politics" },
  { text: "공공장소에서 서로 지키면 좋겠다고 생각하는 작은 배려는?", category: "politics" },
  { text: "대통령에게 딱 한 가지 질문할 수 있다면 뭘 물어볼래?", category: "politics" },
  { text: "새로운 나라를 만든다면 국기에 어떤 상징을 넣고 싶어?", category: "politics" },
  { text: "투표할 때 가장 중요하게 보는 것은 무엇이라고 생각해?", category: "politics" },
  { text: "미래에 꼭 해결됐으면 하는 사회 문제 하나는?", category: "politics" },

  { text: "만약 1,000만 원이 생긴다면 어디에 투자할 것 같아?", category: "invest" },
  { text: "예금·주식·부동산·코인 중 가장 관심 가는 건?", category: "invest" },
  { text: "돈 관리할 때 나만의 소소한 원칙이 있어?", category: "invest" },
  { text: "재테크에 관심 갖게 된 계기가 있어?", category: "invest" },
  { text: "적은 돈을 꾸준히 모으는 재미를 붙인다면 어떤 방법을 써보고 싶어?", category: "invest" },
  { text: "돈 걱정이 줄어들면 시간을 더 쓰고 싶은 일은?", category: "invest" },
  { text: "가계부는 앱과 종이 중 어느 쪽이 편할 것 같아?", category: "invest" },
  { text: "요즘 눈여겨보는 산업이나 분야가 있다면?", category: "invest" },
  { text: "경제 뉴스나 재테크 정보는 어디서 얻는 편이야?", category: "invest" },
  { text: "돈을 모으는 이유, 나만의 목표가 있다면?", category: "invest" },

  { text: "회사(학교)에서 제일 좋아하는 시간대는?", category: "work" },
  { text: "출근(등교)길에 꼭 하는 나만의 루틴이 있어?", category: "work" },
  { text: "점심 메뉴 고를 때 나만의 기준은 뭐야?", category: "work" },
  { text: "회사(학교)에서 나를 버티게 해주는 소소한 낙은?", category: "work" },
  { text: "지금 하는 일(공부)을 선택한 이유는 뭐야?", category: "work" },
  { text: "같이 일하고(공부하고) 싶은 스타일의 사람은?", category: "work" },
  { text: "내 책상 위에 꼭 있어야 하는 물건은?", category: "work" },
  { text: "재택(온라인)과 출근(등교) 중에 어느 쪽이 더 잘 맞아?", category: "work" },
  { text: "월요일 아침을 버티는 나만의 방법이 있어?", category: "work" },
  { text: "일(공부) 끝나고 집에 도착하면 제일 먼저 하는 일은?", category: "work" },

  { text: "요즘 정주행 중인 드라마나 시리즈가 있어?", category: "content" },
  { text: "유튜브 알고리즘은 나를 어떤 사람이라고 생각할 것 같아?", category: "content" },
  { text: "영화관에서 본 영화 중 제일 좋았던 한 편은?", category: "content" },
  { text: "요즘 챙겨 보는 웹툰이나 웹소설이 있어?", category: "content" },
  { text: "요즘 하루 종일 반복 재생 중인 노래는?", category: "content" },
  { text: "드라마 속 인물 중에 닮고 싶은 사람은 누구야?", category: "content" },
  { text: "보다가 펑펑 울었던 영화나 드라마가 있어?", category: "content" },
  { text: "주변에 꼭 추천해주고 싶은 숨은 명작이 있다면?", category: "content" },
  { text: "결말이 마음에 안 들어서 진짜 화났던 작품이 있어?", category: "content" },
  { text: "주말에 아무 계획 없을 때 제일 먼저 틀어두는 콘텐츠는?", category: "content" },

  { text: "사계절 중 하나만 남긴다면 어떤 계절?", category: "season" },
  { text: "비 오는 날과 맑은 날, 어느 쪽이 더 좋아?", category: "season" },
  { text: "눈이 펑펑 오면 제일 먼저 하고 싶은 일은?", category: "season" },
  { text: "여름에 꼭 먹어야 하는 음식이 있다면?", category: "season" },
  { text: "겨울 하면 떠오르는 제일 좋은 기억은?", category: "season" },
  { text: "벚꽃과 단풍 중에 하나만 고른다면?", category: "season" },
  { text: "날씨에 기분이 많이 좌우되는 편이야?", category: "season" },
  { text: "장마철을 버티는 나만의 꿀팁이 있어?", category: "season" },
  { text: "제일 좋아하는 날씨의 하루를 어떻게 보내고 싶어?", category: "season" },
  { text: "더위와 추위 중에 도저히 못 참겠는 건?", category: "season" },

  { text: "우리 동네에서 제일 좋아하는 장소는 어디야?", category: "place" },
  { text: "지금 사는 동네의 장점 딱 하나만 꼽는다면?", category: "place" },
  { text: "동네에 단골 가게가 있어?", category: "place" },
  { text: "산책하기 좋은 나만의 코스가 있다면?", category: "place" },
  { text: "집 근처에 꼭 있어야 하는 시설 하나는?", category: "place" },
  { text: "가본 곳 중에 분위기가 제일 좋았던 카페는?", category: "place" },
  { text: "쉬는 날 혼자 가고 싶은 장소는 어디야?", category: "place" },
  { text: "우리 동네를 소개하는 엽서를 만든다면 어떤 풍경을 넣을래?", category: "place" },
  { text: "어릴 때 살던 동네에서 아직도 기억나는 장소가 있어?", category: "place" },
  { text: "돈 걱정이 없다면 어느 동네에서 살고 싶어?", category: "place" },

  { text: "강아지 vs 고양이, 키운다면 어느 쪽이야?", category: "pet" },
  { text: "반려동물과 지내본 적 있어? 가장 귀여웠던 행동은?", category: "pet" },
  { text: "제일 좋아하는 동물은 뭐야?", category: "pet" },
  { text: "동물원에 가면 제일 오래 보게 되는 동물은?", category: "pet" },
  { text: "반려동물 이름을 지어준다면 뭐라고 짓고 싶어?", category: "pet" },
  { text: "멀리서 보면 귀엽지만 가까이 가기는 망설여지는 동물은?", category: "pet" },
  { text: "동물과 말이 통한다면 제일 먼저 물어보고 싶은 건?", category: "pet" },
  { text: "동물 영상 보다가 시간 순삭된 적 있어?", category: "pet" },
  { text: "내 성격을 동물로 비유한다면 어떤 동물이야?", category: "pet" },
  { text: "반려동물이 생기면 같이 꼭 해보고 싶은 일은?", category: "pet" },

  { text: "아침형 인간이야, 저녁형 인간이야?", category: "habit" },
  { text: "하루 중 가장 집중이 잘 되는 시간은 언제야?", category: "habit" },
  { text: "잠들기 전에 꼭 하는 행동이 있어?", category: "habit" },
  { text: "아침에 눈 뜨자마자 제일 먼저 하는 일은?", category: "habit" },
  { text: "매일 꼭 챙겨 마시는 음료가 있어?", category: "habit" },
  { text: "최근에 새로 만든 좋은 습관이 있다면?", category: "habit" },
  { text: "알람은 몇 개 맞춰두고, 몇 번째에 일어나?", category: "habit" },
  { text: "주말 루틴은 어떻게 돼?", category: "habit" },
  { text: "기분 전환을 위한 나만의 루틴이 있어?", category: "habit" },
  { text: "나도 모르게 자꾸 나오는 버릇이 있다면?", category: "habit" },

  { text: "최근에 산 것 중 제일 만족한 물건은?", category: "shop" },
  { text: "쇼핑할 때 온라인파야, 오프라인파야?", category: "shop" },
  { text: "장바구니에 담아두고 계속 고민 중인 물건이 있어?", category: "shop" },
  { text: "선물 고를 때 나만의 기준이 있어?", category: "shop" },
  { text: "비싸도 품질이 좋아서 계속 쓰는 물건이 있다면?", category: "shop" },
  { text: "택배 올 때 가장 설레는 물건은?", category: "shop" },
  { text: "월급날 제일 먼저 사고 싶은 건 뭐야?", category: "shop" },
  { text: "옷, 신발, 가방 중에 제일 돈을 많이 쓰게 되는 건?", category: "shop" },
  { text: "쇼핑하면서 스트레스를 푸는 편이야?", category: "shop" },
  { text: "아끼다가 안 사서 오히려 후회한 물건이 있어?", category: "shop" },

  { text: "졸업하고 연락이 끊겨서 아쉬운 친구가 있어?", category: "school" },
  { text: "수학여행에서 가장 기억에 남는 순간은?", category: "school" },
  { text: "학교 급식 중에 제일 좋아했던 메뉴는?", category: "school" },
  { text: "시험 기간에 나만의 공부 루틴이 있었어?", category: "school" },
  { text: "동아리 활동 해봤어? 어떤 동아리였어?", category: "school" },
  { text: "제일 좋아했던 과목과 제일 싫어했던 과목은?", category: "school" },
  { text: "학교 매점이나 분식집에서 꼭 사 먹던 게 있어?", category: "school" },
  { text: "가장 기억에 남는 선생님은 어떤 분이었어?", category: "school" },
  { text: "소풍이나 체육대회 같은 학교 행사 중에 제일 좋아했던 건?", category: "school" },
  { text: "쉬는 시간 10분을 주로 어떻게 보냈어?", category: "school" },

  { text: "좀비 사태가 나면 어디로 피신할래?", category: "silly" },
  { text: "외계인이 지구에 오면 제일 먼저 뭘 보여주고 싶어?", category: "silly" },
  { text: "손이 하나 더 생긴다면 그 손으로 뭘 시킬래?", category: "silly" },
  { text: "마트에서 딱 1분 동안 아무거나 담을 수 있다면 뭘 가져올래?", category: "silly" },
  { text: "내 이름을 딴 라면을 만든다면 어떤 맛이 좋을까?", category: "silly" },
  { text: "벽을 통과할 수 있는 능력이 생기면 어디부터 가볼래?", category: "silly" },
  { text: "내 전용 로봇이 생긴다면 어떤 일을 시킬래?", category: "silly" },
  { text: "공룡이 되살아난다면 어떤 공룡이랑 친구하고 싶어?", category: "silly" },
  { text: "지구에 나 혼자 남는다면 제일 먼저 뭘 할 거야?", category: "silly" },
  { text: "눈 떴는데 내 방이 우주선이라면 제일 먼저 뭘 할래?", category: "silly" },

  { text: "최근에 누군가한테 들은 기분 좋은 말은?", category: "thanks" },
  { text: "요즘 가장 고마운 사람은 누구야?", category: "thanks" },
  { text: "오늘 나 자신에게 해주고 싶은 칭찬 한마디는?", category: "thanks" },
  { text: "이 자리에 있는 사람 중 한 명이 잘하는 일을 칭찬한다면?", category: "thanks" },
  { text: "작은 배려를 받아서 하루가 좋아졌던 순간은?", category: "thanks" },
  { text: "말 대신 행동으로 고마움을 표현한다면 어떻게 하고 싶어?", category: "thanks" },
  { text: "칭찬받으면 쑥스러워하는 편이야, 즐기는 편이야?", category: "thanks" },
  { text: "고마운 사람에게 하루 동안 작은 도움을 줄 수 있다면 뭘 해주고 싶어?", category: "thanks" },
  { text: "내가 남에게 자주 해주는 칭찬이 있다면?", category: "thanks" },
  { text: "오늘 모임에서 즐거웠던 순간 하나를 꼽는다면?", category: "thanks" }
];

const mediumQuestions = [
  { text: "딱 하루 친구가 내 휴대폰 알림을 대신 읽는다면 가장 곤란할 알림은?", category: "imagine" },
  { text: "친구가 내 하루를 다큐로 찍는다면 가장 먼저 편집해달라고 할 장면은?", category: "imagine" },
  { text: "누군가 내 첫인상과 지금 인상을 익명으로 적어준다면 읽어볼래?", category: "imagine" },
  { text: "누군가에게 했던 말 한마디를 취소할 수 있다면, 누구에게 한 어떤 말이야?", category: "imagine" },
  { text: "복권에 당첨돼서 퇴사한다면 마지막 날 평소 못 했던 말을 할래? 어떤 말?", category: "imagine" },
  { text: "100억을 받는 대신 평생 내 소비 내역이 공개된다면 받을래?", category: "imagine" },
  { text: "내가 남에게 보낸 답장 속도를 순위로 보여준다면 누구 눈치를 가장 보게 될까?", category: "imagine" },
  { text: "친구들이 나 대신 소개팅 프로필을 써준다면 어떤 부분을 고치고 싶을까?", category: "imagine" },

  { text: "돈 때문에 포기했던 '진짜 갖고 싶은 것'이 있어?", category: "favorite" },
  { text: "친구가 '이거 어때?' 하고 보여준 게 솔직히 별로일 때, 진짜로 별로라고 말해본 적 있어?", category: "favorite" },
  { text: "친한 친구나 연인 취향 중에 솔직히 '이건 진짜 아니다' 싶은 게 있어?", category: "favorite" },
  { text: "내 취향 중 돈을 좀 아깝게 썼다고 인정할 수 있는 건?", category: "favorite" },
  { text: "'나이에 안 맞는다' 소리 들을까 봐 남들한테 숨기는 내 취향이 있어?", category: "favorite" },
  { text: "취향 때문에 누군가와 크게 부딪힌 적 있어?", category: "favorite" },
  { text: "다들 좋아해서 좋아하는 척했지만 사실 별로였던 것은?", category: "favorite" },
  { text: "썸 상대의 취향(옷·음악·말투) 하나 때문에 마음이 확 식은 적 있어?", category: "favorite" },

  { text: "카톡 읽고 일부러 답 안 하다가 나중에 '못 봤어'라고 한 적 있어?", category: "daily" },
  { text: "바쁜 척하며 약속을 피했는데 사실 집에서 놀았던 적 있어?", category: "daily" },
  { text: "지난 1년 중 제일 민망했던 날, 무슨 일이 있었어?", category: "daily" },
  { text: "요즘 나를 은근히 스트레스받게 하는 사람 유형은?", category: "daily" },
  { text: "최근에 누군가에게 서운했던 적 있어?", category: "daily" },
  { text: "SNS에 차마 올리지 못한 진짜 요즘 근황은?", category: "daily" },
  { text: "남들이 보면 깜짝 놀랄 내 퇴근(하교) 후 '현실 모습'은?", category: "daily" },
  { text: "최근에 누군가에게 한 '선의의 거짓말' 하나만 고백한다면?", category: "daily" },

  { text: "예배나 종교 모임 중 집중하는 척했지만 딴생각한 적 있어?", category: "faith" },
  { text: "기도 부탁을 받고 깜빡한 뒤 다시 물어봤을 때 뭐라고 했어?", category: "faith" },
  { text: "신앙 모임에서 의견이 다를 때 동의하는 척한 적 있어?", category: "faith" },
  { text: "교회 문화 중에 솔직히 불편하거나 잘 공감되지 않는 부분이 있어?", category: "faith" },
  { text: "솔직히 아직도 이해되지 않는 성경 내용이 있어?", category: "faith" },
  { text: "종교적인 표현이 붙은 부탁이라 거절하기 더 어려웠던 적 있어?", category: "faith" },
  { text: "신앙 모임에서 맡기 싫은 역할을 피하려고 핑계를 댄 적 있어?", category: "faith" },
  { text: "신앙 얘기를 할 때 실제보다 더 모범적인 사람처럼 말한 적 있어?", category: "faith" },

  { text: "썸 상대가 답장을 늦게 하면 나도 일부러 늦게 보내는 편이야?", category: "love" },
  { text: "연애 초반에 잘 보이려고 하다가 나중에 감당 안 된 행동은?", category: "love" },
  { text: "호감 없는 사람에게 연락이 오면 직접 거절해, 바쁘다는 핑계를 대?", category: "love" },
  { text: "연인의 과거, 어디까지 알고 싶어?", category: "love" },
  { text: "관심 없는 척했는데 질투하는 티가 나버린 적 있어?", category: "love" },
  { text: "짝사랑하다 포기한 경험이 있어?", category: "love" },
  { text: "나에게 '이건 바람이다' 싶은 기준은?", category: "love" },
  { text: "썸이 흐지부지된 진짜 이유, 뭐였던 것 같아?", category: "love" },

  { text: "처음 만난 사람에게 잘 보이려고 살짝 부풀린 내 소개는?", category: "tmi" },
  { text: "단체 사진에서 나만 잘 나온 사진을 올리고 싶었던 적 있어?", category: "tmi" },
  { text: "아는 척했다가 추가 질문에 당황한 적 있어?", category: "tmi" },
  { text: "거짓말했다가 들킨 경험이 있다면?", category: "tmi" },
  { text: "주변에 은근히 질투 나는 사람이 있어?", category: "tmi" },
  { text: "친구에게 센스 있다고 칭찬받았지만 사실 남을 따라 한 게 있어?", category: "tmi" },
  { text: "사람들 앞에서 '괜찮은 척', '착한 척' 해본 적 솔직히 있어? 언제였어?", category: "tmi" },
  { text: "관심 있는 사람의 공개 SNS를 한참 구경하다 좋아요를 누를 뻔한 적 있어?", category: "tmi" },

  { text: "덕질에 쓴 돈, 솔직히 총 얼마쯤 될 것 같아?", category: "hobby" },
  { text: "취미 때문에 사람들과 갈등한 적 있어?", category: "hobby" },
  { text: "새 취미를 시작했다고 자랑했는데 금방 그만둬서 숨긴 적 있어?", category: "hobby" },
  { text: "덕질하다 현타 온 적 있어?", category: "hobby" },
  { text: "취미 모임에서 실력보다 잘한다고 뻥쳤다가 즉석 시범을 요청받은 적 있어?", category: "hobby" },
  { text: "연인이 내 최애나 취미를 대놓고 별로라고 하면, 솔직히 정 떨어질 것 같아?", category: "hobby" },
  { text: "혼자 즐기다가 누가 들어오면 황급히 끄는 취미 영상이 있어?", category: "hobby" },
  { text: "최애와 연인 중 한쪽을 포기해야 한다면? 솔직하게!", category: "hobby" },

  { text: "솔직한 조언을 구해놓고 듣기 좋은 말만 기다린 적 있어?", category: "deep" },
  { text: "멋진 말을 하려다가 오히려 허세처럼 들렸던 적 있어?", category: "deep" },
  { text: "친한 사람의 부탁이 부담스러운데 바쁘다는 말로만 피한 적 있어?", category: "deep" },
  { text: "내 잘못인 걸 알면서도 끝까지 우겨본 적 있어?", category: "deep" },
  { text: "가까운 사람의 조언이 맞는데 자존심 때문에 반대로 해본 적 있어?", category: "deep" },
  { text: "내가 실패하길 바랐던 사람의 성공을 축하하는 척한 적 있어?", category: "deep" },
  { text: "솔직히 돈만 충분하면 사랑은 없어도 살 수 있을 것 같아?", category: "deep" },
  { text: "혼자 있고 싶어서 약속을 거절한 뒤 SNS를 보고 부러워한 적 있어?", category: "deep" },

  { text: "여행 중 모르는 걸 아는 척하다 길이나 주문을 망친 적 있어?", category: "travel" },
  { text: "함께 여행 갔다가 정 떨어진 사람 있어?", category: "travel" },
  { text: "여행 사진, 실제보다 훨씬 좋아 보이게 '연출'해서 올린 적 있어?", category: "travel" },
  { text: "회사(학교)에 다른 핑계 대고 몰래 여행 간 적 있어?", category: "travel" },
  { text: "여행 중 혼자 쉬고 싶었는데 동행 눈치 보느라 못 말한 적 있어?", category: "travel" },
  { text: "여행 경비, 한 번에 가장 많이 써본 액수는?", category: "travel" },
  { text: "여행 후기를 쓰면서 실제로 안 해본 경험을 해본 듯 말한 적 있어?", category: "travel" },
  { text: "여행지에서 만난 사람에게 평소보다 멋있는 척한 적 있어?", category: "travel" },

  { text: "혼자 몰래 시켜 먹고 가족(룸메)한테 증거 인멸한 적 있어?", category: "food" },
  { text: "데이트나 소개팅에서 상대가 고른 식당이 별로였던 적 있어? 티 냈어?", category: "food" },
  { text: "남겨둔 간식을 몰래 먹고 모르는 척한 적 있어?", category: "food" },
  { text: "직접 요리해준 친구에게 간이 안 맞는다고 말할 수 있어? 실제로 말해본 적은?", category: "food" },
  { text: "'이 사람이랑은 밥 같이 먹기 힘들다' 싶었던 식습관이 있어?", category: "food" },
  { text: "모임 메뉴 정할 때 속으로는 싫은데 '다 좋아요' 한 적 있어? 진짜 먹고 싶었던 건?", category: "food" },
  { text: "식사 예절을 잘 아는 척하다 오히려 민망해진 적 있어?", category: "food" },
  { text: "남들 앞에서 안 먹는 척했던 음식이 있어?", category: "food" },

  { text: "어릴 때 형제나 친구한테 누명 씌우고 모른 척한 적 있어?", category: "memory" },
  { text: "어릴 때 친구와 다툰 뒤 먼저 사과하기 싫어서 끝까지 버틴 적 있어?", category: "memory" },
  { text: "어릴 때 혼날까 봐 망가진 물건을 숨겼다가 들킨 적 있어?", category: "memory" },
  { text: "첫사랑, 지금은 어떻게 됐는지 알아?", category: "memory" },
  { text: "어릴 때 용돈을 어디에 썼는지 다르게 말한 적 있어?", category: "memory" },
  { text: "예전에 쓴 허세 가득한 자기소개를 지금 읽는다면 어떤 부분이 민망할까?", category: "memory" },
  { text: "어릴 때 친구들한테 멋있어 보이려고 부렸던 제일 웃긴 허세는?", category: "memory" },
  { text: "어릴 때 다 아는 유행인 척했는데 사실 전혀 몰랐던 게 있어?", category: "memory" },

  { text: "지지하는 정치 성향을 주변에 밝히는 편이야?", category: "politics" },
  { text: "정치 얘기 중 분위기 때문에 내 의견을 바꿔 말한 적 있어?", category: "politics" },
  { text: "나와 반대되는 정치·사회 의견 중에 '그 말도 일리 있다' 싶었던 게 있어?", category: "politics" },
  { text: "호감 있던 정치인의 말 중 차마 주변에 옹호하지 못한 게 있어? 이름은 빼고 말해줘.", category: "politics" },
  { text: "세금을 더 내더라도 늘렸으면 하는 복지가 있어? 솔직히 얼마까지 더 낼 수 있어?", category: "politics" },
  { text: "가장 공감되지 않는 사회 통념이 있다면?", category: "politics" },
  { text: "잘 모르는 사회 이슈에 아는 척했다가 질문을 받고 당황한 적 있어?", category: "politics" },
  { text: "친한 친구가 나와 정치 성향이 완전히 반대라는 걸 알게 되면 관계가 달라질 것 같아?", category: "politics" },

  { text: "투자로 가장 크게 벌었거나 잃었던 경험이 있어?", category: "invest" },
  { text: "지금 자산의 대부분은 어디에 들어가 있어?", category: "invest" },
  { text: "수익을 자랑하는 친구 앞에서 내 손실을 숨긴 적 있어?", category: "invest" },
  { text: "솔직히 지금 통장 잔고, 만족스러운 편이야?", category: "invest" },
  { text: "돈 때문에 사람과 틀어진 경험이 있어?", category: "invest" },
  { text: "투자할 때 남의 성공담을 따라 했다가 인정하기 민망했던 적 있어?", category: "invest" },
  { text: "친구가 큰돈을 빌려달라면 얼마까지 빌려줄 수 있어?", category: "invest" },
  { text: "해보지도 않은 투자 상품을 잘 아는 척한 적 있어?", category: "invest" },
  { text: "가격이 오를 거라며 산 물건인데 팔기 아까워서 투자인 척 계속 갖고 있는 게 있어?", category: "invest" },
  { text: "연인에게 나 몰래 빚이 있었다는 걸 알게 되면 어디까지 이해할 수 있어?", category: "invest" },

  { text: "지금 회사(학교) 몰래 이직(편입) 준비해본 적 있어? 혹시 지금도?", category: "work" },
  { text: "회사(학교)에서 했던 가장 민망한 실수는?", category: "work" },
  { text: "같이 일하기(조별과제) 제일 힘들었던 유형은?", category: "work" },
  { text: "연봉을 2배 준다면 제일 불편한 사람이랑 1년 일할 수 있어?", category: "work" },
  { text: "퇴사(자퇴)하고 싶다고 제일 크게 느꼈던 순간은?", category: "work" },
  { text: "상사나 교수님한테 하고 싶었지만 못 한 말이 있다면?", category: "work" },
  { text: "회사(학교)에서 못 들은 척하고 넘어간 부탁이 있어?", category: "work" },
  { text: "업무나 공부에서 모르는 걸 들킬까 봐 질문을 못 한 적 있어?", category: "work" },

  { text: "대화에 끼려고 안 본 작품을 본 척한 적 있어?", category: "content" },
  { text: "친구나 연인이 강력 추천해서 봤는데 솔직히 별로였던 작품, 그 사람한테 뭐라고 했어?", category: "content" },
  { text: "남들한테 말하기 좀 부끄러운 길티 플레저 콘텐츠가 있어?", category: "content" },
  { text: "드라마 주인공 중 현실에서 만나면 절대 못 사귈 것 같은 캐릭터는?", category: "content" },
  { text: "드라마 속 삼각관계를 보면서 '나라도 저럴 수 있겠다' 싶었던 적 있어?", category: "content" },
  { text: "영상 추천 화면을 다른 사람에게 보여줄 때 황급히 숨긴 주제가 있어?", category: "content" },
  { text: "로맨스 작품을 보고 따라 했다가 현실에서는 어색했던 행동은?", category: "content" },
  { text: "'딱 한 편만' 보다가 약속이나 마감을 날려먹은 적 있어?", category: "content" },

  { text: "휴가 날짜를 친구에게 맞추겠다고 해놓고 내 편한 날로 슬쩍 유도한 적 있어?", category: "season" },
  { text: "비 오는 날 우산 없는 썸 상대를 만나면 같이 쓰자고 말할 용기 있어?", category: "season" },
  { text: "가을이라 외롭다고 한 말을 누군가가 고백으로 오해한다면 뭐라고 할래?", category: "season" },
  { text: "더운 날 땀 때문에 민망했는데 아닌 척한 적 있어?", category: "season" },
  { text: "크리스마스에 약속 있는 척해본 적 있어? 실제로는 뭘 했어?", category: "season" },
  { text: "비 오는 날 감성적인 글을 올렸다가 다음 날 지운 적 있어?", category: "season" },
  { text: "벚꽃이나 첫눈을 핑계로 둘이 만나자고 했다가 모임이 돼버린 적 있어?", category: "season" },
  { text: "휴가나 연말 계획, 남들한테 실제보다 부풀려 말해본 적 있어?", category: "season" },

  { text: "집에 사람을 못 부르는 진짜 이유가 있다면? (방 상태 포함)", category: "place" },
  { text: "전 연인과의 추억 때문에 일부러 피하는 동네나 장소가 있어?", category: "place" },
  { text: "가족·룸메이트와 같이 살면서 제일 참기 힘들었던 순간은?", category: "place" },
  { text: "동네에서 아는 사람을 마주쳐서 민망했던 적 있어?", category: "place" },
  { text: "연인이 '나중에 내 고향(시골)에 내려가서 살자'고 하면 따라갈 수 있어?", category: "place" },
  { text: "단골 가게에서 아는 척해주길 기대했다가 못 알아봐서 머쓱했던 적 있어?", category: "place" },
  { text: "이웃 때문에 스트레스받았던 경험이 있어?", category: "place" },
  { text: "집 앞 편의점 갈 때, 아는 사람 만나면 절대 안 되는 내 차림새는?", category: "place" },

  { text: "솔직히 남의 반려동물이 별로 안 귀여웠는데 귀여운 척한 적 있어?", category: "pet" },
  { text: "반려동물과 친한 척 다가갔다가 외면당해 머쓱했던 적 있어?", category: "pet" },
  { text: "반려동물에게 한 말을 누가 들으면 가장 민망할 것 같아?", category: "pet" },
  { text: "반려동물 사진·영상으로 단톡방 도배하다 눈치 받은 적 있어?", category: "pet" },
  { text: "연인이 내 반려동물을 싫어한다면 어떻게 할래?", category: "pet" },
  { text: "반려동물에게 쓰는 애칭이나 말투를 실수로 사람에게 쓴 적 있어?", category: "pet" },
  { text: "남의 반려동물에게 줄 간식을 고르며 가격을 보고 슬쩍 바꾼 적 있어?", category: "pet" },
  { text: "동물을 키우는 사람과 안 키우는 사람, 연애 상대로는 솔직히 어느 쪽이 편해?", category: "pet" },

  { text: "연인이나 룸메이트가 내 습관 중에 제일 질색할 것 같은 건?", category: "habit" },
  { text: "휴대폰을 적게 쓴다고 했는데 사용 시간 화면을 보여달라면 어떡할래?", category: "habit" },
  { text: "운동·공부 인증샷만 찍고 실제로는 거의 안 한 적 있어?", category: "habit" },
  { text: "늦잠을 잔 날 준비를 다 했다고 거짓말한 적 있어?", category: "habit" },
  { text: "남들이 알면 놀랄 만한 나만의 이상한 루틴이 있어?", category: "habit" },
  { text: "미루는 버릇 때문에 후회했던 가장 큰 순간은?", category: "habit" },
  { text: "하루 목표를 다 못 했는데 기록에는 완료로 표시한 적 있어?", category: "habit" },
  { text: "반복해서 늦는 친구에게 지적받으면 내 지각 버릇을 인정할 수 있어?", category: "habit" },

  { text: "충동구매로 가장 크게 후회한 물건은?", category: "shop" },
  { text: "잘 안 쓰는 유료 구독을 유지하는 이유를 가족이나 친구에게 둘러댄 적 있어?", category: "shop" },
  { text: "산 물건 가격을 가족이나 연인한테 깎아서 말한 적 있어? 얼마나?", category: "shop" },
  { text: "친구랑 똑같은 물건 산 걸 알고 몰래 환불하거나 안 쓴 적 있어?", category: "shop" },
  { text: "친구와 같이 산 물건이 나한테만 할인된 걸 알면 할인액을 나눌래, 모른 척할래?", category: "shop" },
  { text: "솔직히 '남들 시선' 때문에 비싼 걸 산 적 있어?", category: "shop" },
  { text: "받은 선물을 몰래 중고로 팔거나 다른 사람한테 선물한 적 있어?", category: "shop" },
  { text: "한 번에 가장 비싸게 지른 물건과 그 이유는?", category: "shop" },

  { text: "친구가 시험을 망쳤다는데 혼자 잘 봐서 점수를 낮춰 말한 적 있어?", category: "school" },
  { text: "학창 시절에 짝사랑이나 썸이 있었어? 결말은 어땠어?", category: "school" },
  { text: "모둠 활동에서 친한 친구 말고 더 유능한 친구를 고른 적 있어?", category: "school" },
  { text: "숙제를 안 해놓고 집에 두고 왔다고 한 적 있어?", category: "school" },
  { text: "학창 시절에 나를 좋아했던 친구가 있었다는 걸 나중에 알게 된 적 있어?", category: "school" },
  { text: "학창 시절 성적이 올랐다고 집에 과장해서 말한 적 있어?", category: "school" },
  { text: "친구 고백 편지를 대신 써주거나 전달해준 적 있어? 결말은?", category: "school" },
  { text: "학교 행사에서 나서기 싫어서 못하는 척한 적 있어?", category: "school" },

  { text: "내 오늘 속마음 중 딱 한 문장이 모임 단톡방에 전송된다면 어떤 내용이 제일 곤란해?", category: "silly" },
  { text: "내가 눈치 없었던 순간을 스포츠 중계처럼 해설한다면 가장 민망한 장면은?", category: "silly" },
  { text: "내 허세를 광고 문구로 만든다면 어떤 과장이 들어갈까?", category: "silly" },
  { text: "내 소개팅을 친구들이 실시간 해설한다면 가장 많이 놀릴 행동은?", category: "silly" },
  { text: "친구들이 내 말에 세 번까지 진실 확인 질문을 할 수 있다면 어떤 말부터 들킬까?", category: "silly" },
  { text: "모임에서 혼자 속으로 매기고 있던 점수가 공개된다면 어떤 점수가 제일 민망해?", category: "silly" },
  { text: "내 사교성을 제품 설명서로 쓴다면 어떤 단점이 작은 글씨로 적힐까?", category: "silly" },
  { text: "내 변명을 자동 교정하는 앱이 있다면 가장 자주 고쳐질 문장은?", category: "silly" },

  { text: "고마운 일을 받고도 귀찮아서 답장을 미룬 적 있어?", category: "thanks" },
  { text: "칭찬인 줄 알았는데 사실 기분 나빴던 말이 있어?", category: "thanks" },
  { text: "이 자리 사람 중 첫인상은 어려웠는데 지금은 편해진 사람이 있다면? 이유는?", category: "thanks" },
  { text: "내가 한 만큼 고마워해주지 않아서 속으로 점수를 깎은 적 있어?", category: "thanks" },
  { text: "칭찬받고 싶어서 일부러 티 낸 적 있어? 뭘로?", category: "thanks" },
  { text: "겸손한 척했지만 사실 자랑하고 싶었던 순간은?", category: "thanks" },
  { text: "정성 들인 선물에 친구가 고맙다는 말보다 가격 질문부터 하면 티 안 낼 수 있어?", category: "thanks" },
  { text: "사과를 받으면서도 속으로는 한마디 더 듣고 싶었던 적 있어?", category: "thanks" }
];

const hotQuestions = [
  { text: "오늘 여기서 서로의 호감을 딱 한 번 확인할 수 있다면 누구의 마음을 알고 싶어?", category: "imagine" },
  { text: "내 연애 메시지 한 줄이 공개된다면 가장 들키기 싫은 건 누구에게 보낸 어떤 내용이야? 이름은 빼고 말해줘.", category: "imagine" },
  { text: "전 애인이 이 모임에 온다면 현 연인에게 가장 숨기고 싶은 과거는?", category: "imagine" },
  { text: "내 검색 기록에서 전 애인이나 스킨십 관련 검색 하나를 공개한다면?", category: "imagine" },
  { text: "내가 오늘 여기서 느낀 끌림이 점수로 뜬다면 누구 앞에서 가장 곤란할까?", category: "imagine" },
  { text: "솔직히 이 자리에서 외모가 제일 내 취향인 사람은?", category: "favorite" },
  { text: "이상형에 가까운 사람을 만났는데 연애 중이었다면 마음을 어디까지 숨길 수 있을까?", category: "favorite" },
  { text: "연인에게도 말하기 망설여지는 스킨십 취향이나 로망이 있어?", category: "favorite" },
  { text: "끌리는 사람에게서 가장 섹시하다고 느끼는 의외의 포인트는?", category: "favorite" },
  { text: "친구와 만난다고 해놓고 사실은 썸 상대나 전 애인을 만난 적 있어?", category: "daily" },
  { text: "누군가의 공개 SNS를 보다가 현 연인과 비교하며 마음이 흔들린 적 있어?", category: "daily" },
  { text: "연인에게는 피곤해서 잔다고 하고 다른 사람과 밤늦게 연락한 적 있어?", category: "daily" },
  { text: "휴대폰에 남은 전 애인 사진 중 현 연인에게도 삭제하기 싫다고 말할 수 있는 건?", category: "daily" },
  { text: "새로운 사람과 잘돼가는 중에 전 애인에게 연락이 오면 몰래 답장할 것 같아?", category: "daily" },
  { text: "공동체에서 좋은 이미지를 지키려고 연애 사실이나 이별 이유를 숨긴 적 있어?", category: "faith" },
  { text: "호감 있는 사람과 가까워지려고 신앙 모임의 자리나 역할을 고른 적 있어?", category: "faith" },
  { text: "공동체 안에서 마음에 둔 사람이 친구와 가까워져서 질투한 적 있어?", category: "faith" },
  { text: "신앙이 잘 맞아서 만난 사람과 스킨십 기준이 다르다면 관계를 계속할 수 있어?", category: "faith" },
  { text: "연애를 반대하는 공동체 사람에게 솔직히 말하기와 비밀로 만나기 중 어느 쪽을 택할래?", category: "faith" },
  { text: "지금까지의 연애 중 사랑보다 외로움 때문에 시작했다고 인정할 수 있는 관계는?", category: "love" },
  { text: "전 애인 중에 아직도 가끔 생각나는 사람 있어? 왜?", category: "love" },
  { text: "헤어진 연인 SNS를 몰래 들어가 본 적 있어? 마지막으로 본 게 언제야?", category: "love" },
  { text: "여러 사람의 호감을 동시에 붙잡아두려고 관계를 일부러 애매하게 만든 적 있어?", category: "love" },
  { text: "친구의 연인이나 친구의 전 애인한테 설렌 적 있어?", category: "love" },
  { text: "술기운을 핑계로 전 애인에게 연락한 적 있어? 어떤 답을 기대했어?", category: "love" },
  { text: "기억에 남는 키스는 설렘 때문이야, 어색함 때문이야? 상대 이름 없이 말해줘.", category: "love" },
  { text: "연인에게 휴대폰을 보여달라고 요구할 만큼 의심했던 일은?", category: "love" },
  { text: "이 자리에 있는 사람 중 사귈 수 있다면 누구랑 사귀어 볼래?", category: "love" },
  { text: "썸을 끝낼 때 진짜 이유가 다른 사람에게 더 끌려서였던 적 있어?", category: "love" },
  { text: "전 애인의 새 연인을 보고 솔직히 내가 더 낫다고 비교한 적 있어?", category: "love" },
  { text: "마음 없는 사람에게 비싼 선물을 받고 썸인 척한 적 있어?", category: "love" },
  { text: "이 자리에 있는 사람에게 먹힐 것 같은 내 플러팅 방식은?", category: "tmi" },
  { text: "나와 가까워진 사람이 알면 놀랄 만한 연애 중 내 모습은?", category: "tmi" },
  { text: "연애에서 질투를 유도하려고 다른 사람에게 받은 호감을 과장한 적 있어?", category: "tmi" },
  { text: "겉으로 말한 연애 기준과 실제 끌리는 상대의 조건이 가장 다른 부분은?", category: "tmi" },
  { text: "연애가 끝난 뒤에도 상대가 나를 그리워하도록 일부러 남겨둔 흔적은?", category: "tmi" },
  { text: "최애에게 끌리는 포인트를 연인이 따라 하면 설렐까, 오히려 깰까?", category: "hobby" },
  { text: "연인 기념일보다 최애 관련 소비에 더 큰돈을 쓴 적 있어? 들키면 뭐라고 할래?", category: "hobby" },
  { text: "연인이 있는 상태에서 취미 모임 사람에게 설렌다면 모임을 계속 나갈래?", category: "hobby" },
  { text: "연인이 취미 모임의 특정 사람과만 연락을 줄여달라면 진짜 이유를 털어놓을 수 있어?", category: "hobby" },
  { text: "이 자리에 있는 사람에게 질투해서 일부러 거리를 둔 적 있어? 무엇이 질투 났어?", category: "deep" },
  { text: "헤어진 이유를 전부 내 탓 없이 설명했지만 사실 숨긴 내 잘못이 있어?", category: "deep" },
  { text: "지금 연애 상대가 알면 관계가 달라질까 봐 숨기는 연애 조건이나 과거가 있어? 말할 수 있는 선에서.", category: "deep" },
  { text: "사랑은 식었지만 상대의 돈이나 생활 편의 때문에 헤어지지 못한 적 있어?", category: "deep" },
  { text: "절친과 같은 사람에게 끌린다면 우정을 위해 물러날 수 있어? 이미 썸이 시작됐다면?", category: "deep" },
  { text: "연인과 헤어질 준비를 하면서 다른 사람의 호감을 확인해본 적 있어?", category: "deep" },
  { text: "연인과 여행 중 비용 부담 차이 때문에 속으로 상대를 계산적으로 본 적 있어?", category: "travel" },
  { text: "여행지에서 처음 만난 사람과 키스해본 적 있어? 그 뒤엔 어떻게 됐어?", category: "travel" },
  { text: "이 자리에 있는 사람 중 둘이 여행하면 친구 이상으로 끌릴 것 같은 사람은?", category: "travel" },
  { text: "여행에서 생긴 로맨스를 동행에게 숨긴 적 있어? 있다면 왜 숨겼어?", category: "travel" },
  { text: "연인과 간 고급 식당에서 멋있어 보이려고 무리한 금액을 결제한 적 있어?", category: "food" },
  { text: "술자리에서 호감 가는 사람에게 어느 정도까지 먼저 다가가본 적 있어?", category: "food" },
  { text: "데이트 식사 중 전 애인과 비교하는 말을 듣는다면 어떤 비교가 가장 자존심 상할까?", category: "food" },
  { text: "상대가 데이트 식사비를 내줄 거라고 기대해서 호감을 더 보인 적 있어?", category: "food" },
  { text: "어릴 때 알던 친구를 성인이 되어 다시 만난 뒤 친구 이상으로 끌린 적 있어?", category: "memory" },
  { text: "옛 연애편지나 기록을 현 연인과 같이 읽는다면 어떤 문장부터 가리고 싶어?", category: "memory" },
  { text: "옛날에 꿈꾸던 배우자 조건 중 지금 연인에게는 차마 말 못 할 조건은?", category: "memory" },
  { text: "가장 설렜던 추억이 전 애인과의 일이라면 현 연인에게도 솔직히 말할 수 있어?", category: "memory" },
  { text: "연인의 정치적 가치관이 마음에 안 들어도 재력이나 끌림 때문에 눈감아줄 수 있어?", category: "politics" },
  { text: "모임에서 호감 가는 사람과 가까워지려고 정치 의견을 맞춰준 적 있어?", category: "politics" },
  { text: "연인이 내 정치 성향을 부끄러워해서 지인 앞에서 숨겨달라고 하면 받아들일래?", category: "politics" },
  { text: "내 경제적 이익과 평소 주장한 사회적 가치가 충돌하면 실제로는 어느 쪽을 고를 것 같아?", category: "politics" },
  { text: "결혼을 생각하는 상대에게 자산과 빚 중 어느 쪽을 밝히는 게 더 망설여져? 이유는?", category: "invest" },
  { text: "투자 손실을 연인에게 숨긴다면 얼마쯤부터는 반드시 말해야 한다고 생각해?", category: "invest" },
  { text: "친구가 연애 상대의 재산 때문에 결혼을 결심했다고 하면 솔직히 부러울 것 같아?", category: "invest" },
  { text: "연애 상대에게 잘 보이려고 수입이나 자산을 부풀려 말한 적 있어?", category: "invest" },
  { text: "내 이상형과 월수입이 내 세 배인 사람 중 결혼 상대로 더 흔들리는 쪽은?", category: "invest" },
  { text: "상사나 동료의 호감을 업무상 이득으로 이용한 적 있어? 없다면 어디까지 가능할 것 같아?", category: "work" },
  { text: "직장 사람에게 끌리는데 나나 상대에게 연인이 있다면 사적인 연락을 끊을 수 있어?", category: "work" },
  { text: "사내연애가 들키면 가장 곤란할 장면은? 비밀로 만난다고 가정해도 좋아.", category: "work" },
  { text: "나를 좋아하는 동료와 전 애인 중 한 명과 매일 단둘이 일해야 한다면 누구를 택할래?", category: "work" },
  { text: "연인의 승진을 위해 내가 원하는 직장이나 기회를 포기할 수 있어? 반대의 경우도 같아?", category: "work" },
  { text: "성인 로맨스 장면을 보며 연인에게 제안해보고 싶었던 분위기나 스킨십이 있어?", category: "content" },
  { text: "연인과 함께 보기 민망할 만큼 내 은밀한 취향이 드러나는 작품은?", category: "content" },
  { text: "전 애인과 함께 나오는 연애 프로그램에 출연한다면 출연료 얼마부터 고민할래?", category: "content" },
  { text: "드라마 속 불륜 관계를 보며 실제 내 마음이 흔들렸던 상황이 떠오른 적 있어?", category: "content" },
  { text: "여름휴가를 연인과 둘이 가는 줄 알았는데 친구 커플과 같은 방을 쓰자면 괜찮아?", category: "season" },
  { text: "크리스마스에 혼자 있기 싫어서 마음 없는 사람과 만날 약속을 잡은 적 있어?", category: "season" },
  { text: "연말 모임에서 술기운을 핑계로 숨겨둔 호감을 드러낸 적 있어?", category: "season" },
  { text: "연말 모임에서 연인이 남들 앞에서 해줬으면 하는 가장 과감한 애정 표현은?", category: "season" },
  { text: "전 애인과 갔던 데이트 장소를 새로 찾은 곳처럼 현 연인에게 소개한 적 있어?", category: "place" },
  { text: "공개하고 싶지 않은 관계로 데이트하다 아는 사람을 만나면 어떻게 소개할래?", category: "place" },
  { text: "지금 이 자리 사람 한 명과 비밀 데이트를 한다면 어디서 만나고 싶어?", category: "place" },
  { text: "연인 집에 전 애인의 흔적이 있다면 어떤 물건까지는 남겨둬도 괜찮아?", category: "place" },
  { text: "연인이 내 반려동물에게 전 애인과 지은 애칭을 계속 쓴다면 신경 쓰일까?", category: "pet" },
  { text: "공동으로 돌보던 반려동물 때문에 전 애인과 계속 연락하는 연인을 받아들일 수 있어?", category: "pet" },
  { text: "연인에게만 쓰는 동물 흉내나 애교가 있다면 어느 상황에서 가장 과감해져?", category: "pet" },
  { text: "연인과 스킨십하려는데 반려동물이 계속 끼어들면 둘만의 시간을 어떻게 만들래?", category: "pet" },
  { text: "연인과 함께 살면 혼자일 때의 어떤 은밀한 시간을 가장 지키고 싶어?", category: "habit" },
  { text: "데이트 전에 꼭 챙기는 스킨십 준비가 있어? 말할 수 있는 선에서.", category: "habit" },
  { text: "평소 연락 습관 중 연인에게 들키면 플러팅으로 오해받을 만한 행동은?", category: "habit" },
  { text: "전 애인과의 스킨십 습관이 현 연인에게도 무심코 나온 적 있어?", category: "habit" },
  { text: "숨겨둔 고액 소비 하나를 들키면 연인에게 가격과 산 이유 중 뭘 더 말하기 어려울까?", category: "shop" },
  { text: "전 애인에게 받은 선물을 현 연인과 함께 쓰고 있다면 출처를 말할 수 있어?", category: "shop" },
  { text: "연애 상대의 명품이 가품이라는 걸 알면 끌림이 줄어들 것 같아? 솔직히!", category: "shop" },
  { text: "연인이 선물 가격을 찾아본 걸 알면 서운할까, 나도 그러니 이해할까?", category: "shop" },
  { text: "성인이 되어 다시 만난 동창과 비밀 연애를 한다면 누구에게 가장 먼저 들킬 것 같아?", category: "school" },
  { text: "동창회에서 내 연애사를 가장 잘 아는 친구가 입을 열면 어떤 얘기부터 막고 싶어?", category: "school" },
  { text: "성인 동창 모임에서 첫사랑의 재력을 알게 되면 현 연인과 비교할 것 같아?", category: "school" },
  { text: "성인이 된 첫사랑에게 다시 고백할 기회가 온다면, 미련과 자존심 중 뭐가 이길까?", category: "school" },
  { text: "성인 동창 모임에서 현 연인에게 소개하기 가장 껄끄러운 사람은 어떤 관계였어?", category: "school" },
  { text: "내 플러팅에 암호를 정한다면 지금 키스하고 싶다는 말을 어떤 엉뚱한 말로 전할래?", category: "silly" },
  { text: "이 모임을 연애 프로그램으로 만든다면 누구와 첫 커플 미션을 하고 싶어?", category: "silly" },
  { text: "내 성인 연애사를 영화로 만든다면 가장 과감한 예고편 대사는?", category: "silly" },
  { text: "전 애인들의 솔직한 후기를 한 줄씩 받는다면 내 연애에 어떤 경고가 붙을까?", category: "silly" },
  { text: "이 자리에서 누군가에게 반했다면 어떤 매력을 가장 먼저 칭찬해서 티 낼래?", category: "thanks" },
  { text: "전 애인에게 지금 고맙다고 한다면 그리움으로 오해받아도 전하고 싶은 말이 있어?", category: "thanks" },
  { text: "친구 이상으로 좋아하게 된 사람에게 고맙다는 말로만 마음을 숨긴 적 있어?", category: "thanks" },
  { text: "전 애인이 칭찬해준 내 매력을 현 연인에게도 확인받고 싶었던 적 있어?", category: "thanks" }
];

const questions = [
  ...mildQuestions.map((q) => ({ ...q, spice: "mild" })),
  ...mediumQuestions.map((q) => ({ ...q, spice: "medium" })),
  ...hotQuestions.map((q) => ({ ...q, spice: "hot" }))
];

/* ===== ⚖️ 밸런스게임 모드 데이터 ({a, b, category, spice}) ===== */
const balanceCategories = {
  food: { label: "🍜 음식" },
  love: { label: "💘 연애" },
  work: { label: "💼 직장 & 돈" },
  power: { label: "🦸 초능력 & 상상" },
  life: { label: "🌀 일상 & 극한 상황" },
  weird: { label: "🤪 엽기 & 괴식" },
  travel: { label: "✈️ 여행 & 휴가" },
  friends: { label: "🤝 친구 & 인간관계" },
  school: { label: "🏫 학교 & 추억" },
  tech: { label: "📱 테크 & SNS" },
  home: { label: "🏠 집 & 생활" },
  media: { label: "🎬 영화 & 음악" },
  body: { label: "💪 운동 & 외모" },
  family: { label: "👪 가족 & 결혼" }
};

const balanceItems = [
  { a: "짜장면만 평생 먹기", b: "짬뽕만 평생 먹기", category: "food", spice: "mild" },
  { a: "치킨만 평생 먹기", b: "피자만 평생 먹기", category: "food", spice: "mild" },
  { a: "탕수육은 부먹", b: "탕수육은 찍먹", category: "food", spice: "mild" },
  { a: "라면은 꼬들꼬들한 면", b: "라면은 푹 퍼진 면", category: "food", spice: "mild" },
  { a: "평생 라면 금지", b: "평생 커피 금지", category: "food", spice: "mild" },
  { a: "아침은 밥으로 든든하게", b: "아침은 빵과 커피로 간단하게", category: "food", spice: "mild" },
  { a: "떡볶이는 쌀떡", b: "떡볶이는 밀떡", category: "food", spice: "mild" },
  { a: "평생 간식은 달콤한 맛만 먹기", b: "평생 간식은 짭짤한 맛만 먹기", category: "food", spice: "mild" },
  { a: "혼자 먹는 맛집 투어", b: "친구랑 먹는 평범한 한 끼", category: "food", spice: "mild" },
  { a: "한겨울에 시원한 냉면", b: "한여름에 뜨끈한 국밥", category: "food", spice: "mild" },

  { a: "내가 먼저 고백하기", b: "고백받을 때까지 기다리기", category: "love", spice: "mild" },
  { a: "평일마다 짧게 만나는 연인", b: "주말마다 길게 만나는 연인", category: "love", spice: "mild" },
  { a: "데이트는 집에서 넷플릭스", b: "데이트는 밖에서 액티비티", category: "love", spice: "mild" },
  { a: "기념일을 칼같이 챙기는 연인", b: "평소에 작은 선물을 자주 주는 연인", category: "love", spice: "mild" },
  { a: "말은 무뚝뚝해도 행동으로 챙겨주는 사람", b: "행동은 서툴러도 표현은 잘해주는 사람", category: "love", spice: "mild" },
  { a: "같이 있으면 많이 웃게 되는 사람", b: "같이 있으면 마음이 차분해지는 사람", category: "love", spice: "mild" },
  { a: "친구 같은 편안한 연인", b: "볼 때마다 설레는 연인", category: "love", spice: "mild" },
  { a: "여행 계획을 다 짜주는 연인", b: "즉흥 여행을 이끄는 연인", category: "love", spice: "mild" },
  { a: "썸을 오래 타는 설렘", b: "바로 사귀는 확실함", category: "love", spice: "mild" },
  { a: "연인이 써주는 손편지", b: "연인이 준비한 깜짝 이벤트", category: "love", spice: "mild" },

  { a: "돈 많은 백수로 살기", b: "바쁘지만 즐거운 직업으로 살기", category: "work", spice: "mild" },
  { a: "인기 많은 삶", b: "돈 많은 삶", category: "work", spice: "mild" },
  { a: "퇴근은 칼같이 하는 회사", b: "월급이 더 많지만 야근이 잦은 회사", category: "work", spice: "mild" },
  { a: "월급은 적지만 사람이 좋은 회사", b: "월급은 많지만 분위기가 삭막한 회사", category: "work", spice: "mild" },
  { a: "주 4일 근무에 월급 80%", b: "주 5일 근무에 월급 100%", category: "work", spice: "mild" },
  { a: "점심시간 두 시간에 한 시간 늦게 퇴근하기", b: "점심시간 한 시간에 제시간에 퇴근하기", category: "work", spice: "mild" },
  { a: "평생 재택근무", b: "집 앞 사무실로 평생 출근", category: "work", spice: "mild" },
  { a: "보너스 매달 10만 원씩 받기", b: "보너스 연말에 120만 원 받기", category: "work", spice: "mild" },
  { a: "한 직장에서 안정적으로 오래 일하기", b: "여러 직업을 옮겨 다니며 경험 쌓기", category: "work", spice: "mild" },
  { a: "회식이 아예 없는 회사", b: "복지가 빵빵하고 회식은 가끔 있는 회사", category: "work", spice: "mild" },

  { a: "과거로 돌아가기", b: "미래로 가보기", category: "power", spice: "mild" },
  { a: "어떤 문제든 답을 아는 능력", b: "어떤 운동이든 잘하는 능력", category: "power", spice: "mild" },
  { a: "하늘을 나는 능력", b: "순간이동 능력", category: "power", spice: "mild" },
  { a: "물 위를 걸을 수 있는 능력", b: "땅속을 헤엄칠 수 있는 능력", category: "power", spice: "mild" },
  { a: "시간을 멈추는 능력", b: "10초 전으로 되감는 능력", category: "power", spice: "mild" },
  { a: "모든 동물과 대화하기", b: "모든 외국어를 완벽하게 구사하기", category: "power", spice: "mild" },
  { a: "아무리 먹어도 배탈 나지 않는 능력", b: "조금만 자도 늘 개운한 능력", category: "power", spice: "mild" },
  { a: "원하는 꿈을 골라서 꾸는 능력", b: "한 번 본 건 전부 기억하는 능력", category: "power", spice: "mild" },
  { a: "평생 쓸 수 있는 공짜 비행기 티켓", b: "평생 쓸 수 있는 공짜 맛집 식사권", category: "power", spice: "mild" },
  { a: "용을 키우는 조련사 되기", b: "마법 지팡이를 쓰는 마법사 되기", category: "power", spice: "mild" },

  { a: "평생 여름인 곳에서 살기", b: "평생 겨울인 곳에서 살기", category: "life", spice: "mild" },
  { a: "1년 동안 배달 음식 금지", b: "1년 동안 택시 금지", category: "life", spice: "mild" },
  { a: "평생 아침형 인간", b: "평생 저녁형 인간", category: "life", spice: "mild" },
  { a: "샤워는 아침에", b: "샤워는 밤에", category: "life", spice: "mild" },
  { a: "카톡은 바로바로 답장하기", b: "카톡은 몰아서 답장하기", category: "life", spice: "mild" },
  { a: "주말은 집에서 푹 쉬기", b: "주말은 밖에서 신나게 놀기", category: "life", spice: "mild" },
  { a: "책 읽는 취미", b: "영상 보는 취미", category: "life", spice: "mild" },
  { a: "집을 고를 때 넓은 거실 택하기", b: "집을 고를 때 넓은 주방 택하기", category: "life", spice: "mild" },
  { a: "전화 통화로 대화하기", b: "문자로 대화하기", category: "life", spice: "mild" },
  { a: "에어컨 빵빵한 방에서 수박 먹기", b: "전기장판 위에서 귤 까먹기", category: "life", spice: "mild" },

  { a: "뉴스 앵커 목소리로 일상 대화하기", b: "만화 주인공 목소리로 일상 대화하기", category: "weird", spice: "mild" },
  { a: "아이스크림 맛 라면", b: "라면 맛 아이스크림", category: "weird", spice: "mild" },
  { a: "웃을 때마다 오리 소리 나기", b: "재채기할 때마다 사자 울음소리 나기", category: "weird", spice: "mild" },
  { a: "평생 말끝마다 '~냥' 붙이기", b: "평생 말끝마다 '~멍' 붙이기", category: "weird", spice: "mild" },
  { a: "걸을 때마다 효과음이 나는 몸", b: "말할 때마다 배경음악이 깔리는 삶", category: "weird", spice: "mild" },
  { a: "머리카락이 평생 형광 핑크색", b: "눈썹이 평생 없는 얼굴", category: "weird", spice: "mild" },
  { a: "신발을 신으면 발밑에 꽃이 피기", b: "모자를 쓰면 머리 위에 나비가 모이기", category: "weird", spice: "mild" },
  { a: "콜라에 말아 먹는 라면", b: "우유에 말아 먹는 김치볶음밥", category: "weird", spice: "mild" },
  { a: "팔이 두 배로 길어지기", b: "다리가 두 배로 길어지기", category: "weird", spice: "mild" },
  { a: "하루 종일 뒤로만 걷기", b: "하루 종일 게걸음으로만 걷기", category: "weird", spice: "mild" },

  { a: "식사비를 내가 내면 다음엔 잊어버리는 친구", b: "식사비를 친구가 내면 매번 생색내는 친구", category: "food", spice: "medium" },
  { a: "음식 사진 찍느라 매번 10분씩 못 먹게 하는 연인", b: "내가 추천한 맛집을 매번 별로라고 하는 연인", category: "food", spice: "medium" },
  { a: "소개팅에서 상대가 내 예전 맛집 허세 글을 읽었다고 하기", b: "소개팅에서 상대가 내 먹방 영상을 봤다고 하기", category: "food", spice: "medium" },
  { a: "연인이 내 앞에서 쩝쩝거리며 먹기", b: "연인이 내 음식을 매번 한 입씩 뺏어 먹기", category: "food", spice: "medium" },
  { a: "더치페이를 칼같이 하는 연인", b: "항상 사주지만 매번 생색내는 연인", category: "food", spice: "medium" },
  { a: "연인 부모님의 요리가 안 맞아도 한 그릇 다 먹기", b: "입맛이 다르다고 말하고 반 그릇만 먹기", category: "food", spice: "medium" },
  { a: "주문 실수를 숨기고 내 마음대로 골랐다는 눈치 받기", b: "주문 실수를 인정하고 추가 주문 비용 내기", category: "food", spice: "medium" },
  { a: "회식에서 못 먹는 메뉴라고 말했다가 까다롭다는 말 듣기", b: "못 먹는 메뉴를 참고 앉아 있다가 왜 안 먹냐는 말 듣기", category: "food", spice: "medium" },

  { a: "썸인 줄 알았는데 상대는 친구라고 소개하기", b: "친구인 줄 알았는데 상대가 연인이라고 소개하기", category: "love", spice: "medium" },
  { a: "썸 상대가 내 친구에게 먼저 관심 있었다는 걸 알기", b: "썸 상대가 내 친구도 만나보라고 제안한 사람인 걸 알기", category: "love", spice: "medium" },
  { a: "데이트 예산이 안 맞아 매번 내가 더 내기", b: "데이트 예산을 맞추느라 원하는 걸 매번 포기하기", category: "love", spice: "medium" },
  { a: "가족과 미리 잡은 주말 약속 지키기", b: "오랜만에 시간이 난 연인과 주말 보내기", category: "love", spice: "medium" },
  { a: "연인이 친구들 앞에서 내 단점을 농담하기", b: "연인이 친구들 앞에서 내 장점을 과장하기", category: "love", spice: "medium" },
  { a: "썸 상대가 내 친구에게 우리 일을 먼저 상담하기", b: "썸 상대가 우리 일을 누구에게도 얘기 안 하기", category: "love", spice: "medium" },
  { a: "고백을 거절당한 뒤에도 같은 모임 나가기", b: "고백을 거절한 뒤에도 같은 모임 나가기", category: "love", spice: "medium" },
  { a: "연인이 내 과거 연애를 자꾸 질문하기", b: "연인이 내 과거 연애를 전혀 궁금해하지 않기", category: "love", spice: "medium" },

  { a: "내 실수를 바로 인정하고 주말에 수습하기", b: "내 실수를 월요일까지 숨기고 주말 내내 마음 졸이기", category: "work", spice: "medium" },
  { a: "내 능력보다 과분한 칭찬 받고 다음 일을 맡기", b: "내 능력보다 낮은 평가 받고 쉬운 일만 맡기", category: "work", spice: "medium" },
  { a: "하기 싫은 일인데 연봉 2배", b: "좋아하는 일인데 연봉 반 토막", category: "work", spice: "medium" },
  { a: "동기보다 연봉 30% 더 받는데 모두가 알기", b: "동기보다 연봉 30% 덜 받는데 나만 알기", category: "work", spice: "medium" },
  { a: "친구에게 100만 원 빌려주고 못 받기", b: "빌려주지 않아서 사이가 멀어지기", category: "work", spice: "medium" },
  { a: "내가 가르친 동료에게 배우라는 지시받기", b: "내가 가르친 동료만 성과를 인정받기", category: "work", spice: "medium" },
  { a: "내 월급이 동료들에게 공개되기", b: "내 업무 메신저의 혼잣말이 동료들에게 공개되기", category: "work", spice: "medium" },
  { a: "연봉을 자랑한 뒤 친구들이 매번 밥 사달라고 하기", b: "연봉을 숨긴 뒤 친구들이 계속 돈 없다고 걱정하기", category: "work", spice: "medium" },

  { a: "오늘 한 빈말이 상대에게 진심으로 전달되기", b: "오늘 숨긴 불만이 상대에게 그대로 전달되기", category: "power", spice: "medium" },
  { a: "썸 상대가 속으로 매긴 내 외모 점수 알기", b: "썸 상대가 속으로 매긴 내 성격 점수 알기", category: "power", spice: "medium" },
  { a: "친구가 나를 처음 봤을 때 속마음 듣기", b: "친구가 나를 지금 볼 때 속마음 듣기", category: "power", spice: "medium" },
  { a: "친구의 기억에서 내 허세 한 장면 지우기", b: "내 기억에서 친구의 험담 한마디 지우기", category: "power", spice: "medium" },
  { a: "첫 만남을 되돌려 내 자랑 줄이기", b: "첫 만남을 되돌려 남 흉본 말 지우기", category: "power", spice: "medium" },
  { a: "소개팅 전 상대가 쓸 내 후기를 미리 보기", b: "소개팅 전 친구가 쓸 내 추천서를 미리 보기", category: "power", spice: "medium" },
  { a: "친구에게 서운함이 그대로 전해지기", b: "썸 상대에게 호감이 그대로 전해지기", category: "power", spice: "medium" },
  { a: "내 과장이 안 들키지만 같은 말 계속 유지하기", b: "내 과장이 바로 들키고 한동안 놀림받기", category: "power", spice: "medium" },

  { a: "모임에서 내가 가장 친하다고 생각한 친구에게 거리감 느끼기", b: "모임에서 나와 안 친한 줄 알던 사람이 가장 친하다고 말하기", category: "life", spice: "medium" },
  { a: "집에서 빈둥거리는 내 주말을 회사 동료가 보기", b: "회사에서 눈치 보는 내 모습을 가족이 보기", category: "life", spice: "medium" },
  { a: "매일 밤 친구를 데려오는 룸메이트", b: "매일 내 음식을 몰래 먹는 룸메이트", category: "life", spice: "medium" },
  { a: "가족 모임에서 내 근황을 멋대로 부풀려 소개받기", b: "가족 모임에서 내 근황을 멋대로 낮춰 소개받기", category: "life", spice: "medium" },
  { a: "안 친한 이웃에게 내 택배를 매번 부탁하기", b: "안 친한 이웃의 택배를 매번 대신 맡아주기", category: "life", spice: "medium" },
  { a: "퇴근 후 매일 잠깐 들르는 친구에게 싫다고 말하기", b: "주말마다 불쑥 찾아오는 가족에게 싫다고 말하기", category: "life", spice: "medium" },
  { a: "친한 척 다가간 이웃이 나를 못 알아보기", b: "안 친한 척 피하던 이웃이 내 도움을 요청하기", category: "life", spice: "medium" },
  { a: "친구가 내 소비를 보고 허세가 심하다고 하기", b: "친구가 내 절약을 보고 너무 짜다고 하기", category: "life", spice: "medium" },

  { a: "친구 집에서 반려곤충을 보고 안 무서운 척하기", b: "친구 집에서 낯선 요리를 먹고 안 놀란 척하기", category: "weird", spice: "medium" },
  { a: "데이트할 때마다 연인 취향인 민트초코 메뉴만 먹기", b: "연인이 내 최애 음식을 대놓고 극혐하기", category: "weird", spice: "medium" },
  { a: "처음 만난 자리에서 예전 애교 영상을 친구가 틀기", b: "처음 만난 자리에서 예전 자작시를 친구가 읽기", category: "weird", spice: "medium" },
  { a: "첫 데이트에서 낯선 음식을 잘 먹는 척하다 헛구역질하기", b: "첫 데이트에서 음식 전문가인 척하다 메뉴 이름 틀리기", category: "weird", spice: "medium" },
  { a: "노래 못 한다고 뺐는데 개인 채널의 커버 영상 들키기", b: "춤 못 춘다고 뺐는데 댄스 학원 홍보 영상에 나오기", category: "weird", spice: "medium" },
  { a: "소개팅에서 특이한 음식 조합을 추천했다가 입맛 놀림받기", b: "소개팅에서 남의 특이한 음식 조합을 놀렸다가 정색받기", category: "weird", spice: "medium" },
  { a: "공포 영화 보다가 썸 상대 앞에서 비명 지르기", b: "놀이기구 타고 내려와 썸 상대 앞에서 멀미하기", category: "weird", spice: "medium" },
  { a: "썸 상대를 보고 반가워 손하트 했다가 인사를 못 받기", b: "썸 상대에게 진지한 고백을 했는데 장난으로 받아들이기", category: "weird", spice: "medium" },

  { a: "삼겹살은 바삭하게 구워 먹기", b: "삼겹살은 촉촉하게 구워 먹기", category: "food", spice: "mild" },
  { a: "붕어빵은 머리부터", b: "붕어빵은 꼬리부터", category: "food", spice: "mild" },
  { a: "평생 한식만 먹기", b: "평생 양식만 먹기", category: "food", spice: "mild" },
  { a: "같이 먹던 마지막 조각을 집었는데 친구도 먹으려 하기", b: "마지막 조각을 양보했는데 친구가 내 몫까지 챙겨 가기", category: "food", spice: "medium" },
  { a: "친구 요리에 솔직히 점수를 매겨 서운하게 하기", b: "친구 요리를 칭찬한 탓에 매주 같은 메뉴 초대받기", category: "food", spice: "medium" },
  { a: "첫 데이트에서 상대가 내 메뉴까지 마음대로 시키기", b: "첫 데이트에서 상대가 메뉴를 30분째 못 고르기", category: "food", spice: "medium" },
  { a: "연락은 짧게 자주", b: "연락은 길게 가끔", category: "love", spice: "mild" },
  { a: "같은 취미를 가진 연인", b: "나와 정반대 취미를 가진 연인", category: "love", spice: "mild" },
  { a: "첫 데이트는 맛집", b: "첫 데이트는 전시회", category: "love", spice: "mild" },
  { a: "연인의 친구들이 나를 싫어하기", b: "내 친구들이 연인을 싫어하기", category: "love", spice: "medium" },
  { a: "싸우면 바로 풀어야 하는 연인", b: "싸우면 하루 동안 연락 없는 연인", category: "love", spice: "medium" },
  { a: "연인이 전 애인과 아직 친구로 지내기", b: "연인이 전 애인 얘기를 자주 꺼내기", category: "love", spice: "medium" },
  { a: "출근 시간이 고정이고 퇴근도 정확한 회사", b: "출근이 자유롭지만 퇴근은 매일 달라지는 회사", category: "work", spice: "mild" },
  { a: "창가가 있는 작은 개인 사무실", b: "동료들과 함께 쓰는 넓은 공동 사무실", category: "work", spice: "mild" },
  { a: "연차 많은 회사", b: "연봉 조금 더 많은 회사", category: "work", spice: "mild" },
  { a: "회의 중에 졸다가 걸리기", b: "회의 중에 배에서 꼬르륵 소리가 크게 나기", category: "work", spice: "medium" },
  { a: "상사에게 불만을 말하다 나도 같은 실수를 지적받기", b: "상사를 칭찬하다 아부 잘한다는 말을 동료에게 듣기", category: "work", spice: "medium" },
  { a: "일 잘하는 얄미운 동료", b: "착하지만 일 못하는 동료", category: "work", spice: "medium" },
  { a: "원하는 날씨를 고르는 능력", b: "원하는 음악이 바로 흘러나오는 능력", category: "power", spice: "mild" },
  { a: "여가만 하루 여섯 시간 늘어나기", b: "휴일만 일주일에 하루 늘어나기", category: "power", spice: "mild" },
  { a: "손대면 뭐든 고치는 능력", b: "손대면 뭐든 깨끗해지는 능력", category: "power", spice: "mild" },
  { a: "친구가 돈 자랑을 들은 직전으로 되돌아가기", b: "친구가 연애 조언을 들은 직전으로 되돌아가기", category: "power", spice: "medium" },
  { a: "나를 피하는 사람의 진짜 이유 알아내기", b: "나를 자주 찾는 사람의 진짜 속뜻 알아내기", category: "power", spice: "medium" },
  { a: "거절한 소개팅이 이뤄진 미래 한 번 보기", b: "포기한 이직에 성공한 미래 한 번 보기", category: "power", spice: "medium" },
  { a: "잔잔한 음악 알람으로 일어나기", b: "신나는 음악 알람으로 일어나기", category: "life", spice: "mild" },
  { a: "비 오는 날 집에서 부침개", b: "눈 오는 날 밖에서 눈사람 만들기", category: "life", spice: "mild" },
  { a: "방은 늘 깔끔하게 정리", b: "방은 어질러도 내가 다 아는 위치", category: "life", spice: "mild" },
  { a: "가족 모임에서 잘된다고 부풀린 내 근황 들키기", b: "가족 모임에서 잘 안다던 친척의 이름 틀리기", category: "life", spice: "medium" },
  { a: "친구 결혼식 축가 부르다 음이탈", b: "친구 결혼식 사회를 보다가 신랑·신부 이름 틀리기", category: "life", spice: "medium" },
  { a: "엘리베이터에서 내 얘기인 줄 알고 남의 대화에 답하기", b: "카페에서 내 주문인 줄 알고 남의 음료 가져가기", category: "life", spice: "medium" },
  { a: "모든 말을 로봇 말투로 하기", b: "모든 말을 사극 말투로 하기", category: "weird", spice: "mild" },
  { a: "민트초코 떡볶이", b: "파인애플 김치찌개", category: "weird", spice: "mild" },
  { a: "손짓할 때마다 작은 반짝이가 나타나기", b: "발걸음마다 작은 구름이 나타나기", category: "weird", spice: "mild" },
  { a: "룸메이트에게 조용히 해달라고 한 뒤 내 샤워 노래 들키기", b: "룸메이트에게 깔끔하게 살자고 한 뒤 내 방 상태 들키기", category: "weird", spice: "medium" },
  { a: "소개팅에서 내 허세 닉네임을 지인이 큰 소리로 부르기", b: "소개팅에서 내 예전 감성 글을 상대가 외워서 말하기", category: "weird", spice: "medium" },
  { a: "소개팅에서 이에 고춧가루 낀 채로 웃기", b: "소개팅에서 상대 이름 잘못 부르기", category: "weird", spice: "medium" },
  { a: "계획을 분 단위로 짜는 여행", b: "발길 닿는 대로 즉흥 여행", category: "travel", spice: "mild" },
  { a: "평생 해외여행 금지", b: "평생 국내여행 금지", category: "travel", spice: "mild" },
  { a: "휴가 때 비행기 창가 자리", b: "휴가 때 비행기 복도 자리", category: "travel", spice: "mild" },
  { a: "맛집 위주 여행", b: "관광지 위주 여행", category: "travel", spice: "mild" },
  { a: "여행 사진 수백 장 찍기", b: "사진 없이 눈으로만 담기", category: "travel", spice: "mild" },
  { a: "기차 타고 떠나는 여행", b: "자동차로 떠나는 드라이브 여행", category: "travel", spice: "mild" },
  { a: "혼자 떠나는 여행", b: "친구들과 떠나는 여행", category: "travel", spice: "mild" },
  { a: "같은 예산으로 좋은 숙소에서 짧게 여행하기", b: "같은 예산으로 평범한 숙소에서 길게 여행하기", category: "travel", spice: "mild" },
  { a: "휴가 전날의 설렘", b: "휴가 첫날의 해방감", category: "travel", spice: "mild" },
  { a: "기념품을 잔뜩 사 오기", b: "기념품 대신 경험에 돈 쓰기", category: "travel", spice: "mild" },
  { a: "여행 가서 연인의 잠버릇에 정 떨어지기", b: "연인이 내 잠버릇에 정 떨어지기", category: "travel", spice: "medium" },
  { a: "10시간 비행 내내 옆자리에 전 애인", b: "10시간 비행 내내 옆자리에 직장 상사", category: "travel", spice: "medium" },
  { a: "여행 중 모두 내 방만 쉼터처럼 쓰기", b: "여행 중 다 같이 모일 때 내 방만 빼고 모이기", category: "travel", spice: "medium" },
  { a: "여행 경비는 내가 다 내고 일정도 내가 정하기", b: "여행 경비는 친구가 다 내고 일정도 친구가 정하기", category: "travel", spice: "medium" },
  { a: "커플 여행에 나만 혼자 가서 계속 사진 찍어주기", b: "혼자 온 줄 알았던 동행들이 여행 중 커플 되기", category: "travel", spice: "medium" },
  { a: "내가 짠 여행 일정이 다 망해서 눈치 보기", b: "친구가 짠 일정이 별로인데 꾹 참고 따르기", category: "travel", spice: "medium" },
  { a: "여행 중 친구와 대판 싸우기", b: "여행 내내 친구와 어색하게 지내기", category: "travel", spice: "medium" },
  { a: "휴가 중 회사에서 계속 연락 오기", b: "휴가를 이틀로 줄이고 연락 없이 쉬기", category: "travel", spice: "medium" },
  { a: "두루두루 아는 친구가 많기", b: "깊이 친한 친구가 한두 명 있기", category: "friends", spice: "mild" },
  { a: "약속은 미리 잡기", b: "약속은 번개로 만나기", category: "friends", spice: "mild" },
  { a: "말 잘 들어주는 친구", b: "재밌게 말해주는 친구", category: "friends", spice: "mild" },
  { a: "오래된 동네 친구", b: "새로 사귄 마음 맞는 친구", category: "friends", spice: "mild" },
  { a: "생일에 깜짝 파티", b: "생일에 조용히 축하 메시지", category: "friends", spice: "mild" },
  { a: "모임에서 분위기 띄우는 역할", b: "모임에서 조용히 웃어주는 역할", category: "friends", spice: "mild" },
  { a: "가까이 살아서 매주 만나는 친구", b: "멀리 살아서 일 년에 한 번 만나는 친구", category: "friends", spice: "mild" },
  { a: "친구에게 고민 털어놓기", b: "혼자서 고민 정리하기", category: "friends", spice: "mild" },
  { a: "단톡방에서 말 많은 사람", b: "단톡방에서 읽기만 하는 사람", category: "friends", spice: "mild" },
  { a: "친구 집에서 하룻밤 수다", b: "카페에서 하루 종일 수다", category: "friends", spice: "mild" },
  { a: "친구의 연인 선택에 반대했다가 내가 눈치 보기", b: "친구의 연인을 추천했다가 둘이 싸울 때마다 불려 가기", category: "friends", spice: "medium" },
  { a: "약속에 매번 30분 늦는 친구", b: "약속을 당일에 자주 취소하는 친구", category: "friends", spice: "medium" },
  { a: "친구들 뒷담 대상이 나였다는 걸 알게 되기", b: "내가 한 뒷담이 캡처돼서 당사자에게 가기", category: "friends", spice: "medium" },
  { a: "친구가 내 고민을 자기 일인 척 다른 친구에게 상담하기", b: "내가 친구 고민을 남 얘기인 척하다 당사자에게 들키기", category: "friends", spice: "medium" },
  { a: "축의금을 많이 냈는데 친구가 잊고 서운한 말 하기", b: "축의금을 적게 냈는데 친구가 유난히 고맙다고 하기", category: "friends", spice: "medium" },
  { a: "친구가 빌려 간 물건 끝까지 안 돌려주기", b: "친구가 빌려준 물건을 내가 망가뜨리기", category: "friends", spice: "medium" },
  { a: "동창회에서 아무도 나를 못 알아보기", b: "동창회에서 내 흑역사만 기억하기", category: "friends", spice: "medium" },
  { a: "모임 정산을 매번 내가 하기", b: "정산이 늘 흐지부지되기", category: "friends", spice: "medium" },
  { a: "급식 1등으로 먹기", b: "급식 맛있는 반찬 두 번 받기", category: "school", spice: "mild" },
  { a: "수학여행은 바다", b: "수학여행은 놀이공원", category: "school", spice: "mild" },
  { a: "앞자리에서 수업 듣기", b: "뒷자리에서 수업 듣기", category: "school", spice: "mild" },
  { a: "체육대회 날", b: "축제 날", category: "school", spice: "mild" },
  { a: "방학이 길고 숙제 많기", b: "방학이 짧고 숙제 없기", category: "school", spice: "mild" },
  { a: "꿈속 학교가 하늘에 떠 있기", b: "꿈속 학교가 바닷속에 있기", category: "school", spice: "mild" },
  { a: "교복 입던 시절로 돌아가기", b: "대학 새내기 시절로 돌아가기", category: "school", spice: "mild" },
  { a: "매점 빵", b: "학교 앞 분식집 떡볶이", category: "school", spice: "mild" },
  { a: "짝꿍은 웃긴 친구", b: "짝꿍은 공부 잘하는 친구", category: "school", spice: "mild" },
  { a: "졸업 앨범 사진 다시 찍기", b: "졸업 앨범 그대로 간직하기", category: "school", spice: "mild" },
  { a: "수업 중 선생님을 '엄마'라고 부르기", b: "발표 중에 목소리가 갈라지기", category: "school", spice: "medium" },
  { a: "졸업 앨범이 회사 단톡방에 공유되기", b: "중학생 때 쓴 싸이월드 감성 글이 공개되기", category: "school", spice: "medium" },
  { a: "시험 전 큰소리쳤다가 모르는 문제 앞에서 조용해지기", b: "공부 안 했다고 해놓고 빽빽한 요약 노트 들키기", category: "school", spice: "medium" },
  { a: "동창회에서 지금 직장이 기대 이하라는 말 듣기", b: "동창회에서 예전 성적으로 지금 직장을 평가받기", category: "school", spice: "medium" },
  { a: "학창 시절 짝사랑이 지금 내 상사", b: "학창 시절 앙숙이 지금 내 상사", category: "school", spice: "medium" },
  { a: "동창회 장기자랑에서 나만 진지하게 준비하기", b: "동창회 장기자랑에서 자신 있다던 춤을 까먹기", category: "school", spice: "medium" },
  { a: "동창회에서 내 학창 시절 짝사랑이 누구였는지 폭로되기", b: "동창회에서 나를 짝사랑했던 친구가 공개 고백하기", category: "school", spice: "medium" },
  { a: "선생님 흉본 쪽지를 선생님께 들키기", b: "친구 흉본 쪽지를 그 친구에게 들키기", category: "school", spice: "medium" },
  { a: "아이폰 평생 쓰기", b: "갤럭시 평생 쓰기", category: "tech", spice: "mild" },
  { a: "배터리 무한 휴대폰", b: "데이터 무제한 평생 무료", category: "tech", spice: "mild" },
  { a: "사진은 필터 듬뿍", b: "사진은 무보정 그대로", category: "tech", spice: "mild" },
  { a: "알림 전부 켜두기", b: "알림 전부 꺼두기", category: "tech", spice: "mild" },
  { a: "평생 SNS 금지", b: "평생 유튜브 금지", category: "tech", spice: "mild" },
  { a: "음성 메시지로 대화", b: "이모티콘으로만 대화", category: "tech", spice: "mild" },
  { a: "홈 화면에 폴더별로 앱 정리하기", b: "홈 화면에 자주 쓰는 앱만 꺼내두기", category: "tech", spice: "mild" },
  { a: "최신 폰을 매년 바꾸기", b: "한 폰을 고장 날 때까지 쓰기", category: "tech", spice: "mild" },
  { a: "게임 레벨 만렙 되기", b: "SNS 팔로워 1만 명 되기", category: "tech", spice: "mild" },
  { a: "이어폰은 무선", b: "이어폰은 유선", category: "tech", spice: "mild" },
  { a: "검색 기록이 친구들에게 공개되기", b: "사진첩이 가족에게 공개되기", category: "tech", spice: "medium" },
  { a: "지인 칭찬을 다른 방에 보내 당사자가 민망해하기", b: "지인 불평을 다른 방에 보내 당사자가 서운해하기", category: "tech", spice: "medium" },
  { a: "전 애인 SNS에 실수로 좋아요 누르기", b: "상사 스토리에 실수로 하트 답장 보내기", category: "tech", spice: "medium" },
  { a: "썸 상대가 내 옛 게시물까지 전부 읽었다고 하기", b: "썸 상대가 내 SNS를 한 번도 안 봤다고 하기", category: "tech", spice: "medium" },
  { a: "내 알고리즘 추천 영상이 회의 화면에 뜨기", b: "내 플레이리스트가 회사 스피커로 재생되기", category: "tech", spice: "medium" },
  { a: "단톡방에서 나만 빼고 다 아는 소식 뒤늦게 듣기", b: "내 소식이 나보다 먼저 단톡방에 퍼지기", category: "tech", spice: "medium" },
  { a: "관심 없는 척한 지인의 게시물을 정독한 기록 들키기", b: "잘 아는 척한 지인의 계정을 팔로우도 안 한 걸 들키기", category: "tech", spice: "medium" },
  { a: "답장 기다리는 사람에게 읽씹당하기", b: "답장 기다리는 사람에게 안읽씹당하기", category: "tech", spice: "medium" },
  { a: "전 애인이 운영하는 단골 맛집에 계속 가기", b: "다시는 그 맛집 못 가기", category: "food", spice: "hot" },
  { a: "연인이 내 식사 예절을 전 애인과 비교하기", b: "연인이 내 식사비 지출을 전 애인과 비교하기", category: "food", spice: "hot" },
  { a: "썸 상대가 내 절친에게 음식을 직접 먹여주기", b: "내가 썸 상대 친구에게 음식을 먹여준 걸 들키기", category: "food", spice: "hot" },
  { a: "술자리에서 현 연인 몰래 전 애인을 만난 사실 들키기", b: "술자리에서 절친 몰래 그 전 애인과 썸 탄 사실 들키기", category: "food", spice: "hot" },
  { a: "연인과 기념일 식사 중 옆자리에서 전 애인이 청혼받기", b: "연인과 기념일 식사 중 옆자리에서 전 애인이 소개팅하기", category: "food", spice: "hot" },
  { a: "결혼 인사 식사에서 내 동거 경험 먼저 밝히기", b: "결혼 인사 식사에서 내 큰 빚 먼저 밝히기", category: "food", spice: "hot" },
  { a: "연인의 전 애인이 내 절친", b: "연인의 절친이 나의 전 애인", category: "love", spice: "hot" },
  { a: "연애 횟수를 줄여 말한 걸 연인에게 들키기", b: "연애 기간을 늘려 말한 걸 연인에게 들키기", category: "love", spice: "hot" },
  { a: "연인이 호감 있던 친구와 단둘이 여행 가기", b: "연인이 미련 있던 전 애인과 단둘이 식사하기", category: "love", spice: "hot" },
  { a: "연인의 한 번의 바람을 알고 바로 헤어지기", b: "연인의 한 번의 바람을 알고 용서하며 만나기", category: "love", spice: "hot" },
  { a: "연인이 내 절친에게 끌렸지만 말하지 않고 거리 두기", b: "연인이 내 절친에게 끌렸다고 털어놓고 관계 유지하기", category: "love", spice: "hot" },
  { a: "가족이 좋아하는 전 애인과 재회하기", b: "가족이 반대하는 현 연인과 결혼 준비하기", category: "love", spice: "hot" },
  { a: "연인이 내 스킨십 불만을 친구에게 상담한 걸 알기", b: "연인이 내 경제력 불만을 친구에게 상담한 걸 알기", category: "love", spice: "hot" },
  { a: "친구의 전 애인이랑 사귀기", b: "전 애인의 친구랑 사귀기", category: "love", spice: "hot" },
  { a: "속궁합은 잘 맞지만 대화가 안 통하는 연인", b: "대화는 잘 통하지만 속궁합이 안 맞는 연인", category: "love", spice: "hot" },
  { a: "이 자리에서 가장 키스해보고 싶은 사람 말하기", b: "이 자리에서 비밀 데이트하고 싶은 사람 말하기", category: "love", spice: "hot" },
  { a: "연인과 진하게 키스하다 내 친구에게 들키기", b: "연인과 진하게 키스하다 내 동료에게 들키기", category: "love", spice: "hot" },
  { a: "연봉 2배지만 전 애인이 내 직속 상사", b: "연봉 그대로지만 마음 편한 회사", category: "work", spice: "hot" },
  { a: "내 연봉이 전 애인보다 낮다는 걸 현 연인에게 들키기", b: "내 저축이 말한 것보다 적다는 걸 현 연인에게 들키기", category: "work", spice: "hot" },
  { a: "연인에게 보낼 낯뜨거운 메시지를 회사 단톡방에 보내기", b: "회사 불평을 담은 메시지를 연인 가족 단톡방에 보내기", category: "work", spice: "hot" },
  { a: "회사 사람과 사내연애 후 이별", b: "회사 사람에게 고백했다가 차이기", category: "work", spice: "hot" },
  { a: "원하는 결혼식을 위해 연인에게 내 빚 밝히기", b: "내 빚을 숨기느라 결혼식 계획을 계속 미루기", category: "work", spice: "hot" },
  { a: "연인이 마음속으로 끌리는 사람들 알아내기", b: "내가 마음속으로 끌리는 사람들 들키기", category: "power", spice: "hot" },
  { a: "연인이 가장 미련 남기는 전 애인 알아내기", b: "연인이 결혼을 망설이는 진짜 이유 알아내기", category: "power", spice: "hot" },
  { a: "이 자리 사람들이 매긴 내 호감 순위 보기", b: "내가 매긴 이 자리 사람들의 호감 순위 공개하기", category: "power", spice: "hot" },
  { a: "전 애인이 나를 그리워하는지 확인하는 능력", b: "절친이 나에게 끌리는지 확인하는 능력", category: "power", spice: "hot" },
  { a: "부모님이 내 동거 사실을 연인에게 처음 듣기", b: "연인이 내 동거 경험을 부모님에게 처음 듣기", category: "life", spice: "hot" },
  { a: "전 애인과 연락하는 사실을 현 연인에게 털어놓기", b: "현 연인이 전 애인과 연락하는 이유를 직접 듣기", category: "life", spice: "hot" },
  { a: "동거 중 혼자만의 시간이 필요하다고 연인에게 말하기", b: "동거 중 스킨십이 부담스러운 날을 연인에게 말하기", category: "life", spice: "hot" },
  { a: "연인에게 헤어질 마음이 생겼다고 바로 말하기", b: "마음이 확실해질 때까지 연인과 평소처럼 지내기", category: "life", spice: "hot" },
  { a: "성인 커플 모임에서 둘만의 낯뜨거운 애칭을 들키기", b: "성인 커플 모임에서 둘만의 스킨십 신호를 들키기", category: "weird", spice: "hot" },
  { a: "전 애인과 현 연인을 비교한 메모를 들키기", b: "내 친구와 현 연인을 비교한 메모를 들키기", category: "weird", spice: "hot" },
  { a: "연인 친구가 내 성인용품 택배를 대신 받아주기", b: "내 친구가 연인의 성인용품 택배를 대신 받아주기", category: "weird", spice: "hot" },
  { a: "연인과 첫 여행에서 스킨십 속도가 다르다고 말하기", b: "연인과 첫 여행에서 각자 자고 싶다고 말하기", category: "travel", spice: "hot" },
  { a: "여행 중 연인이 내 친구에게 끌렸다고 고백하기", b: "여행 중 내가 연인 친구에게 끌렸다고 고백하기", category: "travel", spice: "hot" },
  { a: "여행에서 끌린 사람과 연락하려고 현 연인과 헤어지기", b: "여행에서 끌린 사람을 잊고 현 연인과 관계 지키기", category: "travel", spice: "hot" },
  { a: "절친이 내 전 애인과 사귀기", b: "절친이 내 짝사랑 상대와 사귀기", category: "friends", spice: "hot" },
  { a: "절친이 내 연인의 돈 문제를 나에게 털어놓기", b: "연인이 내 절친의 연애 비밀을 나에게 털어놓기", category: "friends", spice: "hot" },
  { a: "절친이 내 연인에게 끌린다는 고백 듣기", b: "연인이 내 절친에게 끌린다는 고백 듣기", category: "friends", spice: "hot" },
  { a: "친구의 이중 연애를 알면서 두 상대와 같은 모임 나가기", b: "친구의 이중 연애를 알려주고 그 친구와 관계 끊기", category: "friends", spice: "hot" },
  { a: "돈 빌려 간 절친이 내 연인에게 비싼 선물 주기", b: "돈 빌려 간 절친이 전 애인에게 비싼 선물 주기", category: "friends", spice: "hot" },
  { a: "성인 동창회에서 현재 좋아하는 동창을 말하기", b: "성인 동창회에서 다시 만나고 싶은 전 애인을 말하기", category: "school", spice: "hot" },
  { a: "성인 동창회에서 첫사랑이 내 연인보다 훨씬 고소득이기", b: "성인 동창회에서 현 연인이 자기 첫사랑에게 계속 눈길 주기", category: "school", spice: "hot" },
  { a: "성인 동창회에 현 연인과 가서 과거 연애 횟수 들키기", b: "성인 동창회에 혼자 가서 전 애인과 재회 제안받기", category: "school", spice: "hot" },
  { a: "연인이 소개팅 앱으로 계속 대화한 걸 알기", b: "연인이 나를 차단한 비밀 계정으로 활동한 걸 알기", category: "tech", spice: "hot" },
  { a: "전 애인에게 재회하고 싶다고 쓴 비공개 글 들키기", b: "현 연인과 헤어지고 싶다고 쓴 비공개 글 들키기", category: "tech", spice: "hot" },
  { a: "연인이 전 애인과의 커플 게시물을 계속 남겨두기", b: "연인이 나와의 커플 게시물을 계속 비공개로 두기", category: "tech", spice: "hot" },
  { a: "연인이 내 사적인 연애 대화를 친구에게 보여주기", b: "연인이 내 연애 고민을 익명 게시판에 올리기", category: "tech", spice: "hot" },
  { a: "연인이 나에게 한 고백 문구가 전 애인 때와 같기", b: "연인이 나에게 준 커플 선물이 전 애인 때와 같기", category: "love", spice: "hot" },
  { a: "전 애인이 내 결혼식에 새 연인과 참석하기", b: "현 연인이 자기 전 애인 결혼식에 동행을 부탁하기", category: "love", spice: "hot" },
  { a: "키스 직후 연인이 전 애인 이름을 잘못 부르기", b: "키스 직후 내가 전 애인 이름을 잘못 부르기", category: "love", spice: "hot" },
  { a: "전 애인의 재회 제안을 현 연인에게 바로 알리기", b: "전 애인의 재회 제안을 거절하고 현 연인에게 숨기기", category: "love", spice: "hot" },
  { a: "이 자리의 누군가에게 끌렸던 순간을 구체적으로 말하기", b: "이 자리의 누군가에게 질투했던 순간을 구체적으로 말하기", category: "friends", spice: "hot" },
  { a: "친구 연인에게 고백받기", b: "친구가 내 연인에게 고백하는 걸 보기", category: "friends", spice: "hot" },
  { a: "절친이 내 연인과 헤어지면 만나보고 싶다고 하기", b: "연인이 내 절친과 먼저 만났으면 좋았겠다고 하기", category: "friends", spice: "hot" },
  { a: "결혼 전 숨겨둔 비상금을 연인에게 전부 밝히기", b: "결혼 전 가족 지원에 쓴 금액을 연인에게 전부 밝히기", category: "life", spice: "hot" },
  { a: "소개팅 상대가 내 전 애인의 형제자매", b: "소개팅 상대가 내 직장 상사의 자녀", category: "life", spice: "hot" },
  { a: "전 애인에게 보낼 뻔한 보고 싶다는 초안을 현 연인이 보기", b: "현 연인에게 보낼 낯뜨거운 애교 영상을 전 애인이 보기", category: "tech", spice: "hot" },
  { a: "연인이 내 스킨십 취향 메모를 우연히 읽기", b: "연인이 내 전 애인 비교 메모를 우연히 읽기", category: "tech", spice: "hot" },
  { a: "비밀 사내연애 중 전 애인이 같은 팀으로 오기", b: "비밀 사내연애 중 연인의 전 애인이 같은 팀으로 오기", category: "work", spice: "hot" },
  { a: "친구가 내 연인에게 전 애인 애칭을 장난으로 쓰기", b: "친구가 내 전 애인에게 현 연인 애칭을 장난으로 쓰기", category: "weird", spice: "hot" },
  { a: "연인과 여행에서 친구 커플과 같은 방에 묵기", b: "연인과 여행에서 부모님과 바로 옆방에 묵기", category: "travel", spice: "hot" },

  { a: "갓 구운 빵의 바삭한 끝부분", b: "촉촉하고 부드러운 가운데 부분", category: "food", spice: "mild" },
  { a: "도시락 반찬을 한 칸씩 따로 담기", b: "한 그릇에 전부 비벼 먹기", category: "food", spice: "mild" },
  { a: "새 메뉴가 나오면 바로 도전하기", b: "단골 메뉴를 꾸준히 주문하기", category: "food", spice: "mild" },
  { a: "국물 요리에 밥을 처음부터 말기", b: "밥을 따로 떠서 국물과 먹기", category: "food", spice: "mild" },
  { a: "요리할 때 계량컵 꼭 쓰기", b: "눈대중으로 간 맞추기", category: "food", spice: "mild" },
  { a: "각자 음식 가져온 모임에서 내 요리만 남기", b: "내 요리인 줄 모르고 친구가 혹평하기", category: "food", spice: "medium" },
  { a: "식당에서 단골인 척했는데 사장님이 못 알아보기", b: "요리를 아는 척했는데 재료부터 틀리기", category: "food", spice: "medium" },
  { a: "친구가 내 추천 메뉴를 먹고 옆 테이블 음식만 부러워하기", b: "내가 친구 메뉴를 계속 부러워하는 걸 들키기", category: "food", spice: "medium" },
  { a: "추천한 맛집에서 친구들이 내 입맛을 놀리기", b: "친구 맛집을 혹평한 뒤 주인이 친구 가족인 걸 알기", category: "food", spice: "medium" },
  { a: "전 애인이 시작한 식당을 현 연인 몰래 도와주기", b: "전 애인의 식당을 현 연인과 가서 모르는 척하기", category: "food", spice: "hot" },
  { a: "전 애인에게 빌린 돈으로 현 연인과 고급 식당 가기", b: "현 연인에게 빌린 돈으로 전 애인과 식사 정산하기", category: "food", spice: "hot" },
  { a: "썸 상대와의 저녁에 절친을 초대했다가 둘이 눈 맞기", b: "절친의 소개팅 저녁에 갔다가 내가 상대에게 끌리기", category: "food", spice: "hot" },
  { a: "비 오는 날 우산 하나 같이 쓰기", b: "맑은 날 자전거 나란히 타기", category: "love", spice: "mild" },
  { a: "서로 좋아하는 책 바꿔 읽기", b: "서로 좋아하는 영화 한 편씩 같이 보기", category: "love", spice: "mild" },
  { a: "함께 도자기 만들기", b: "함께 빵 굽기", category: "love", spice: "mild" },
  { a: "응원 메시지를 아침에 받기", b: "하루 끝에 수고했다는 말 듣기", category: "love", spice: "mild" },
  { a: "같이 퍼즐 완성하기", b: "같이 화분 키우기", category: "love", spice: "mild" },
  { a: "썸 상대가 내 농담에 예의상 웃는 걸 알기", b: "내가 예의상 웃는 걸 썸 상대가 알아채기", category: "love", spice: "medium" },
  { a: "소개팅에서 서로 자기 자랑만 하기", b: "소개팅에서 서로 질문만 하고 답을 피하기", category: "love", spice: "medium" },
  { a: "연인이 내 패션을 매번 고쳐주기", b: "연인이 내 사진 각도를 매번 지적하기", category: "love", spice: "medium" },
  { a: "연인에게만 쓰는 애칭이 친구들 앞에서 튀어나오기", b: "친구들에게만 쓰던 거친 말투가 연인 앞에서 튀어나오기", category: "love", spice: "medium" },
  { a: "연인이 나와의 결혼을 내 수입 때문에 망설이기", b: "연인이 나와의 결혼을 내 스킨십 취향 때문에 망설이기", category: "love", spice: "hot" },
  { a: "헤어진 뒤 돌려받을 비싼 선물 직접 요구하기", b: "미련 있다는 오해를 피하려고 선물 포기하기", category: "love", spice: "hot" },
  { a: "키스 취향을 솔직히 말해 잠깐 어색해지기", b: "안 맞는 걸 알면서 계속 상대에게 맞춰주기", category: "love", spice: "hot" },
  { a: "일할 때 큰 모니터 하나", b: "작은 모니터 두 개", category: "work", spice: "mild" },
  { a: "하루 업무를 체크리스트로 관리하기", b: "달력에 시간별로 배치하기", category: "work", spice: "mild" },
  { a: "새 기술을 배우는 교육비 지원", b: "좋아하는 책을 사는 도서비 지원", category: "work", spice: "mild" },
  { a: "일주일에 하루 회의 몰아서 하기", b: "매일 짧게 회의하기", category: "work", spice: "mild" },
  { a: "첫 월급으로 나에게 선물하기", b: "고마운 사람에게 식사 대접하기", category: "work", spice: "mild" },
  { a: "업무 칭찬인 줄 알고 좋아했는데 다른 사람 이야기", b: "내 칭찬인데 남 이야기인 줄 알고 맞장구치기", category: "work", spice: "medium" },
  { a: "후배에게 배운 걸 상사에게 설명하다 막히기", b: "상사에게 배운 걸 후배가 더 쉽게 설명하기", category: "work", spice: "medium" },
  { a: "동료보다 일이 적은데 혼자 바쁘다고 투덜대기", b: "동료보다 일이 많은데 여유 있다고 허세 부리기", category: "work", spice: "medium" },
  { a: "아는 척한 엑셀 기능을 즉석에서 시연하기", b: "영어 잘하는 척한 뒤 외국 손님 안내 맡기", category: "work", spice: "medium" },
  { a: "결혼 전 연인에게 가족의 돈 지원 조건 밝히기", b: "결혼 전 가족에게 연인의 돈 분담 조건 밝히기", category: "work", spice: "hot" },
  { a: "절친과 동업해 더 벌지만 연인과의 주말 약속 포기하기", b: "연인의 사업에 투자해 절친과의 동업 약속 취소하기", category: "work", spice: "hot" },
  { a: "현 연인에게 전 애인과의 금전 거래를 밝히기", b: "전 애인에게 현 연인 때문에 거래를 끝낸다고 말하기", category: "work", spice: "hot" },
  { a: "그림 속 풍경에 하루 들어가기", b: "노래 속 장면에 하루 들어가기", category: "power", spice: "mild" },
  { a: "필요한 물건을 종이접기로 만들기", b: "필요한 물건을 그림으로 그려 꺼내기", category: "power", spice: "mild" },
  { a: "별자리를 원하는 모양으로 바꾸기", b: "구름을 원하는 모양으로 바꾸기", category: "power", spice: "mild" },
  { a: "어디서든 작은 무지개 만들기", b: "어디서든 은은한 꽃향기 만들기", category: "power", spice: "mild" },
  { a: "물건의 사용법을 만지면 알기", b: "식물에게 필요한 것을 만지면 알기", category: "power", spice: "mild" },
  { a: "연봉을 부풀린 말만 상대 기억에서 수정하기", b: "연애 경험을 부풀린 말만 상대 기억에서 수정하기", category: "power", spice: "medium" },
  { a: "고백 전에 상대의 거절 이유 미리 듣기", b: "부탁 전에 상대가 느낄 부담 미리 듣기", category: "power", spice: "medium" },
  { a: "약속을 피한 진짜 이유가 상대에게 전해지기", b: "선물을 바꾼 진짜 이유가 상대에게 전해지기", category: "power", spice: "medium" },
  { a: "내 인맥 자랑 중 거짓이 딱 한 번 드러나기", b: "내 지식 자랑 중 거짓이 딱 한 번 드러나기", category: "power", spice: "medium" },
  { a: "연인이 나와 사귄 진짜 이유를 마음속에서 읽기", b: "연인이 전 애인과 헤어진 진짜 이유를 마음속에서 읽기", category: "power", spice: "hot" },
  { a: "내가 키스하고 싶은 사람이 지금 모두에게 보이기", b: "내 연인이 키스하고 싶은 사람이 지금 나에게 보이기", category: "power", spice: "hot" },
  { a: "전 애인을 붙잡던 마지막 연락을 시간 되돌려 취소하기", b: "현 연인에게 한 가장 큰 거짓말을 시간 되돌려 취소하기", category: "power", spice: "hot" },
  { a: "현관 앞에 작은 벤치 두기", b: "창가에 작은 독서 의자 두기", category: "life", spice: "mild" },
  { a: "하루 집안일을 매일 조금씩 하기", b: "주말 오전에 한꺼번에 하기", category: "life", spice: "mild" },
  { a: "동네 산책길에 강이 있기", b: "동네 산책길에 숲이 있기", category: "life", spice: "mild" },
  { a: "일기를 손글씨로 쓰기", b: "하루를 사진 한 장으로 남기기", category: "life", spice: "mild" },
  { a: "집에서 따뜻한 노란 조명 쓰기", b: "집에서 선명한 하얀 조명 쓰기", category: "life", spice: "mild" },
  { a: "혼자인 줄 알고 춤추다 창밖 이웃과 눈 마주치기", b: "이어폰 낀 줄 알고 영상 틀다 버스에서 소리 나기", category: "life", spice: "medium" },
  { a: "택배를 늦게 찾고도 못 받았다고 문의한 게 들키기", b: "이웃 물건을 빌린 걸 잊고 내 것인 줄 알았다고 하기", category: "life", spice: "medium" },
  { a: "버릴 옷이라던 옷을 입고 친구 만나기", b: "안 산다던 물건 쇼핑백을 들고 친구 만나기", category: "life", spice: "medium" },
  { a: "미용사에게 머리가 마음에 안 든다고 직접 말하기", b: "마음에 든다고 해놓고 수정 요청 전화하기", category: "life", spice: "medium" },
  { a: "동거 보증금을 전 애인에게 빌렸다고 연인에게 말하기", b: "동거 보증금을 부모님에게 빌리며 동거 사실 밝히기", category: "life", spice: "hot" },
  { a: "결혼 전 자산을 각자 관리하자고 연인에게 요구하기", b: "결혼 후 수입은 전부 합치자고 연인에게 요구하기", category: "life", spice: "hot" },
  { a: "현 연인과 살 집이 전 애인과 살던 집이기", b: "새 집에 놓을 가구 절반이 전 애인과 고른 것이기", category: "life", spice: "hot" },
  { a: "감자튀김처럼 생긴 달콤한 케이크", b: "케이크처럼 생긴 짭짤한 감자 요리", category: "weird", spice: "mild" },
  { a: "우산을 펴면 작은 별이 쏟아지기", b: "장화를 신으면 물웅덩이가 반짝이기", category: "weird", spice: "mild" },
  { a: "손톱이 요일마다 다른 무늬로 바뀌기", b: "양말 무늬가 기분 따라 바뀌기", category: "weird", spice: "mild" },
  { a: "말하는 주전자와 살기", b: "노래하는 냉장고와 살기", category: "weird", spice: "mild" },
  { a: "푸딩처럼 흔들리는 의자", b: "마시멜로처럼 푹신한 책상", category: "weird", spice: "mild" },
  { a: "소개팅 상대의 특이한 웃음소리를 따라 하다 들키기", b: "소개팅 상대가 내 특이한 웃음소리를 흉내 내는 걸 보기", category: "weird", spice: "medium" },
  { a: "자연스러운 셀카라던 사진의 수십 번 재촬영 기록 들키기", b: "우연한 만남이라던 약속을 일부러 맞춘 기록 들키기", category: "weird", spice: "medium" },
  { a: "친구 앞에서 연습하던 사과 대사를 당사자에게 들키기", b: "연인 앞에서 연습하던 멋진 고백 대사를 미리 들키기", category: "weird", spice: "medium" },
  { a: "비싸게 샀다던 물건의 할인 영수증 들키기", b: "내가 만들었다던 개인기의 원본 영상 들키기", category: "weird", spice: "medium" },
  { a: "술자리에서 전 애인 이야기에 나도 모르게 질투 드러내기", b: "술자리에서 새로 끌리는 사람에게 나도 모르게 애교 부리기", category: "weird", spice: "hot" },
  { a: "키스 분위기에서 스킨십 취향을 먼저 말하기", b: "키스 분위기에서 연애 관계부터 정하자고 말하기", category: "weird", spice: "hot" },
  { a: "연인 앞에서 전 애인과의 스킨십을 더 좋게 말실수하기", b: "연인 앞에서 전 애인과의 소비 수준을 더 좋게 말실수하기", category: "weird", spice: "hot" },
  { a: "낯선 도시의 아침 시장 구경", b: "낯선 도시의 밤 산책", category: "travel", spice: "mild" },
  { a: "여행지에서 하루 요리 수업 듣기", b: "여행지에서 하루 공예 수업 듣기", category: "travel", spice: "mild" },
  { a: "짐을 작은 가방 하나로 줄이기", b: "여유 공간 있는 큰 가방 챙기기", category: "travel", spice: "mild" },
  { a: "일출 보러 새벽에 출발하기", b: "별 보러 밤늦게 출발하기", category: "travel", spice: "mild" },
  { a: "숙소에서 엽서 쓰기", b: "현지 우체국에서 기념 도장 모으기", category: "travel", spice: "mild" },
  { a: "지도 담당인데 같은 골목 세 번 돌기", b: "통역 담당인데 메뉴판부터 잘못 읽기", category: "travel", spice: "medium" },
  { a: "혼자 쉬고 싶은데 동행이 계속 말 걸기", b: "수다 떨고 싶은데 동행이 계속 이어폰 끼기", category: "travel", spice: "medium" },
  { a: "날짜를 잘못 예약해 추가 숙박비를 내가 내기", b: "확인 안 한 동행과 추가 숙박비를 나눠 내며 눈치 보기", category: "travel", spice: "medium" },
  { a: "여행 기념품을 줬는데 친구가 가격 검색하기", b: "기념품 받은 내가 친구 앞에서 가격 검색을 들키기", category: "travel", spice: "medium" },
  { a: "커플 여행 경비를 낸 뒤 헤어져서 혼자 가기", b: "헤어진 뒤에도 환불 아까워 둘이 여행 가기", category: "travel", spice: "hot" },
  { a: "전 애인과 갔던 여행지를 현 연인이 신혼여행지로 고르기", b: "현 연인이 전 애인과 갔던 곳을 신혼여행지로 추천하기", category: "travel", spice: "hot" },
  { a: "여행에서 만난 사람과 서로 합의한 하룻밤의 만남 갖기", b: "여행에서 만난 사람과 귀국 뒤 장거리 연애 시작하기", category: "travel", spice: "hot" },
  { a: "친구와 같은 책 읽고 이야기하기", b: "친구와 다른 책 읽고 서로 추천하기", category: "friends", spice: "mild" },
  { a: "친구에게 직접 만든 작은 선물 받기", b: "친구가 골라준 중고책 받기", category: "friends", spice: "mild" },
  { a: "친구와 동네 쓰레기 줍기", b: "친구와 유기동물 보호소 봉사하기", category: "friends", spice: "mild" },
  { a: "친구가 추천한 취미 하루 배우기", b: "내 취미를 친구에게 하루 가르치기", category: "friends", spice: "mild" },
  { a: "친구와 협동 보드게임 하기", b: "친구와 공동 플레이리스트 만들기", category: "friends", spice: "mild" },
  { a: "친구가 내 고민을 듣다 자기 이야기만 하기", b: "친구 고민에 공감한답시고 내 이야기만 한 걸 지적받기", category: "friends", spice: "medium" },
  { a: "친구에게만 한 제안인 줄 알았는데 단체 복사 메시지이기", b: "단체로 보낸 제안을 친구가 자기만 받은 줄 알고 감동하기", category: "friends", spice: "medium" },
  { a: "친구에게 준 선물을 중고장터에서 발견하기", b: "친구에게 받은 선물을 팔다가 친구에게 문의받기", category: "friends", spice: "medium" },
  { a: "단체 사진에서 나만 잘 나온 사진 올리기", b: "다들 잘 나왔는데 나만 눈 감은 사진 허락하기", category: "friends", spice: "medium" },
  { a: "이 자리에서 가장 스킨십이 궁금한 사람 고르기", b: "이 자리에서 연애하면 가장 질투 날 사람 고르기", category: "friends", spice: "hot" },
  { a: "절친에게 그 연인의 경제력이 부럽다고 고백하기", b: "절친에게 그 연인의 외모에 끌린다고 고백하기", category: "friends", spice: "hot" },
  { a: "절친에게 나와 키스할 생각을 해봤는지 묻기", b: "절친에게 나와 결혼할 생각을 해봤는지 묻기", category: "friends", spice: "hot" },
  { a: "학급 신문에 만화 그리기", b: "학급 방송에서 음악 소개하기", category: "school", spice: "mild" },
  { a: "쉬는 시간 운동장 한 바퀴 걷기", b: "도서관에서 만화책 보기", category: "school", spice: "mild" },
  { a: "과학 시간 실험 담당", b: "미술 시간 재료 담당", category: "school", spice: "mild" },
  { a: "학교 텃밭에서 수확하기", b: "학교 벽화 함께 그리기", category: "school", spice: "mild" },
  { a: "졸업 후 타임캡슐 열기", b: "졸업 후 옛 교실 둘러보기", category: "school", spice: "mild" },
  { a: "동창회에서 나는 기억 못 하는 다툼을 사과받기", b: "동창회에서 상대는 기억 못 하는 다툼을 사과하기", category: "school", spice: "medium" },
  { a: "발표 자료의 연습용 농담을 지우지 않기", b: "발표 대본의 스스로 응원하는 문장까지 읽기", category: "school", spice: "medium" },
  { a: "학급 회장 공약을 너무 크게 잡아 후회하기", b: "장기자랑 신청을 너무 자신 있게 해서 후회하기", category: "school", spice: "medium" },
  { a: "공부 안 했다는 말과 달리 학원 특강 사진 들키기", b: "발표 안 떨린다는 말과 달리 떨리는 손을 들키기", category: "school", spice: "medium" },
  { a: "성인이 된 동창과 비밀 연애하다 동창회에서 공개하기", b: "동창회에서 성인이 된 첫사랑에게 재고백하고 거절당하기", category: "school", spice: "hot" },
  { a: "동창이 내 현재 연봉을 듣고 노골적으로 태도 바꾸기", b: "내가 동창의 재산을 듣고 태도 바꾼 걸 지적받기", category: "school", spice: "hot" },
  { a: "성인 동창회에서 전 애인이 내 연애 단점을 말하기", b: "성인 동창회에서 현 연인이 내 첫사랑에게 질투 드러내기", category: "school", spice: "hot" },
  { a: "전자책에 밑줄 긋기", b: "종이책에 포스트잇 붙이기", category: "tech", spice: "mild" },
  { a: "가족 사진을 디지털 액자로 보기", b: "사진을 인화해서 벽에 걸기", category: "tech", spice: "mild" },
  { a: "키보드는 조용한 타건감", b: "키보드는 경쾌한 타건감", category: "tech", spice: "mild" },
  { a: "지도 앱으로 동네 새 길 찾기", b: "음악 앱으로 새 가수 찾기", category: "tech", spice: "mild" },
  { a: "게임 캐릭터 외형 꾸미기", b: "게임 속 집 꾸미기", category: "tech", spice: "mild" },
  { a: "메시지를 안 봤다는데 내 접속 기록이 남아 있기", b: "바쁘다고 했는데 내 게임 접속 기록이 남아 있기", category: "tech", spice: "medium" },
  { a: "화상 회의 중 음소거인 줄 알고 상사에게 투덜대기", b: "화상 회의 중 화면 공유인 줄 모르고 이직 공고 열기", category: "tech", spice: "medium" },
  { a: "좋아요 없는 게시물을 친구에게 홍보하다 들키기", b: "내 게시물에 내가 댓글 단 부계정을 들키기", category: "tech", spice: "medium" },
  { a: "중고 거래에서 가격을 깎아달라던 상대가 동료이기", b: "게임에서 실력 자랑하던 상대가 후배이기", category: "tech", spice: "medium" },
  { a: "연애 앱에서 전 애인과 다시 서로 좋아요 누르기", b: "연애 앱에서 내 절친의 전 애인과 서로 좋아요 누르기", category: "tech", spice: "hot" },
  { a: "커플 계정을 정리하자고 말하며 이별 고민을 꺼내기", b: "커플 계정은 유지한 채 다른 사람과의 연락을 털어놓기", category: "tech", spice: "hot" },
  { a: "비공개 계정에 올린 현 연인 불만을 직접 읽어주기", b: "헤어질까 고민하며 작성한 장단점 표를 현 연인에게 보여주기", category: "tech", spice: "hot" },

  { a: "햇빛 잘 드는 작은 집", b: "햇빛 적게 드는 큰 집", category: "home", spice: "mild" },
  { a: "여유 방을 손님방으로 쓰기", b: "여유 방을 작업실로 쓰기", category: "home", spice: "mild" },
  { a: "꺼내 쓰기 편한 오픈 수납장", b: "먼지 덜 쌓이는 문 달린 수납장", category: "home", spice: "mild" },
  { a: "바닥에 앉는 좌식 테이블", b: "의자에 앉는 입식 테이블", category: "home", spice: "mild" },
  { a: "관리 편한 인조 식물", b: "키우는 재미가 있는 진짜 식물", category: "home", spice: "mild" },
  { a: "발코니에 작은 텃밭 만들기", b: "발코니에 작은 홈카페 만들기", category: "home", spice: "mild" },
  { a: "빨래가 편해지는 건조기", b: "설거지가 편해지는 식기세척기", category: "home", spice: "mild" },
  { a: "활기찬 번화가에 살기", b: "조용한 주택가에 살기", category: "home", spice: "mild" },
  { a: "직접 짐 싸고 이사비 아끼기", b: "포장 이사 맡기고 시간 아끼기", category: "home", spice: "mild" },
  { a: "천장 높은 복층집", b: "계단 없는 단층집", category: "home", spice: "mild" },
  { a: "청소하기 편한 맨바닥", b: "발에 닿는 느낌 좋은 러그", category: "home", spice: "mild" },
  { a: "수압은 센데 욕조는 없는 욕실", b: "수압은 약한데 욕조는 있는 욕실", category: "home", spice: "mild" },
  { a: "디퓨저로 집 안 향기 채우기", b: "향 없이 환기로만 공기 바꾸기", category: "home", spice: "mild" },
  { a: "가구 없는 집을 내 취향대로 채우기", b: "취향 달라도 가구 갖춘 집에 살기", category: "home", spice: "mild" },
  { a: "빨래 널기 좋은 작은 베란다", b: "계절용품 넣기 좋은 작은 창고", category: "home", spice: "mild" },
  { a: "잘 때 완전히 어두운 방", b: "잘 때 은은한 조명이 켜진 방", category: "home", spice: "mild" },
  { a: "친구가 깬 컵값 받고 쪼잔하다는 말 듣기", b: "친구가 깬 컵값 안 받고 두고두고 아까워하기", category: "home", spice: "medium" },
  { a: "룸메이트에게 내 빨래 냄새 지적받기", b: "룸메이트에게 화장실 사용 습관 지적받기", category: "home", spice: "medium" },
  { a: "집들이에서 내 집이 촌스럽다는 말 듣기", b: "집들이에서 내 집이 돈 낭비라는 말 듣기", category: "home", spice: "medium" },
  { a: "층간소음 항의하고 이웃과 어색해지기", b: "층간소음 참고 집에서 쉬는 시간 줄이기", category: "home", spice: "medium" },
  { a: "집주인에게 수리 재촉하고 진상 취급받기", b: "내 돈으로 수리하고 집주인에게 고맙다는 말도 못 듣기", category: "home", spice: "medium" },
  { a: "자취 고수라던 내가 분리수거 지적받기", b: "절약 고수라던 내가 난방비 1등 하기", category: "home", spice: "medium" },
  { a: "룸메이트 몰래 보일러 올린 걸 들키기", b: "춥다는 룸메이트에게 난방비 더 내라고 하기", category: "home", spice: "medium" },
  { a: "청소하며 잔소리해서 피곤한 사람 되기", b: "청소 안 하고 버텨서 눈치 없는 사람 되기", category: "home", spice: "medium" },
  { a: "이웃 대화 엿듣다 들켜 변명하기", b: "내 통화 엿들은 이웃에게 불쾌하다고 말하기", category: "home", spice: "medium" },
  { a: "같이 산 소파값 따지다 친구에게 정 없다고 듣기", b: "같이 산 소파 공짜로 넘기고 친구가 되파는 걸 보기", category: "home", spice: "medium" },
  { a: "침대에 앉은 손님에게 더럽다며 일어나라고 하기", b: "참고 넘겼다가 다른 친구는 침대에 앉히는 걸 들키기", category: "home", spice: "medium" },
  { a: "세탁방에서 내 속옷을 지인에게 돌려받기", b: "세탁방에서 지인 속옷 잘못 챙겨 사과하기", category: "home", spice: "medium" },
  { a: "룸메이트와 안 맞는다고 말하고 당장 방 빼기", b: "룸메이트와 잘 맞는 척하고 1년 더 같이 살기", category: "home", spice: "medium" },
  { a: "헤어진 동거인과 3개월 더 살기", b: "보증금 300만 원 포기하고 바로 나가기", category: "home", spice: "hot" },
  { a: "연인이 허락 없이 우리 집 비밀번호를 자기 친구에게 알려주기", b: "연인이 허락 없이 우리 집 열쇠를 자기 부모님께 드리기", category: "home", spice: "hot" },
  { a: "연인과 둘이 살려고 룸메이트에게 위약금 100만 원 주기", b: "위약금 100만 원 아끼고 연인과 룸메이트 셋이 살기", category: "home", spice: "hot" },
  { a: "룸메이트가 내 연인과 거실에서 밤새 술 마시기", b: "룸메이트가 내 전 애인을 새 동거인으로 들이기", category: "home", spice: "hot" },
  { a: "동거인이 집 살 돈 모으는 동안 생활비 전부 내기", b: "동거인이 생활비 내는 대신 함께 살 집 지분 포기하기", category: "home", spice: "hot" },
  { a: "1년 치 월세 지원받고 집 안을 24시간 생중계하기", b: "1년 치 월세 직접 내고 집 안 사생활 지키기", category: "home", spice: "hot" },
  { a: "집주인이 된 절친에게 월세 독촉받기", b: "세입자가 된 절친에게 퇴거 통보하기", category: "home", spice: "hot" },
  { a: "재개발로 1억 벌고 절친 가게 없어지기", b: "재개발 취소로 1억 놓치고 절친 가게 남기기", category: "home", spice: "hot" },
  { a: "반전 강렬한데 다시 보기 힘든 영화", b: "반전 평범한데 여러 번 보기 좋은 영화", category: "media", spice: "mild" },
  { a: "극장에서 좋은 음향으로 한 편 보기", b: "집에서 편한 자세로 두 편 보기", category: "media", spice: "mild" },
  { a: "좋아하는 가수의 신곡만 듣는 공연", b: "좋아하는 가수의 대표곡만 듣는 공연", category: "media", spice: "mild" },
  { a: "방영 중인 드라마 매주 한 회씩 보기", b: "완결 난 드라마 한꺼번에 몰아보기", category: "media", spice: "mild" },
  { a: "이야기 탄탄한데 작화 평범한 웹툰", b: "작화 뛰어난데 이야기 평범한 웹툰", category: "media", spice: "mild" },
  { a: "주인공은 행복한데 궁금증 남는 결말", b: "주인공은 불행한데 궁금증 풀리는 결말", category: "media", spice: "mild" },
  { a: "앨범 수록곡 순서대로 듣기", b: "그날 기분에 맞는 순서로 듣기", category: "media", spice: "mild" },
  { a: "모르는 배우가 나오는 내 취향 영화", b: "좋아하는 배우가 나오는 낯선 장르 영화", category: "media", spice: "mild" },
  { a: "가사는 좋고 멜로디는 평범한 노래", b: "멜로디는 좋고 가사는 평범한 노래", category: "media", spice: "mild" },
  { a: "원작에 충실한 익숙한 각색", b: "원작을 과감히 바꾼 새로운 각색", category: "media", spice: "mild" },
  { a: "가까이 보지만 계속 서 있는 공연석", b: "멀리 보지만 편히 앉아 있는 공연석", category: "media", spice: "mild" },
  { a: "박진감 넘치는 두 시간짜리 영화", b: "인물에 푹 빠지는 열 시간짜리 드라마", category: "media", spice: "mild" },
  { a: "최애 굿즈 작은 것 다섯 개", b: "최애 굿즈 커다란 것 한 개", category: "media", spice: "mild" },
  { a: "호흡 잘 맞는 출연진의 장수 예능", b: "조합이 신선한 출연진의 신규 예능", category: "media", spice: "mild" },
  { a: "좋아하는 작품의 후속편 보기", b: "처음 보는 세계관의 신작 보기", category: "media", spice: "mild" },
  { a: "음정 흔들려도 현장감 있는 라이브 음원", b: "현장감 적어도 음정 정확한 스튜디오 음원", category: "media", spice: "mild" },
  { a: "다들 칭찬하는 명작이 지루했다고 말하기", b: "다들 혹평하는 작품을 세 번 봤다고 말하기", category: "media", spice: "medium" },
  { a: "친구 영화에서 내 출연 장면만 통편집되기", b: "친구 영화에서 내 NG 장면만 엔딩에 나오기", category: "media", spice: "medium" },
  { a: "팬 모임에서 최애 바뀌었다고 선언하기", b: "마음 떠난 최애의 팬 모임 계속 운영하기", category: "media", spice: "medium" },
  { a: "영화 보고 울다가 감수성 과하다는 말 듣기", b: "영화 보고 안 울다가 공감 못 한다는 말 듣기", category: "media", spice: "medium" },
  { a: "감명받은 영화와 정반대로 산다고 지적받기", b: "비판한 영화 주인공과 똑같다고 지적받기", category: "media", spice: "medium" },
  { a: "공연 중 내 환호에 가수가 조용히 해달라고 하기", b: "공연 중 내 무표정에 가수가 재미없냐고 묻기", category: "media", spice: "medium" },
  { a: "숨겨둔 최애 굿즈를 손님에게 들키기", b: "꺼내둔 최애 굿즈가 유치하다는 말 듣기", category: "media", spice: "medium" },
  { a: "최애 비판했다가 팬 모임에서 찍히기", b: "최애 옹호했다가 친구 모임에서 찍히기", category: "media", spice: "medium" },
  { a: "집중하자고 해놓고 영화 중간에 잠들기", b: "조용히 보자고 해놓고 혼자 계속 질문하기", category: "media", spice: "medium" },
  { a: "팬 모임 회장 선거에서 친구에게 한 표 차로 지기", b: "팬 모임 회장에 뽑혔는데 친구가 공개적으로 반대하기", category: "media", spice: "medium" },
  { a: "줄거리도 모르고 영화 평론한 걸 들키기", b: "남의 평론을 내 해석처럼 말한 걸 들키기", category: "media", spice: "medium" },
  { a: "노래방에서 감정 잡다 친구들 웃음 터지기", b: "노래방에서 웃기려다 친구들 정색하기", category: "media", spice: "medium" },
  { a: "한 장 당첨된 콘서트 표로 혼자 가고 친구 원망 듣기", b: "한 장 당첨된 콘서트 표를 양보하고 친구 후기만 듣기", category: "media", spice: "medium" },
  { a: "최애 앞에서 과몰입 팬레터 낭독하기", b: "친구들 앞에서 최애와의 결혼 망상 글 낭독하기", category: "media", spice: "hot" },
  { a: "친구의 비밀 연애를 영화로 만들고 친구와 절교하기", b: "내 비밀 연애를 영화로 만들고 연인과 헤어지기", category: "media", spice: "hot" },
  { a: "연인 앞에서 전 애인에게 쓴 자작곡 부르기", b: "전 애인 앞에서 현 연인에게 쓴 자작곡 부르기", category: "media", spice: "hot" },
  { a: "연인이 내 절친과 키스 장면 찍기", b: "내가 연인의 절친과 키스 장면 찍기", category: "media", spice: "hot" },
  { a: "최애 표절 폭로하고 팬덤에서 쫓겨나기", b: "최애 표절 덮고 피해 창작자에게 원망 듣기", category: "media", spice: "hot" },
  { a: "악역으로 편집돼 크게 뜨는 예능 출연", b: "무난하게 편집돼 아무도 기억 못 하는 예능 출연", category: "media", spice: "hot" },
  { a: "후원금 1천만 원 내고 최애에게 특별 대우받기", b: "후원금 1천만 원 돌려받고 최애에게 무시당하기", category: "media", spice: "hot" },
  { a: "내 시나리오를 친구가 훔쳐 신인상 받는 걸 보기", b: "친구 시나리오를 내가 훔쳐 신인상 받고 비밀 지키기", category: "media", spice: "hot" },
  { a: "기술 익히는 재미가 있는 수영", b: "기록 줄이는 재미가 있는 달리기", category: "body", spice: "mild" },
  { a: "여럿이 호흡 맞추는 팀 운동", b: "혼자 페이스 조절하는 개인 운동", category: "body", spice: "mild" },
  { a: "주 세 번 30분씩 운동하기", b: "주 두 번 45분씩 운동하기", category: "body", spice: "mild" },
  { a: "집 앞에서 바로 시작하는 야외 운동", b: "날씨 걱정 없이 하는 실내 운동", category: "body", spice: "mild" },
  { a: "움직임이 편한 넉넉한 옷", b: "옷맵시가 사는 딱 맞는 옷", category: "body", spice: "mild" },
  { a: "손질 편한 짧은 머리", b: "다양하게 묶는 긴 머리", category: "body", spice: "mild" },
  { a: "옷은 차분하게 입고 신발로 포인트 주기", b: "신발은 무난하게 신고 옷으로 포인트 주기", category: "body", spice: "mild" },
  { a: "색깔은 비슷하고 디자인은 다양한 옷장", b: "디자인은 비슷하고 색깔은 다양한 옷장", category: "body", spice: "mild" },
  { a: "한 종목을 1년간 깊게 배우기", b: "세 종목을 넉 달씩 두루 배우기", category: "body", spice: "mild" },
  { a: "값은 비싸도 오래 신는 운동화", b: "값은 저렴해도 자주 바꾸는 운동화", category: "body", spice: "mild" },
  { a: "가볍지만 주름 잘 잡히는 셔츠", b: "무겁지만 주름 안 잡히는 셔츠", category: "body", spice: "mild" },
  { a: "옷은 그대로 두고 헤어스타일 바꾸기", b: "머리는 그대로 두고 옷 스타일 바꾸기", category: "body", spice: "mild" },
  { a: "동작 정확도에 집중하는 느린 운동", b: "리듬과 몰입에 집중하는 빠른 운동", category: "body", spice: "mild" },
  { a: "자세 꼼꼼히 봐주는 소규모 수업", b: "시간 선택이 자유로운 대규모 수업", category: "body", spice: "mild" },
  { a: "운동 마치고 사우나 가기", b: "운동 마치고 마사지 받기", category: "body", spice: "mild" },
  { a: "기본 옷 여러 벌로 매일 조합 바꾸기", b: "포인트 옷 몇 벌로 확실한 인상 남기기", category: "body", spice: "mild" },
  { a: "운동 대결에 전력 다하고 승부욕 세다고 듣기", b: "운동 대결에 힘 빼고 대놓고 봐주냐고 듣기", category: "body", spice: "medium" },
  { a: "안 어울린다는 말 듣고도 새 옷 입기", b: "마음에 드는 새 옷을 남 눈치 보고 갈아입기", category: "body", spice: "medium" },
  { a: "옷 잘 입는다는 칭찬에 남이 골라줬다고 밝히기", b: "옷 잘 입는다는 칭찬에 친구 코디까지 맡기", category: "body", spice: "medium" },
  { a: "초보 수업으로 옮기고 실력 부족 인정하기", b: "상급 수업에 남아서 매번 뒤처지기", category: "body", spice: "medium" },
  { a: "운동 고수인 척하다 기본 규칙 틀리기", b: "운동 초보인 척하다 실력 들켜 내숭 소리 듣기", category: "body", spice: "medium" },
  { a: "친구와 옷 겹쳐서 내가 갈아입으러 가기", b: "친구와 옷 겹친 채로 모임 내내 비교당하기", category: "body", spice: "medium" },
  { a: "운동 파트너에게 따로 하자고 말하기", b: "운동 파트너 기다리며 내 진도 늦추기", category: "body", spice: "medium" },
  { a: "새로 한 머리 아무도 몰라줘 먼저 자랑하기", b: "새로 한 머리 다 알아보는데 반응 미지근하기", category: "body", spice: "medium" },
  { a: "썸 상대 앞에서 체력 바닥나 먼저 포기하기", b: "썸 상대 앞에서 승부욕 폭발해 정색하기", category: "body", spice: "medium" },
  { a: "트레이너에게 돈 아깝게 운동한다는 말 듣기", b: "트레이너에게 남 시선만 신경 쓴다는 말 듣기", category: "body", spice: "medium" },
  { a: "운동복 차려입는 건 관심받고 싶어서라고 인정하기", b: "운동복 대충 입는 건 못해도 핑계 대려고 그런다고 인정하기", category: "body", spice: "medium" },
  { a: "친구에게 빌린 옷 망가뜨리고 같은 옷 새로 사서 숨기기", b: "친구에게 빌린 옷 망가뜨렸다고 말하고 한동안 잔소리 듣기", category: "body", spice: "medium" },
  { a: "댄스 발표회 독무 거절하고 자신 없다고 인정하기", b: "댄스 발표회 독무 맡고 아는 사람 전부 초대받기", category: "body", spice: "medium" },
  { a: "운동 영상에 연인 몰래 한 플러팅 찍히기", b: "헬스장 라이브에 친구 몸매 뒷담화 나가기", category: "body", spice: "hot" },
  { a: "대회 상금 300만 원 받고 팀원 몰래 내 몫으로 챙기기", b: "대회 상금 300만 원 나누고 팀원들의 부정 출전 숨기기", category: "body", spice: "hot" },
  { a: "바디프로필 보정 전후를 연인 친구들이 보기", b: "바디프로필 포즈 연습 영상을 회사 사람들이 보기", category: "body", spice: "hot" },
  { a: "촌스러운 내 옷차림을 평생 광고에 쓰게 하고 1억 받기", b: "광고료 1억 포기하고 촌스러운 내 옷차림 비공개로 두기", category: "body", spice: "hot" },
  { a: "연인을 꺾고 우승 상금 500만 원 받은 뒤 헤어지기", b: "연인에게 우승 상금 500만 원 양보하고 연애 이어가기", category: "body", spice: "hot" },
  { a: "짝퉁인 줄 모르고 연인에게 명품 선물했다가 들키기", b: "짝퉁인 줄 알면서 연인이 준 명품 선물 고맙다고 받기", category: "body", spice: "hot" },
  { a: "외모만 보고 사귀었다고 연인에게 말하기", b: "내 외모만 보고 사귀었다는 연인 말 듣기", category: "body", spice: "hot" },
  { a: "전 애인에게 받은 명품 옷을 현 연인이 몰래 팔기", b: "현 연인에게 준 명품 옷을 그 전 애인이 입고 나오기", category: "body", spice: "hot" },
  { a: "명절에 한집에서 길게 만나기", b: "명절에 집집마다 짧게 만나기", category: "family", spice: "mild" },
  { a: "가족 생일을 당일에 짧게 챙기기", b: "가족 생일을 주말에 길게 챙기기", category: "family", spice: "mild" },
  { a: "적은 하객과 길게 인사하는 결혼식", b: "많은 하객과 짧게 인사하는 결혼식", category: "family", spice: "mild" },
  { a: "가족 행사 날짜 1년 치 미리 정하기", b: "가족 행사 날짜 그때그때 맞추기", category: "family", spice: "mild" },
  { a: "부모님께 원하는 선물 물어보고 사드리기", b: "부모님께 깜짝 선물 직접 골라 드리기", category: "family", spice: "mild" },
  { a: "아이에게 어릴 때 악기 가르치기", b: "아이에게 어릴 때 외국어 가르치기", category: "family", spice: "mild" },
  { a: "결혼기념일마다 같은 식당 가기", b: "결혼기념일마다 새로운 식당 가기", category: "family", spice: "mild" },
  { a: "가족끼리 잘하는 집안일만 맡기", b: "가족끼리 서툴러도 집안일 돌아가며 맡기", category: "family", spice: "mild" },
  { a: "결혼식 영상에 가족 인터뷰 많이 담기", b: "결혼식 영상에 둘의 이야기 많이 담기", category: "family", spice: "mild" },
  { a: "아이에게 용돈을 매주 조금씩 주기", b: "아이에게 용돈을 매달 한 번에 주기", category: "family", spice: "mild" },
  { a: "친척끼리 호칭 꼼꼼히 지키기", b: "친척끼리 이름 편하게 부르기", category: "family", spice: "mild" },
  { a: "가족회의에서 돌아가며 의견 말하기", b: "가족회의 전에 각자 의견 적어 내기", category: "family", spice: "mild" },
  { a: "아이의 작품을 집 안에 전시하기", b: "아이의 작품을 모아 작품집 만들기", category: "family", spice: "mild" },
  { a: "결혼식에서 둘이 함께 입장하기", b: "결혼식에서 각자 입장해 중간에서 만나기", category: "family", spice: "mild" },
  { a: "가족 여행 경비 공동으로 모으기", b: "가족 여행 경비 각자 준비하기", category: "family", spice: "mild" },
  { a: "아이와 규칙을 함께 정하고 자주 조정하기", b: "아이에게 기본 규칙을 정해주고 꾸준히 지키기", category: "family", spice: "mild" },
  { a: "명절 행사 줄이자고 하고 어른들 눈치 보기", b: "명절 행사 그대로 두고 내 휴식 포기하기", category: "family", spice: "medium" },
  { a: "부모님이 주신 선물 안 쓴다고 솔직히 말하기", b: "부모님 오실 때만 안 쓰던 선물 꺼내 쓰는 척하기", category: "family", spice: "medium" },
  { a: "부모님이 고른 촌스러운 청첩장 쓰기", b: "내 청첩장 고집하고 유난이라는 말 듣기", category: "family", spice: "medium" },
  { a: "결혼 계획 없다고 친척에게 단호히 말하기", b: "질문 피하고 다음 가족 모임에도 또 듣기", category: "family", spice: "medium" },
  { a: "부모님 선물값 똑같이 내고 내 부담 커지기", b: "부모님 선물값 덜 내고 내 형편 설명하기", category: "family", spice: "medium" },
  { a: "내 가족의 장난을 배우자가 정색하고 거절하기", b: "배우자 가족의 장난을 내가 정색하고 거절하기", category: "family", spice: "medium" },
  { a: "부모님이 연인 앞에서 내 유치한 별명 부르기", b: "부모님이 연인에게 내 연애 상담 내용 말하기", category: "family", spice: "medium" },
  { a: "육아 조언 거절하고 부모님 서운하게 하기", b: "육아 조언 따르고 내 원칙 양보하기", category: "family", spice: "medium" },
  { a: "가족 앞에서 배우자와 육아 규칙으로 다투기", b: "가족 앞에서 배우자 말에 동의하는 척하기", category: "family", spice: "medium" },
  { a: "가족 모임에서 내 말만 계속 끊기기", b: "가족 모임에서 내 농담에 아무도 안 웃기", category: "family", spice: "medium" },
  { a: "아이에게 말과 행동이 다르다는 소리 듣기", b: "부모님께 내 아이한테 배우라는 소리 듣기", category: "family", spice: "medium" },
  { a: "결혼식 축사에서 내 허세 폭로되기", b: "결혼식 축사에서 내 소심함 폭로되기", category: "family", spice: "medium" },
  { a: "가족 단톡방 나가고 이유 설명하기", b: "가족 단톡방 남고 매일 답장 기대받기", category: "family", spice: "medium" },
  { a: "사랑 없이 조건만 맞는 사람과 결혼하기", b: "사랑하지만 평생 결혼 안 할 사람 만나기", category: "family", spice: "hot" },
  { a: "부모님 편들고 배우자에게 독립 못 했다는 말 듣기", b: "배우자 편들고 부모님께 불효한다는 말 듣기", category: "family", spice: "hot" },
  { a: "자녀 계획 안 맞아서 결혼 한 달 전 파혼하기", b: "자녀 계획 안 맞아도 결혼하고 내 뜻 접기", category: "family", spice: "hot" },
  { a: "배우자 몰래 형제에게 공동 저축 3천만 원 빌려주기", b: "배우자 뜻대로 돈 부탁 거절하고 형제와 연락 끊기", category: "family", spice: "hot" },
  { a: "양가 반대 무릅쓰고 혼인신고 후 통보하기", b: "양가 허락 기다리며 혼인신고 계속 미루기", category: "family", spice: "hot" },
  { a: "전 재산을 아이에게 남기고 배우자 몫 없애기", b: "전 재산을 배우자에게 남기고 아이 몫 없애기", category: "family", spice: "hot" },
  { a: "배우자가 내 가족 행사에만 함께 안 가겠다고 하기", b: "배우자가 자기 가족 행사에 나 혼자 대신 가라고 하기", category: "family", spice: "hot" },
  { a: "유산 5억 받고 부모님께 아이 이름 결정권 드리기", b: "유산 5억 포기하고 배우자와 아이 이름 직접 짓기", category: "family", spice: "hot" }
];

/* ===== 🎯 이 중 누가? 모드 데이터 ===== */
const whoCategories = {
  habit: { label: "😴 생활 습관" },
  work: { label: "💼 직장 & 학교" },
  love: { label: "💘 연애" },
  party: { label: "🍻 놀기 & 모임" },
  future: { label: "🦸 상상 & 미래" },
  silly: { label: "🤪 엉뚱 & 웃긴 상황" },
  food: { label: "🍜 먹는 것 & 취향" },
  phone: { label: "📱 폰 & SNS" },
  money: { label: "💸 돈 & 소비" },
  trip: { label: "✈️ 여행 & 이동" }
};

const whoItems = [
  { text: "이 중에 제일 늦게 일어날 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 알람을 제일 많이 맞춰 둘 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 방 정리를 제일 잘할 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 주말에 집에서 한 발짝도 안 나갈 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 배달 앱을 제일 자주 켤 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 아침마다 일정한 순서로 하루를 시작할 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 휴대폰 배터리가 늘 간당간당할 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 약속 시간에 제일 먼저 도착할 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 물건을 제일 자주 잃어버릴 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 새벽까지 유튜브 보다가 잠들 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 손님 오기 직전에 물건을 전부 옷장에 쑤셔 넣을 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 세탁한 옷이라며 어제 입은 옷을 다시 입고 들킬 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 충동구매한 택배를 가족(룸메) 몰래 받을 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 '나 지금 출발했어'라고 하고 아직 집일 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 알림을 못 본 척하다가 온라인 상태로 들킬 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 까다롭지 않다고 해놓고 메뉴가 정해지면 꼭 바꾸자고 할 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 '내일부터 진짜 한다'를 1년째 말하고 있을 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 조용히 산다더니 이웃에게 샤워 노래를 줄여달라는 말을 들을 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 회의 때 제일 먼저 아이디어를 낼 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 시험 기간에 갑자기 방 청소를 시작할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 팀플에서 조장을 맡을 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 점심 메뉴를 제일 잘 고를 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 단톡방 공지를 제일 꼼꼼히 챙길 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 탕비실 간식을 제일 먼저 발견할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 발표를 제일 떨지 않고 할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 새로 온 동료의 적응을 가장 잘 도와줄 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 동료 생일을 제일 잘 챙길 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 필기를 제일 예쁘게 할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 회의 중에 몰래 딴짓하다 걸릴 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 연차 낸 날 상사와 우연히 마주치면 괜히 바쁜 척할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 '확인했습니다' 하고 사실 안 읽었을 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 퇴사 상상만 하다가 실수로 사직서 초안을 공유할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 회사(학교) 익명 게시판에 몰래 글 올려 봤을 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 퇴근 시간 1분 전부터 가방 쌀 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 단톡방에서 싫다던 일을 상사 앞에서는 가장 좋아하는 척할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 화상 회의에서 음소거 안 하고 혼잣말할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 기념일을 제일 잘 챙길 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 연인에게 줄 작은 선물을 직접 만들 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 연애편지를 제일 감동적으로 쓸 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 데이트 코스를 엑셀로 짤 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 애인한테 제일 다정할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 로맨틱 코미디의 주인공 역할이 잘 어울릴 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 첫눈에 반하는 걸 믿을 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 연애 상담을 제일 잘해 줄 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 커플템을 제일 좋아할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 고백을 제일 로맨틱하게 할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 연인 앞에서 쓰던 애교 말투가 친구 앞에서 튀어나올 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 썸 타면서 티 제일 많이 날 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 새벽에 감성 폭발해서 장문 카톡 보낼 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 연인 사진을 올리고 반응이 없으면 친구에게 좋아요를 부탁할 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 썸 상대가 무심하면 잘나가는 다른 소개팅 제안을 괜히 흘릴 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 연락 답장 기다리며 1분마다 폰 볼 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 연애하면 친구들 약속 제일 먼저 미룰 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 썸 상대 카톡 답장을 친구들한테 검사받을 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 모임 약속을 제일 먼저 잡을 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 노래방에서 마이크를 제일 오래 잡을 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 맛집 리스트를 제일 많이 갖고 있을 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 단체 사진을 제일 잘 찍어 줄 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 여행 계획을 제일 꼼꼼하게 짤 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 게임에서 제일 승부욕 불태울 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 모임 분위기를 가장 편안하게 만들어줄 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 모임 끝나고 제일 먼저 집에 갈 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 정산을 제일 빨리 해 줄 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 처음 보는 사람과 제일 빨리 친해질 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 술자리에서 평소 못 하던 자기 자랑을 길게 할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 모임 끝까지 있겠다더니 빠질 핑계부터 찾을 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 모임에서 한 농담의 반응이 없으면 끝까지 뜻을 설명할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 다음 날 단톡방에 '어제 나 괜찮았어?' 물어볼 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 '나 집에 갈게' 하고 2시간 더 있을 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 모임에서는 춤출 줄 모른다더니 연습 영상이 발견될 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 남의 개인기를 혹평하다 자기 차례에는 뒤로 뺄 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 진실게임에서 허세를 부리다가 추가 질문에 당황할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 좀비 사태에서 제일 오래 살아남을 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 무인도에서 제일 잘 버틸 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 10년 뒤에 유명해져 있을 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 우주여행을 제일 먼저 갈 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 시골에서 텃밭 가꾸며 살 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 초능력이 생기면 제일 잘 쓸 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 책을 써서 작가가 될 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 세계 일주를 제일 먼저 할 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 나중에 유튜버로 대박 날 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 타임머신 타면 과거로 갈 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 다음 동창회에서 근황을 실제보다 화려하게 말할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 큰 보너스를 받으면 축하보다 밥 사라는 말을 피하려고 숨길 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 친구와 함께 살게 되면 집안일 분담표부터 슬쩍 유리하게 짤 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 유명해지면 예전 자기 자랑 글부터 조용히 지울 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 결혼식 예산을 짜다가 평소 소박하다는 말과 달라질 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 새 직장에 가면 첫날부터 전 직장보다 낫다고 했다가 후회할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 리얼리티 예능에 나가면 카메라 앞뒤 말투가 달라서 놀림받을 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 소개팅 방송에 나가면 쿨한 척하다 답장 시간에 집착할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 길을 제일 자주 잃을 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 영화 보다가 제일 먼저 울 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 동물들이 제일 잘 따를 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 자판기 앞에서 제일 오래 고민할 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 아재 개그를 제일 많이 할 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 놀이공원에서 제일 크게 소리 지를 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 엘리베이터에서 혼자 노래 부를 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 식물한테 말 걸 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 인형 뽑기에 제일 진심일 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 웃음 참기 게임에서 제일 먼저 터질 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 모르는 사람에게 친구인 줄 알고 비밀 얘기를 시작할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 친구에게 보내려던 허세 가득한 수상 소감 연습 영상을 단체방에 올릴 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 '나 원래 이런 사람 아닌데'를 제일 자주 할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 거울 앞에서 연습한 표정을 소개팅에서 쓰다가 친구에게 들킬 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 셀카 고르다가 약속에 늦고 차가 막혔다고 할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 넘어져 아픈데도 썸 상대 앞이라 안 아픈 척할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 진지한 순간에 웃음 터져서 혼날 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 친구 사진은 막 올리면서 자기 사진만 까다롭게 검수할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 전 애인 SNS를 아직도 몰래 볼 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 연인에게도 말 못 할 스킨십 취향을 비밀 메모로 적어둘 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 전 애인에게 다시 만나자는 메시지를 써놓고 전송 직전 멈출 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 연인에게 숨긴 데이트 비용만큼은 정확히 기억할 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 연인 앞에서 자기 플러팅 메시지를 업무 연락이라고 둘러댈 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 사내연애를 몰래 하고 있을 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 사내연애 중인 연인을 질투해서 업무 배정까지 신경 쓸 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 퇴근 후 동료와의 비밀 데이트를 야근이라고 말할 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 동료의 호감을 알면서도 업무상 도움 때문에 선을 애매하게 둘 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 연인에게 연봉을 부풀려 말하고 데이트 비용 때문에 곤란해질 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 동료보다 연봉이 높다는 걸 연인에게 자랑하다 비밀이 퍼질 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 전 애인이 다시 고백하면 현 연인과 진지하게 비교할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 어장 관리를 제일 잘할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 전 애인의 결혼 소식에 아무렇지 않은 척하면서 가장 동요할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 연인의 전 애인보다 스킨십을 더 잘하고 싶어 할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 친구의 전 애인과 사귈 수 있을 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 첫 데이트에서 키스까지 갈 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 호감 없는 사람에게 받은 비싼 선물은 돌려주기 망설일 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 전 애인과 연락한 사실보다 대화 내용을 더 숨기고 싶어 할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 새로운 사람에게 끌리면 이별 전부터 가능성을 확인할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 연인의 자산을 안 뒤 결혼 계획을 앞당길 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 지금 이 자리에 끌리는 사람이 있어도 끝까지 아닌 척할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 서로 원한다면 먼저 스킨십을 제안할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 술 마시면 전 애인한테 전화할 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 술자리에서 현 연인과 전 애인의 스킨십을 비교하는 말을 할 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 술자리에서 끌리는 사람에게 안아도 되냐고 먼저 물을 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 이 모임 사람이랑 몰래 사귈 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 커플 모임에서 친구 연인에게 끌려 눈을 피할 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 모임에서 전 애인의 새 연인 얘기를 듣고 비교 질문을 할 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 호감 있는 사람이 있는 술자리에서 무리해서 크게 한턱낼 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 전 애인과 나오는 연애 예능에서 끝났다고 하면서 질투할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼 준비 중에도 더 끌리는 사람이 나타나면 결혼을 미룰 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 유명인과 사귄다면 비밀 연애 약속보다 자랑하고 싶은 마음이 클 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼 후 배우자에게 숨긴 비상금을 가장 많이 모을 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼 후에도 친구와 클럽에 가서 다른 사람의 호감을 확인하고 싶어 할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 거울 앞에서 키스할 때 멋져 보일 표정을 연습할 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 소개팅에서 스킨십이 잘 맞을지 대놓고 물어볼 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 연인과의 잠자리에 대한 고민을 절친에게 가장 솔직히 말할 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 진실게임에서 끌리는 사람을 들킬까 봐 먼저 과감한 질문을 던질 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 오늘 모임 후 끌린 사람에게 단둘이 더 만나자고 연락할 것 같은 사람은?", category: "silly", spice: "hot" },

  { text: "이 중에 외출 전에 날씨에 맞춰 가방을 챙길 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 장보기 목록을 냉장고에 붙여 둘 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 간식 봉지를 뜯으면 집게부터 찾을 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 집에서 쓰는 컵에 유난히 애착이 있을 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 낯선 동네에서도 산책 코스를 금방 찾을 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 옷의 세탁 표시를 꼼꼼하게 읽을 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 택배 상자를 반듯하게 접어 버릴 것 같은 사람은?", category: "habit", spice: "mild" },
  { text: "이 중에 비싼 취미 용품을 사고 첫날만 쓸 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 계획표를 꾸미는 데 시간을 쓰고 정작 할 일은 안 했다고 들킬 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 휴대폰을 거의 안 본다더니 사용 시간 인증은 피할 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 남은 음식을 안 버린다고 자랑한 뒤 냉장고 정리는 거절할 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 쿠폰 때문에 쓸데없는 걸 산 뒤 절약했다고 끝까지 우길 것 같은 사람은?", category: "habit", spice: "medium" },
  { text: "이 중에 생활비가 빠듯해도 남몰래 만나는 사람과의 데이트에는 크게 쓸 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 연인의 물건보다 전 애인에게 받은 선물을 더 오래 간직할 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 모임에서 만난 사람을 친구 후보와 연애 후보로 따로 기억할 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 연인과 연락을 마친 뒤 전 애인의 안부 메시지에는 답할 것 같은 사람은?", category: "habit", spice: "hot" },
  { text: "이 중에 새로 온 사람에게 복사기 사용법부터 알려줄 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 회의록을 한눈에 읽히게 정리할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 책상 위에 작은 화분을 놓을 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 학교나 직장에 새 동아리를 만들 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 자료에 어울리는 제목을 잘 지을 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 배운 내용을 다른 사람에게 쉽게 설명할 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 퇴근길에 동료와 동네 빵집에 들를 것 같은 사람은?", category: "work", spice: "mild" },
  { text: "이 중에 회의 자료에 남겨둔 투덜거림을 지우지 않고 제출할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 회의에서 멋진 용어를 썼다가 뜻을 되물을까 긴장할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 후배 앞에서만 유난히 바쁜 척할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 상사 농담이 안 웃겨도 가장 크게 웃을 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 발표를 망친 뒤 연습 때는 완벽했다며 가장 오래 해명할 것 같은 사람은?", category: "work", spice: "medium" },
  { text: "이 중에 절친과 동업해도 연인에게 줄 지분부터 따로 챙길 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 친구의 성공을 축하하면서 속으로는 수입부터 계산할 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 끌리지 않아도 상대의 직업과 재력 때문에 연애를 시작할 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 연인보다 수입이 훨씬 많은 사람에게 마음이 흔들릴 것 같은 사람은?", category: "work", spice: "hot" },
  { text: "이 중에 상대가 좋아하는 노래를 기억했다가 틀어줄 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 데이트 중 예쁜 풍경을 보면 상대부터 사진에 담을 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 말없이 걸어도 어색하지 않은 데이트를 할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 함께 도전할 취미를 열 가지쯤 제안할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 좋아하는 사람의 작은 성취도 크게 축하할 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 추운 날 상대 주머니에 핫팩을 넣어줄 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 로맨스 영화의 숨은 명장면을 잘 찾을 것 같은 사람은?", category: "love", spice: "mild" },
  { text: "이 중에 소개팅 전에 멋진 식당을 예약했다가 가격 때문에 바꿀 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 연애 조언은 단호하게 해놓고 자기 차례에는 못 지킬 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 썸 상대 앞에서 좋아하지도 않는 취미를 좋아한다고 할 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 사귀기도 전에 커플 여행 일정을 상상할 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 썸 상대의 선물이 부담스러운데 더 비싼 선물로 갚으려 할 것 같은 사람은?", category: "love", spice: "medium" },
  { text: "이 중에 헤어질 때 솔직한 이유 대신 착한 사람으로 남을 말을 고를 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 지금 이 자리에서 입맞춤을 상상해 본 상대가 있을 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 연인이 잘나가는 전 애인을 칭찬하면 자존심이 크게 상할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 사랑은 식어도 상대의 경제력 때문에 이별을 미룰 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 연인에게 스킨십 취향을 말할 때 가장 직접적으로 요구할 것 같은 사람은?", category: "love", spice: "hot" },
  { text: "이 중에 처음 온 사람에게 게임 규칙을 차근차근 알려줄 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 파티 장식의 색을 예쁘게 맞출 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 모임에서 신청곡을 센스 있게 고를 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 피크닉에 여분의 돗자리를 챙겨올 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 마지막에 남아서 분리수거를 도울 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 모임 사진으로 짧은 기념 영상을 만들 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 말이 끊기면 모두가 답하기 쉬운 질문을 던질 것 같은 사람은?", category: "party", spice: "mild" },
  { text: "이 중에 게임 규칙을 안 듣고 졌다가 설명을 안 해줬다고 할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 다 아는 노래라며 신청하고 가사는 하나도 모를 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 편하게 입고 오라던 모임에 혼자 차려입고 그냥 입은 거라고 할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 경품에 관심 없는 척하다 당첨자에게 바꾸자고 할 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 친한 친구가 게임에서 자기 대신 다른 사람 편을 들면 삐칠 것 같은 사람은?", category: "party", spice: "medium" },
  { text: "이 중에 이 자리에서 사귀고 싶은 사람과 결혼하고 싶은 사람을 다르게 고를 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 친구 커플이 헤어졌다는 소식에 은근히 기회를 느낄 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 이 모임에 전 애인이 와도 현 연인에게 과거를 숨길 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 이 자리에서 받은 호감을 나중에 연인에게 은근히 자랑할 것 같은 사람은?", category: "party", spice: "hot" },
  { text: "이 중에 미래에 동네 작은 영화관을 운영할 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 외계인을 만나면 지구 음식을 먼저 소개할 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 바닷속 도시의 첫 주민 모집에 지원할 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 은퇴 후 동네 합창단에 들어갈 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 미래의 집에 커다란 작업실을 만들 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 새 행성에 가면 지명부터 재미있게 지을 것 같은 사람은?", category: "future", spice: "mild" },
  { text: "이 중에 십 년 뒤 동창회에서 친구 근황보다 연봉부터 물을 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 처음 후배가 생기면 안 바빠도 바쁜 척 일정을 보여줄 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 다음 이사에서 친구 도움을 받고 자기 차례에는 바쁘다고 할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 새해 목표를 다시 물으면 원래 목표를 슬쩍 낮춰 말할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 새 동호회에 들어가면 초보인데도 경험자라고 말할 것 같은 사람은?", category: "future", spice: "medium" },
  { text: "이 중에 결혼을 결정하기 전 상대의 자산부터 확인하고 싶어 할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼식에 전 애인을 초대하고 배우자에게는 옛 친구라고 소개할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼을 생각해도 스킨십이 안 맞으면 관계를 다시 고민할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 결혼 전에 연인에게 말할 연애 횟수를 줄여 말할 것 같은 사람은?", category: "future", spice: "hot" },
  { text: "이 중에 빵 반죽에 이름을 붙여 키울 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 박물관 체험 버튼을 빠짐없이 눌러볼 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 퍼즐 마지막 한 조각을 끼우려고 끝까지 기다릴 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 버스 창밖 풍경을 보며 뮤직비디오 주인공이 될 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 눈사람에게 그럴듯한 직업을 정해줄 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 과자 모양으로 별자리 이야기를 만들 것 같은 사람은?", category: "silly", spice: "mild" },
  { text: "이 중에 소개팅에서 준비한 농담을 두 번 말한 뒤 처음 하는 말인 척할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 음성 메시지를 멋지게 녹음하려다 열 번 넘게 다시 녹음한 걸 들킬 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 길을 잘 안다고 앞장섰다가 지도 앱을 몰래 켤 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 친구가 보내준 사진에 실수로 솔직한 감상부터 답장할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 누군가 손 흔드는 걸 자기한테 한 줄 알고 달려갔다가 아는 척할 것 같은 사람은?", category: "silly", spice: "medium" },
  { text: "이 중에 연애 고수인 척하다 마지막 키스가 언제냐는 질문에 말을 돌릴 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 질투 안 한다고 선언한 뒤 상대의 전 애인과 자기 장점을 비교할 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 비밀 연애 중 커플 할인 앞에서 정체를 밝힐 것 같은 사람은?", category: "silly", spice: "hot" },
  { text: "이 중에 연인과 헤어질 때 빌려준 돈과 남은 미련 중 돈부터 정리할 것 같은 사람은?", category: "silly", spice: "hot" },

  { text: "이 중에 밥 먹을 때 반찬을 한쪽에 모아 둘 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 라면에 넣을 재료를 냉장고에서 한가득 꺼낼 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 과자 봉지를 뜯으면 그릇에 덜어 먹을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 김밥에서 싫어하는 재료를 꼭 빼 먹을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 빵집에 들어서면 빵 냄새부터 맡을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 쌈을 너무 크게 싸서 한입에 못 넣을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 배달 음식이 도착하면 그릇에 예쁘게 옮겨 담을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 고깃집에서 집게를 좀처럼 놓지 않을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 식당 반찬만으로도 밥 한 공기를 먹을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 과일은 껍질째 먹는 걸 좋아할 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 식사 중에 물을 몇 번씩 따라 마실 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 소스 두 가지를 섞어 자기만의 배합을 만들 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 튀김은 눅눅해지기 전에 서둘러 먹을 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 냉동만두를 늘 냉동실에 채워 둘 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 떡집 앞에서 발걸음을 멈출 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 카레를 끓일 때 며칠 치를 한꺼번에 만들 것 같은 사람은?", category: "food", spice: "mild" },
  { text: "이 중에 식사 속도가 느리다는 말을 들으면 괜히 빨리 먹을 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 고수가 싫다고 말하기 민망해서 몰래 골라낼 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 자기 레시피에 조언을 받으면 자존심 상할 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 안 맵다고 큰소리치며 땀을 닦을 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 같이 먹는 감자튀김에서 긴 것만 고를 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 추가 반찬을 부탁하는 일은 친구에게 미룰 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 요리하기 귀찮아서 손님 초대를 취소하고 싶을 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 같이 요리한 뒤 설거지만 슬쩍 피할 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 음식을 남기면 눈치 보여 억지로 다 먹을 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 자기 요리를 칭찬받으려고 감상을 계속 물을 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 커피 취향을 놀림받을까 봐 달달한 메뉴를 못 시킬 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 무료 후식을 더 달라고 했다가 민망해질 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 자기 몫의 배달비를 아끼려고 남의 주문에 낄 것 같은 사람은?", category: "food", spice: "medium" },
  { text: "이 중에 연인이 친구 새우를 까주면 바로 젓가락 내려놓을 것 같은 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 밀키트 포장지를 숨기고 요리 고수 행세를 해봤을 법한 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 와인 맛을 아는 척하다 포도 주스에도 향이 좋다고 할 것 같은 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 썸 상대 앞에서는 조금 먹고 집에 와서 치킨 시킬 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 뷔페에서 본전 뽑겠다고 데이트 분위기 망칠 것 같은 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 헤어지자는 말 듣고도 남은 고기는 포장해 달라고 할 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 친구가 차린 밥상에 점수 매기다가 쫓겨날 것 같은 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 단골 식당에 새 썸 상대를 데려갔다가 지난번 그분은 누구냐는 말을 들을 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 썸 상대에게 먹여주려다 거절당하면 자기가 먹으려던 척할 사람은?", category: "food", spice: "hot" },
  { text: "이 중에 친구에게 딱 맞는 이모티콘을 선물할 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 사진첩에 같은 풍경 사진이 수십 장 있을 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 새 폰을 사면 카메라 기능부터 시험할 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 단톡방 투표를 직접 만들 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 폰 글자 크기를 큼직하게 해 둘 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 충전 케이블을 가방마다 넣어 둘 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 저장한 게시물을 주제별로 묶어 둘 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 자주 쓰는 문장을 키보드 단축어로 만들어 둘 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 프로필 배경을 계절에 맞는 그림으로 바꿀 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 단톡방 이름을 자주 바꿀 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 폰 케이스 안에 사진을 끼워 둘 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 동영상을 볼 때 꼭 자막을 켤 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 모르는 번호로 전화가 오면 번호부터 검색할 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 긴 통화에도 이어폰을 안 쓸 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 메모 앱에 떠오르는 생각을 바로 적을 것 같은 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 댓글로 물어본 정보에 출처까지 찾아 답해 줄 사람은?", category: "phone", spice: "mild" },
  { text: "이 중에 답장이 차가워 보일까 봐 이모티콘을 덧붙일 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 단톡방에서 자기 말에 반응이 없으면 불안할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 삭제한 메시지의 내용을 물으면 괜히 당황할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 통화 버튼을 누르기 전 할 말을 연습할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 지인에게 계정을 알려주기엔 닉네임이 민망할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 있어 보이는 게시물 문구를 쓰려고 한참 고민할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 단톡방에서 자기 생일을 안 챙겨주면 서운할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 광고에 안 넘어간다면서 광고 속 물건을 살 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 자기가 보낸 영상에 친구가 웃는지 눈치 볼 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 단톡방에서 다수 의견에만 동의할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 메시지 말투를 지적받으면 발끈할 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 단톡방을 나가고 싶어도 뒷말이 무서워 남을 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 프사 칭찬을 받고 싶어 괜히 말을 걸 것 같은 사람은?", category: "phone", spice: "medium" },
  { text: "이 중에 썸 상대 둘에게 같은 셀카를 보내려다 단톡방을 만들 것 같은 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 비밀 연애하다 폰 배경화면 하나로 들통날 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 연인에게 폰을 빌려줬다가 '잘 헤어지는 법' 검색 기록을 들킬 것 같은 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 연인과 싸우면 커플 프사부터 내려 기싸움할 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 차인 날 올린 이별 감성 글을 다음 날 지워봤을 법한 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 소개팅 상대를 '예비 애인'으로 저장했다가 본인에게 들킬 것 같은 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 썸 상대 스토리에 뜬 손만 보고 경쟁자 수사에 들어갈 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 고백 메시지를 AI로 쓰고 말투가 왜 바뀌었냐는 답을 받을 것 같은 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 실수로 켠 라이브에서 거울 보며 자기 미모에 감탄할 것 같은 사람은?", category: "phone", spice: "hot" },
  { text: "이 중에 동전이 생기면 저금통에 넣는 재미를 즐길 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 마트에서 용량당 가격을 꼭 비교할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 중고 물건을 사기 전에 흠집 사진을 요청할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 보증금 붙은 빈 병을 모아 한꺼번에 반납할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 매달 구독료가 빠지는 날짜를 달력에 적어 둘 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 큰돈을 쓰기 전에 하루 더 고민할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 가계부 항목 이름을 자기 식으로 재미있게 붙일 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 오래 쓴 물건의 수리비부터 알아볼 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 경제 뉴스에서 모르는 용어를 찾아볼 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 결제할 때 남은 포인트를 꼭 확인할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 선물 받은 포장지를 다시 쓸 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 여행 경비를 별도 통장에 모을 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 장바구니를 채우다 총액을 보고 몇 개 뺄 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 중고 판매 글에 크기와 사용 기간을 정확하게 적을 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 할부보다 일시불 결제를 좋아할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 계획한 금액을 모으면 통장 화면을 저장할 것 같은 사람은?", category: "money", spice: "mild" },
  { text: "이 중에 가격을 잘못 찍은 영수증을 보고도 말 못 할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 구독료가 부담돼도 친구들 앞에서 해지 얘기를 못 할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 빌려준 소액을 돌려달라는 말을 못 꺼낼 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 물건을 사지 말라는 말에 오기가 생길 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 중고 거래 가격 흥정을 친구에게 대신 부탁할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 충동구매한 걸 인정하기 싫어 필요했던 물건이라고 우길 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 더치페이에서 자기가 덜 먹은 날만 억울할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 비싼 취미를 즐기는 친구들 앞에서 주눅 들 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 싸게 산 친구가 괜히 얄미울 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 선물에 쓴 돈만큼 반응을 기대할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 한정판 시세가 오르면 소장할 마음이 흔들릴 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 모임 예산을 초과해도 분위기 깰까 봐 말 못 할 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 카페 지출을 가계부에 적으면서 죄책감을 느낄 것 같은 사람은?", category: "money", spice: "medium" },
  { text: "이 중에 소개팅 계산대에서 카드 비밀번호가 생각 안 나는 척할 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 전 애인이 중고로 내놓은 커플링에 익명으로 가격을 깎을 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 명품 쇼핑백에 생필품을 넣고 썸 상대를 만나러 갈 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 재테크 고수인 척하다 수익률 화면만 끝까지 숨길 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 할인받아 산 연인 선물을 정가로 샀다고 말할 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 친구와 같이 산 복권이 당첨되면 누가 돈 냈는지부터 따질 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 지갑을 안 가져왔다면서 적립 바코드는 바로 꺼낼 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 게임에 쓴 돈을 물으면 원화 대신 포인트로 답할 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 돈 없다던 날 굿즈 경매에서 친구와 맞붙을 것 같은 사람은?", category: "money", spice: "hot" },
  { text: "이 중에 수하물 벨트에서 가방 나올 때마다 일어설 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 여행지 교통카드를 기념으로 챙겨올 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 숙소에 도착하면 비상구 위치부터 확인할 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 관광 안내소에서 종이 지도를 챙길 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 휴게소에 들를 때마다 호두과자를 살 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 여행 가방에 비닐봉지를 넉넉히 챙길 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 공항 보안 검색 전에 주머니를 미리 비울 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 비행기에서 내릴 때 좌석 주머니까지 확인할 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 숙소 슬리퍼를 신고 방 안을 돌아다닐 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 친구들 짐을 트렁크에 차곡차곡 넣을 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 여행지의 인사말을 배워서 써볼 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 환승 시간을 넉넉하게 잡을 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 기내식 메뉴를 미리 찾아볼 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 전망대에서 안내판을 끝까지 읽을 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 숙소 후기에서 수압 정보를 가장 유심히 읽을 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 여행 마지막 날에는 입은 옷을 따로 담을 것 같은 사람은?", category: "trip", spice: "mild" },
  { text: "이 중에 친구 가방을 자기 짐으로 더 무겁게 만들 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 여행 준비를 맡은 친구에게 잔소리꾼이라고 할 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 숙소 고르기를 맡겨놓고 베개가 별로라며 투덜댈 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 운전하는 친구에게 계속 운전 훈수를 둘 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 여행 중 친구가 혼자 놀러 가면 버림받은 기분이 들 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 여행 후에도 기념품 칭찬을 은근히 기다릴 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 여행 중 늦잠을 자고도 알람 탓을 할 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 단체 일정에서 빠지고 싶어도 말 못 할 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 흥정을 잘했다고 자랑했다가 바가지 쓴 걸 숨길 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 할인 대상인 나이를 밝히기 민망해 입장료를 다 낼 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 자기가 고른 공연이 재미없어도 인정 못 할 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 주차를 못 해도 자존심 때문에 도움을 거절할 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 숙소 욕실을 오래 쓰고도 잠깐 썼다고 우길 것 같은 사람은?", category: "trip", spice: "medium" },
  { text: "이 중에 여행 중 만난 사람에게 반해 귀국 날짜를 미룰 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 전 애인과 왔던 숙소에서 와이파이가 자동으로 연결될 것 같은 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 커플 여행 첫날 싸우고 귀국 항공편부터 검색할 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 해외 클럽에서 가명을 쓰고 일주일짜리 로맨스를 찍을 것 같은 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 외국어를 잘하는 척 주문하다 음식 대신 빈 접시를 받을 것 같은 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 혼자 여행 왔다더니 부모님 패키지 버스에서 내릴 것 같은 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 번지점프를 하자고 부추기고 혼자 촬영 담당을 자처할 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 숙소 수건을 기념품이라며 캐리어에 챙길 것 같은 사람은?", category: "trip", spice: "hot" },
  { text: "이 중에 여행 영상에서 싸운 장면만 잘라내고 우정 여행이라 할 사람은?", category: "trip", spice: "hot" }
];

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
selectSpice(currentSpice);

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(() => {
    /* 오프라인 첫 방문·등록 제한 환경에서도 질문 뽑기는 계속 동작합니다. */
  });
}

const moveNoticeKey = "icebreaker:move-notice-dismissed";
const moveNotice = document.createElement("dialog");
moveNotice.className = "move-notice";
moveNotice.setAttribute("aria-labelledby", "moveNoticeTitle");
moveNotice.setAttribute("aria-describedby", "moveNoticeDescription");
moveNotice.innerHTML = `
  <h2 id="moveNoticeTitle">Icebreaker 주소가 바뀌었습니다</h2>
  <p id="moveNoticeDescription">새 주소에서도 대화 주제, 밸런스게임, 이 중 누가?를 그대로 이용할 수 있어요.</p>
  <p class="move-note">이전 주소는 잠시 더 이용할 수 있지만, 새 기능과 업데이트는 새 주소에 먼저 적용됩니다. 이전 주소는 추후 종료될 예정입니다.</p>
  <div class="move-notice-actions">
    <a class="move-primary" href="https://icebreaker-de4.pages.dev/">새 Icebreaker로 이동</a>
    <button type="button">현재 페이지 그대로 사용</button>
  </div>
`;
document.body.appendChild(moveNotice);
moveNotice.querySelector("button").addEventListener("click", () => moveNotice.close());
moveNotice.addEventListener("close", () => {
  try { localStorage.setItem(moveNoticeKey, "1"); } catch (e) { /* 저장소 사용 불가 시 이번 방문에서만 닫기 */ }
});
try {
  if (!localStorage.getItem(moveNoticeKey)) moveNotice.showModal();
} catch (e) {
  moveNotice.showModal();
}
