# AGENTS.md — Icebreaker 인수인계 문서

이 문서는 이전 대화 기록 없이 이 저장소를 처음 맡는 사람(또는 AI 에이전트)을 위한 안내서입니다.
작업 전에 끝까지 읽어 주세요.

## 1. 프로젝트 목적

모임(소그룹, 동아리, 회사 등)에서 어색함을 깨기 위한 웹앱입니다.

- **💬 대화 주제 모드**: 랜덤 대화 질문 뽑기
- **⚖️ 밸런스 게임 모드**: A/B 중 하나를 고르는 양자택일 질문 뽑기

- **🎯 이 중 누가? 모드**: 질문에 어울리는 사람을 함께 가리키기(참여는 선택)
- **📱 PWA**: 설치 및 최초 온라인 캐시 이후 오프라인 사용

- 라이브 주소: https://chehok.github.io/icebreaker/
- 저장소: https://github.com/Chehok/icebreaker (공개 저장소)

## 2. 구조

### 파일

| 파일 | 설명 |
|---|---|
| `index.html` | 앱 전체 (HTML + CSS + JS + 질문 데이터). **단일 파일**, 빌드 없음, 의존성 없음 |
| `sw.js` | 앱 셸 오프라인 캐시, 버전 `icebreaker-v5`, 글꼴 캐시 `icebreaker-fonts-v1` |
| `manifest.webmanifest` | 상대 경로 시작 URL·범위·설치 아이콘 |
| `icons/` | PWA 및 Apple 터치 아이콘 |
| `README.md` | 사람용 간단 소개 |
| `AGENTS.md` | 이 문서 (상세 인수인계) |
| `CLAUDE.md` | `@AGENTS.md` 한 줄 (Claude Code가 이 문서를 읽도록 연결) |

### 페이지 기본 정보

- 탭 제목: `<title>Icebreaker</title>`
- 파비콘: 🧊 이모지를 담은 SVG data URI (`<link rel="icon" href="data:image/svg+xml,...🧊...">`) — 별도 이미지 파일 없음
- 마지막 사용 모드 저장: `localStorage` 키 **`icebreaker:mode`** (값: `"topic"`, `"balance"`, `"who"`)
  - `localStorage`를 쓸 수 없는 환경에서는 조용히 무시하고 기본값 `topic`으로 시작합니다.

### 데이터 구조 (`index.html`의 `<script>` 안)

모든 질문 데이터는 `index.html` 하단 `<script>`에 JS 상수로 들어 있습니다.

#### 💬 대화 주제 모드

```js
const categories = {
  imagine: { label: "🌈 상상 & 가정" },
  favorite: { label: "🍔 취향 & 최애" },
  // ... 총 23개
};

const mildQuestions = [   // 😋 순한맛
  { text: "무인도에 딱 3가지만 가져갈 수 있다면?", category: "imagine" },
  // ...
];

const spicyQuestions = [  // 🌶️ 매운맛
  { text: "내일 세상이 끝난다면 오늘 밤 무엇을 하고 싶어?", category: "imagine" },
  // ...
];

// 두 배열을 합치면서 spice 필드를 자동으로 붙임 (직접 수정할 필요 없음)
const questions = [
  ...mildQuestions.map((q) => ({ ...q, spice: "mild" })),
  ...spicyQuestions.map((q) => ({ ...q, spice: "spicy" }))
];
```

- 질문 객체 모양: `{ text: string, category: string }`
- 순한맛/매운맛은 **어느 배열에 넣느냐**로 결정됩니다. (`spice` 필드를 직접 쓰지 않음)
- 카테고리 키 23개: `imagine`, `favorite`, `daily`, `faith`, `love`, `tmi`, `hobby`, `deep`, `travel`, `food`, `memory`, `politics`, `invest`, `work`, `content`, `season`, `place`, `pet`, `habit`, `shop`, `school`, `silly`, `thanks`

#### ⚖️ 밸런스 게임 모드

```js
const balanceCategories = {
  food:  { label: "🍜 음식" },
  love:  { label: "💘 연애" },
  work:  { label: "💼 직장 & 돈" },
  power: { label: "🦸 초능력 & 상상" },
  life:  { label: "🌀 일상 & 극한 상황" },
  weird: { label: "🤪 엽기 & 괴식" },
  travel:  { label: "✈️ 여행 & 휴가" },
  friends: { label: "🤝 친구 & 인간관계" },
  school:  { label: "🏫 학교 & 추억" },
  tech:    { label: "📱 테크 & SNS" }
};

const balanceItems = [
  { a: "짜장면만 평생 먹기", b: "짬뽕만 평생 먹기", category: "food", spice: "mild" },
  // ...
];
```

- 항목 객체 모양: `{ a: string, b: string, category: string, spice: "mild" | "spicy" }`
- 밸런스 게임은 **한 배열**에 순한맛/매운맛이 섞여 있고, `spice` 필드로 구분합니다.
- 주의: 대화 주제 모드와 밸런스 게임 모드의 카테고리 키는 **서로 별개**입니다. (`food`, `love`, `work`, `travel`, `school`이 양쪽에 있지만 다른 객체)

#### 🎯 이 중 누가? 모드

- 카테고리 객체: `whoCategories`, 질문 배열: `whoItems`
- 항목: `{ text: string, category: string, spice: "mild" | "spicy" }`
- 카테고리: `habit`, `work`, `love`, `party`, `future`, `silly`
- 각 카테고리는 순한맛 10개 + 매운맛 8개입니다. 카테고리 키는 모드별로 독립적입니다.

#### 공통 설정

```js
const spices = {
  mild:  { label: "😋 순한맛" },
  spicy: { label: "🌶️ 매운맛" }
};

const modes = {
  topic:   { label: "💬 대화 주제",   categories, items: questions, ... },
  balance: { label: "⚖️ 밸런스 게임", categories: balanceCategories, items: balanceItems, ... },
  who:     { label: "🎯 이 중 누가?", categories: whoCategories, items: whoItems, ... }
};

const STORAGE_KEY = "icebreaker:mode";
```

- 화면의 카테고리 칩은 `categories` / `balanceCategories` / `whoCategories` 객체에서 자동 생성됩니다. (`✨ 전체` 칩은 코드에서 따로 추가)
- 뽑기 풀 = 현재 모드의 `items` 중 `spice`가 선택한 맛과 같고, 카테고리가 `전체`이거나 선택한 카테고리와 같은 것. 직전과 같은 질문은 연속으로 나오지 않습니다.

### 현재 수량 (2026-10-29 기준, `index.html`에서 직접 집계)

| 모드 | 카테고리 | 질문 수 | 내역 |
|---|---|---|---|
| 💬 대화 주제 | 23 | **416** | 순한맛 230 + 매운맛 186 |
| ⚖️ 밸런스 게임 | 10 | **216** | 순한맛 118 + 매운맛 98 (기존 6개 카테고리는 24개씩, 새 4개 카테고리는 18개씩) |

| 🎯 이 중 누가? | 6 | **108** | 순한맛 60 + 매운맛 48 (각 카테고리 10 + 8) |

합계 **740개**입니다. 문구만 수정하는 검토에서는 모드·카테고리·맛별 수량을 유지하세요. 순한맛은 첫 만남에도 안전하게, 매운맛은 가벼운 민망함·솔직함 위주로 작성합니다. 성적 내용, 비하, 실명, 트라우마·건강 고백 압박은 피하고 신앙·정치 의견은 존중하세요. 답변과 지목 참여는 언제든 건너뛸 수 있습니다.

질문을 추가/삭제하면 이 표와 `README.md`의 숫자도 함께 갱신해 주세요.

## 3. 질문 추가·수정 방법 (단계별)

### 대화 주제 질문 추가

1. `index.html`을 UTF-8로 엽니다. (VS Code 권장. 메모장 등으로 인코딩이 바뀌지 않게 주의)
2. 순한맛이면 `mildQuestions`, 매운맛이면 `spicyQuestions` 배열을 찾습니다.
3. 같은 카테고리 질문들이 모여 있는 위치에 한 줄을 추가합니다.
4. `category` 값은 반드시 `categories`에 **이미 있는 키**여야 합니다. 없는 키를 쓰면 뽑을 때 오류가 납니다.
5. 배열의 **마지막 항목 뒤에는 쉼표가 없어야** 합니다. 중간에 추가할 때는 앞뒤 쉼표를 확인하세요.

예시 (순한맛 `food` 카테고리에 질문 1개 추가):

```js
const mildQuestions = [
  // ...
  { text: "인생 최고의 음식 딱 하나만 꼽는다면?", category: "food" },
  { text: "평생 한 가지 반찬만 먹어야 한다면 뭘 고를래?", category: "food" }, // ← 새로 추가
  // ...
];
```

### 밸런스 게임 질문 추가

1. `balanceItems` 배열을 찾습니다.
2. 같은 카테고리·같은 맛 항목들이 모인 곳에 한 줄을 추가합니다.
3. `a`, `b`, `category`, `spice` 네 필드를 **모두** 채웁니다. `spice`는 `"mild"` 또는 `"spicy"`만 허용됩니다.

예시:

```js
{ a: "평생 여름만 있는 나라에서 살기", b: "평생 겨울만 있는 나라에서 살기", category: "life", spice: "mild" },
```

### 새 카테고리 추가

1. 대화 주제면 `categories`, 밸런스 게임이면 `balanceCategories`에 `키: { label: "이모지 이름" }`을 추가합니다.
   ```js
   music: { label: "🎵 음악 & 노래" }
   ```
2. 그 키를 쓰는 질문을 **순한맛과 매운맛 양쪽에 최소 1개 이상씩** 넣어 주세요. 한쪽이 비어 있으면 해당 맛에서 그 카테고리를 고를 때 아무것도 뽑히지 않습니다.

### 질문 수정·삭제

- 해당 줄의 문구를 고치거나 줄을 지우면 됩니다. 삭제 후 쉼표(특히 배열 마지막 줄)를 확인하세요.
- 중복 질문이 없는지 확인하세요. (같은 `text`나 같은 `a`/`b` 조합)

## 4. 테스트 체크리스트

빌드가 없으므로 `index.html`을 브라우저로 직접 열어서 확인합니다.

- [ ] 브라우저 개발자 도구(F12) 콘솔에 오류가 없다
- [ ] 💬 대화 주제 / ⚖️ 밸런스 게임 / 🎯 이 중 누가? 모드 전환이 된다
- [ ] 😋 순한맛 / 🌶️ 매운맛 전환이 된다
- [ ] `✨ 전체`와 각 카테고리(특히 새로 추가/수정한 카테고리)에서 뽑기가 된다
- [ ] 하단 카운터의 질문 수가 예상대로 늘었다/줄었다
- [ ] 밸런스 게임에서 A/B 선택이 정상 표시된다
- [ ] 새로고침 후 마지막 모드가 유지된다 (`icebreaker:mode`)
- [ ] 한글이 깨지지 않는다 (파일이 UTF-8로 저장됨)
- [ ] 모바일 폭(개발자 도구의 기기 모드)에서도 레이아웃이 괜찮다
- [ ] 탭 제목 `Icebreaker`와 🧊 파비콘이 그대로다

- [ ] 잘못된 저장 모드(`toString`, `__proto__`, 삭제된 모드)와 저장소 사용 불가 환경에서도 시작된다
- [ ] 맛·카테고리 변경 시 이전 질문이 사라지고 선택 상태가 스크린 리더에 전달된다
- [ ] 질문과 A/B 내용이 라이브 영역에 전달되고 키보드 포커스가 보인다
- [ ] 빠른 연속 뽑기, 질문 0개·1개·동일 문구만 있는 풀에서도 멈추지 않는다
- [ ] HTTPS/localhost에서 최초 캐시 후 오프라인으로 세 모드를 사용한다
- [ ] 기존 버전에서 업데이트 후 `./`, `./index.html`, 쿼리 URL에서 최신 질문이 보인다
- [ ] 캐시 정리 시 다른 앱 캐시를 삭제하지 않는다

## 5. 배포 (GitHub Pages)

- GitHub Pages가 **`main` 브랜치 루트(`/`)** 를 그대로 서비스합니다. 빌드 단계 없음.
- 라이브: https://chehok.github.io/icebreaker/
- 사용자 PC 작업 폴더: `C:\git\icebreaker` (Windows, PowerShell)

### PWA 캐시 유지보수

- 캐시 대상: `./`, `./index.html`, manifest, icons. 앱 진입은 네트워크 우선, 실패 시 동일한 index 캐시를 사용합니다.
- 캐시 파일을 수정하면 `sw.js` 캐시 이름도 반드시 증가시키세요(현재 `icebreaker-v5`).
- 업데이트 설치 시 HTTP 캐시를 새로 검증하며, 이전 Icebreaker 버전 캐시만 정리하고 글꼴 캐시는 유지합니다.
- `file://`에서는 질문 뽑기만 동작합니다. 서비스 워커는 HTTPS 또는 localhost에서 확인합니다.
- Pretendard는 jsDelivr CDN(`pretendard@v1.3.9` 다이내믹 서브셋)에서 불러오고 서비스 워커가 캐시 우선으로 저장합니다. 불러오지 못하면 시스템 한글 글꼴을 사용합니다.

### 배포 흐름

```powershell
cd C:\git\icebreaker
git pull
# index.html 수정 후 로컬에서 테스트
git add index.html
git commit -m "질문 추가: ..."
git push origin main
```

1. `main`에 푸시하면 GitHub Pages가 자동으로 다시 빌드합니다. (보통 1~2분 이내)
2. 라이브 확인:
   - 브라우저에서 https://chehok.github.io/icebreaker/ 접속 후 **강력 새로고침** (Ctrl+F5 / Ctrl+Shift+R)
   - 또는 `curl.exe -s https://chehok.github.io/icebreaker/ | Select-String "확인할 문구"`
3. **한글 확인 팁:** PowerShell 콘솔은 인코딩 문제로 한글이 깨져 보일 수 있습니다. 이는 표시 문제일 뿐 파일이 잘못된 것이 아닙니다. 한글 내용은 브라우저로 아래 raw 주소를 열어 확인하세요.
   - https://raw.githubusercontent.com/Chehok/icebreaker/main/index.html

## 6. Git 계정 규칙 (중요)

- 이 저장소는 **개인 GitHub 계정 `Chehok`** 으로만 작업합니다.
- 저장소 로컬 설정으로 지정되어 있습니다. (반드시 `--local`, **절대 `--global` 아님**)
  ```powershell
  git config --local user.name "Chehok"
  git config --local user.email "3070311@gmail.com"
  ```
- 확인: `git config --local --list` 및 커밋 후 `git log -1 --format="%an <%ae>"`
- **회사 계정(`Chehok-developer`)과 전역(global)/회사 git 설정은 절대 건드리지 마세요.** 읽기 이상의 변경 금지.

## 7. 하지 말아야 할 것 (Don'ts)

- ❌ **비밀정보 금지**: API 키, 토큰, 비밀번호 등은 이 저장소에 절대 넣지 마세요. 현재 비밀정보는 전혀 없으며, 필요하지도 않습니다.
- ❌ **단일 파일·무빌드 구조 유지**: 프레임워크, 번들러, npm 패키지, 외부 CDN 등을 추가하지 마세요. `index.html` 하나로 열면 바로 동작해야 합니다.
- ❌ **저장소 비공개 전환 금지**: 무료 플랜의 GitHub Pages는 공개 저장소가 필요합니다. 비공개로 바꾸면 사이트가 내려갑니다.
- ❌ **회사 git 설정/계정 변경 금지**: `git config --global` 수정, `Chehok-developer` 계정 사용 금지.
- ❌ **검토 요청 시 바로 푸시 금지**: 문서 변경 등에 대해 검토를 요청받았다면 `main`에 바로 푸시하지 말고 브랜치 + PR로 올려 확인을 받으세요.
- ❌ 파일 인코딩을 UTF-8 이외로 바꾸지 마세요. (한글 깨짐)
