# 🧊 Icebreaker

모임에서 어색함을 깨기 위한 **대화 주제 랜덤 뽑기 + 밸런스 게임** 웹앱입니다.
`index.html` 파일 하나로 동작하며, 빌드 과정이나 외부 의존성이 없습니다.

👉 **바로 사용하기:** https://chehok.github.io/icebreaker/

## 주요 기능

- **💬 대화 주제 모드** — 23개 카테고리, 총 416개 질문 중 하나를 랜덤으로 뽑습니다.
- **⚖️ 밸런스 게임 모드** — 6개 카테고리, 총 108개의 A/B 양자택일 질문을 뽑습니다.
- **😋 순한맛 / 🌶️ 매운맛** 난이도 선택과 카테고리 필터를 지원합니다.
- 마지막으로 사용한 모드는 브라우저(`localStorage`)에 저장되어 다음 방문 때 그대로 열립니다.

## 로컬에서 실행하기

별도 설치가 필요 없습니다. 저장소를 받은 뒤 `index.html`을 브라우저로 열면 됩니다.

```powershell
git clone https://github.com/Chehok/icebreaker.git
cd icebreaker
start index.html
```

## 질문 추가하기 (요약)

질문 데이터는 모두 `index.html` 안의 `<script>`에 있습니다.

- 대화 주제: `mildQuestions`(순한맛) / `spicyQuestions`(매운맛) 배열에 `{ text: "...", category: "카테고리키" }` 추가
- 밸런스 게임: `balanceItems` 배열에 `{ a: "...", b: "...", category: "카테고리키", spice: "mild" 또는 "spicy" }` 추가

자세한 절차, 예시, 테스트 체크리스트는 [AGENTS.md](./AGENTS.md)를 참고하세요.

## 배포

GitHub Pages가 `main` 브랜치 루트를 그대로 서비스합니다.
`index.html` 수정 → `main`에 커밋 & 푸시 → 보통 1~2분 안에 자동 반영됩니다. (자세한 내용은 [AGENTS.md](./AGENTS.md))
