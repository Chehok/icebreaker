# 🧊 Icebreaker

모임에서 어색함을 깨기 위한 **대화 주제 랜덤 뽑기 + 밸런스게임 + 이 중 누가?** 웹앱입니다.
별도 빌드 없이 정적 HTML, CSS, JavaScript로 동작합니다.

👉 **바로 사용하기:** https://chehok.github.io/icebreaker/

## 주요 기능

- **💬 대화 주제 모드** — 23개 카테고리, 총 525개 질문 중 하나를 랜덤으로 뽑습니다.
- **⚖️ 밸런스게임 모드** — 14개 카테고리, 총 546개의 A/B 양자택일 질문을 뽑습니다.
- **🎯 이 중 누가? 모드** — 10개 카테고리, 총 395개 질문(순한맛 164 + 매운맛 130 + 핵매운맛 101)으로 함께할 사람을 가리키는 게임입니다.
- **📱 PWA** — HTTPS에서 홈 화면에 설치할 수 있으며, 최초 온라인 로딩과 서비스 워커 설치가 끝난 뒤 오프라인으로 사용할 수 있습니다.
- 세 모드 모두 **😋 순한맛 / 🌶️ 매운맛 / 🔥 핵매운맛** 난이도 선택과 카테고리 필터를 지원합니다.
- 🔥 핵매운맛은 기본 숨김입니다. 상단 **🧊 Icebreaker** 제목을 매번 1.5초 이내 간격으로 5번 누르면 표시되고, 다시 5번 누르면 숨겨집니다. 핵매운맛 선택 중 숨기면 매운맛으로 바뀌며 질문이 초기화됩니다. 잠금 해제는 저장되지 않고, 새로고침 시 저장된 핵매운맛도 매운맛으로 시작합니다.
- 세 모드 합계 **1466개**: 대화 주제 525개(230/186/109), 밸런스게임 546개(232/190/124), 이 중 누가? 395개(164/130/101). 괄호는 순한맛/매운맛/핵매운맛입니다.
- 답하기 곤란한 질문은 건너뛰고, 이 중 누가?는 참여하고 싶은 사람끼리 진행하세요.
- 대화 주제는 첫 화면(`index.html`), 밸런스게임은 `balance.html`, 이 중 누가?는 `who.html`에서 엽니다. 각 페이지 주소를 직접 열거나 공유할 수 있습니다.
- 모드·맛·카테고리(전체 포함)별로 한 바퀴 동안 중복 없이 뽑으며, 진행도와 남은 순서는 브라우저에 저장됩니다.

## 로컬에서 실행하기

별도 설치가 필요 없습니다. 저장소를 받은 뒤 `index.html`을 브라우저로 열면 됩니다.

```powershell
git clone https://github.com/Chehok/icebreaker.git
cd icebreaker
start index.html
```

PWA 설치·오프라인은 GitHub Pages 또는 로컬 HTTP 서버에서 확인하세요. `file://`로 열면 질문 뽑기는 동작하지만 서비스 워커는 등록하지 않습니다. Pretendard 글꼴은 jsDelivr CDN에서 받아 서비스 워커의 글꼴 캐시(`icebreaker-fonts-v1`)에 저장하며, 받지 못하면 시스템 글꼴로 표시됩니다.

## 질문 추가하기 (요약)

질문 데이터는 모두 `app.js`에 있습니다.

- 대화 주제: `mildQuestions`(순한맛) / `mediumQuestions`(매운맛) / `hotQuestions`(핵매운맛) 배열에 `{ text: "...", category: "카테고리키" }` 추가
- 밸런스게임: `balanceItems` 배열에 `{ a: "...", b: "...", category: "카테고리키", spice: "mild" | "medium" | "hot" }` 추가

- 이 중 누가?: `whoItems` 배열에 `{ text: "...", category: "카테고리키", spice: "mild" | "medium" | "hot" }` 추가

자세한 절차, 예시, 테스트 체크리스트는 [AGENTS.md](./AGENTS.md)를 참고하세요.

## 배포

GitHub Pages는 `github-pages` 브랜치의 루트를 서비스합니다. 이 브랜치는 이전 주소 안내를 제공하며 `main`·`stage`와 독립적으로 유지합니다. Cloudflare는 `main`의 정적 파일을 사용합니다. 기본 설정에서 `/balance.html`과 `/who.html`은 `/balance`와 `/who`로 이동합니다.

Cloudflare Worker `icebreaker`의 **Settings → Builds**에서 `Chehok/icebreaker` 저장소의 `main` 브랜치를 연결합니다. 루트 경로에서 빌드 명령은 비워두고 배포 명령은 `npx wrangler deploy`를 사용합니다. 새 공개 파일을 추가할 때는 `.assetsignore`의 허용 목록에도 포함해 주세요.

앱이나 캐시 파일을 수정하면 `sw.js`의 캐시 이름도 올려 주세요(현재 `icebreaker-v21`). 설치된 앱은 저장된 페이지를 바로 표시하고, 최신 버전은 뒤에서 확인합니다. 오프라인에서는 마지막으로 저장한 페이지를 사용합니다.

파일 수정 → `main`에 커밋 & 푸시 → 보통 1~2분 안에 자동 반영됩니다. (자세한 내용은 [AGENTS.md](./AGENTS.md))

- 방문 통계: GoatCounter(쿠키 없음, 대시보드 https://icebreaker.goatcounter.com). 서비스 워커 캐시 icebreaker-v21, 통계 요청은 캐시하지 않음.
