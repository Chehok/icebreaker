# icebreaker-rooms — 함께하기 실시간 방 서버

아이스브레이커 "함께하기"의 방을 관리하는 Cloudflare Worker입니다. 정적 사이트(Cloudflare Pages)와 따로 배포합니다.

- 방 하나 = Durable Object 하나 (`Room`, SQLite 저장소). 이름은 4자리 방 코드.
- 웹소켓은 **Hibernation API**로 받아서, 조용할 때는 객체가 잠들어 실행 시간 요금이 거의 들지 않습니다. 연결 유지용 `ping`에는 객체를 깨우지 않고 `pong`으로 자동 응답합니다.
- 방 상태는 `storage("room")` 하나에 저장합니다(잠들었다 깨어나도 유지). 리더가 방을 끝내면 즉시, 아니면 마지막 활동 6시간 뒤 알람으로 삭제합니다.
- 질문 데이터는 서버에 없습니다. 리더 기기가 `data.js`에서 질문을 골라 보내면 서버는 그대로 방송합니다.
- 런타임 의존성 없음. 배포·로컬 실행에만 `wrangler`를 씁니다.

## API

| 요청 | 설명 |
|---|---|
| `POST /rooms` `{ name, mode, spice }` | 방 만들기 → `{ code, clientId, key }` (리더 접속 정보) |
| `GET /rooms/:code` | 방 정보 `{ exists, leaderName, memberCount }`, 없으면 404 |
| `GET /rooms/:code/ws` | 웹소켓. 첫 메시지 `{ t: "hello", clientId?, key?, name? }` |

웹소켓 메시지 (JSON)

- 서버 → 클라이언트: `welcome {clientId, key, role}`, `need_name`, `error {code: name_taken | room_full | not_joined}`, `state {...}`(받는 사람 역할에 맞게 거른 방 상태), `ended`
- 리더 → 서버: `round {mode, spice, label, question}`, `settings {mode?, spice?, showResults?, showVoters?}`, `end`
- 참여자·리더 → 서버(리더도 답할 수 있음): `note {text, anon, round}`, `vote {choice: "a"|"b", round}`, `pick {target, round}`, `pass {round}`, `leave`

`state`에서 리더는 쪽지 전체·밸런스 선택 명단·지목 순위(설정 시 지목한 사람)를 받고, 참여자는 자기 응답과, 응답한 뒤 `showResults`가 켜져 있으면 집계(비율·득표수)만 받습니다.

허용 출처: `https://icebreaker-de4.pages.dev`와 그 하위 도메인(stage 등), `localhost`. 다른 주소는 `wrangler.toml`의 `ALLOWED_ORIGINS`에 쉼표로 추가합니다.

## 배포 (처음 한 번)

1. Cloudflare 대시보드 → Workers & Pages → Create → Import a repository → `Chehok/icebreaker`
2. Project name `icebreaker-rooms`, Root directory `rooms`, Build command 비움, Deploy command `npx wrangler deploy`
3. 배포된 주소(현재 `https://icebreaker-rooms.dev-chehok.workers.dev`)를 저장소 루트 `config.js`의 `window.ICEBREAKER_ROOMS_URL`에 넣고 사이트를 배포하면 함께하기 버튼이 켜집니다.

무료 플랜으로 시작할 수 있습니다(하루 요청 10만 건, 실행 시간 13,000 GB-s). 한도를 넘으면 그날은 방 만들기·접속이 실패하므로, 이용이 늘면 Workers Paid(월 $5)로 바꿉니다.

## 로컬 실행

```bash
cd rooms
npx wrangler dev --port 8787
# 다른 터미널에서 저장소 루트를 정적 서버로 띄운 뒤
#   http://localhost:8765/index.html?rooms=http://localhost:8787
```

`?rooms=` 값은 `localhost` 주소만 받아들이며, 같은 탭(sessionStorage) 동안 유지됩니다.
