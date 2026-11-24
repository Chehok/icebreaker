/* 함께하기(실시간 방) 서버 주소. 비어 있으면 함께하기 버튼을 숨깁니다.
   rooms/ Worker를 배포한 뒤 그 주소를 넣으세요. 예: "https://icebreaker-rooms.example.workers.dev"
   로컬에서는 페이지 주소에 ?rooms=http://localhost:8787 을 붙이면 이 값 대신 씁니다. */
window.ICEBREAKER_ROOMS_URL = "https://icebreaker-rooms.dev-chehok.workers.dev";
// 미리보기 사이트(stage)는 stage 브랜치에서 배포되는 별도 서버를 씁니다.
if (location.hostname === "stage.icebreaker-de4.pages.dev") {
  window.ICEBREAKER_ROOMS_URL = "https://icebreaker-rooms-stage.dev-chehok.workers.dev";
}

(function () {
  try {
    const override = new URLSearchParams(location.search).get("rooms");
    if (override && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(override)) {
      sessionStorage.setItem("icebreaker:roomsUrl", override);
    }
    const saved = sessionStorage.getItem("icebreaker:roomsUrl");
    if (saved) window.ICEBREAKER_ROOMS_URL = saved;
  } catch { /* 저장소를 못 쓰는 환경에서는 기본값을 씁니다. */ }
})();
