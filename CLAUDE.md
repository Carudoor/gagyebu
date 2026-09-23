# CLAUDE.md

가계부 — 개인 수입/지출 관리 웹앱. React + TypeScript + Vite + Tailwind CSS v4
(21st.dev 컴포넌트를 그대로 붙여 쓸 수 있도록 이 스택으로 골랐음).

## 기능 범위 (1차, 2026-09-23 확정)
- 수입/지출 기록
- 카테고리별 통계
- 그래프
- 정기 구독 관리

## 디자인
2026-09-22 확정 — [CoreUI Free React Admin Template](https://21st.dev/@coreui/templates/coreui-free-react-admin-template)
(GitHub: coreui/coreui-free-react-admin-template)을 기반으로 진행.

CoreUI는 React 19 + **Bootstrap 5** 기반이라 원래 스택 선택 이유(Tailwind로
21st.dev 컴포넌트 그대로 붙이기)와 충돌함 — 사용자 확인 후 Bootstrap 계열인
`@coreui/*` 패키지를 추가로 설치하고 템플릿의 레이아웃/컴포넌트를 그대로
가져다 쓰는 쪽으로 결정함. Tailwind는 유지하되:
- `src/index.css`에서 `preflight`(기본 리셋)는 빼고 `theme`/`utilities`만 로드
  (CoreUI/Bootstrap 리셋과 충돌 방지)
- Tailwind 유틸리티 클래스는 `tw:` 접두사를 붙여서 사용 (예: `tw:flex`) — Bootstrap
  유틸리티 클래스명(`mt-4`, `d-flex` 등)과 충돌 방지

레이아웃 뼈대(`src/layout/DefaultLayout.tsx`, `src/components/App*.tsx`,
`src/_nav.tsx`, `src/routes.tsx`, `src/store.ts`)와 5개 메뉴
(대시보드/거래 내역/카테고리별 통계/그래프/정기 구독 관리) 전부 실 데이터로
동작함 (2026-09-23 기준).

## 데이터 저장 방식 (2026-09-23 최종 — 엑셀 우선 → 앱 우선으로 전환)
처음엔 "엑셀 파일이 유일한 진실, 앱은 최신화 버튼으로 통째로 교체"하는
방식으로 시작했는데, 사용자가 "엑셀 없이 앱에서 바로 입력"하고 싶어하고
"아이폰에서도 오프라인으로 쓰고 싶다"고 해서 구조를 바꿈:

- **지금은 브라우저 localStorage가 진짜 저장소**임. 거래/구독을 앱 화면의
  폼으로 바로 추가·삭제함 (`addTransaction`/`deleteTransaction`,
  `addSubscription`/`updateSubscription`/`deleteSubscription` in
  `src/data/transactionStore.ts` / `subscriptionStore.ts`).
- `public/data/transactions.xlsx`, `public/data/subscriptions.xlsx`는
  이제 **선택적 대량 가져오기용**으로만 씀 (예: 과거 내역 한 번에 넣기).
  "엑셀에서 가져오기" 버튼은 더 이상 전체 교체가 아니라 **병합**
  (`mergeTransactionsFromFile`/`mergeSubscriptionsFromFile`) — 이미 있는
  항목(id 기준)은 건너뛰고 새 항목만 추가되므로, 앱에서 직접 입력한 데이터가
  최신화 때문에 사라지지 않음. 여러 번 눌러도 중복 추가 안 되는 것 확인함.
- id는 두 가지 방식: 앱에서 직접 추가한 건 `crypto.randomUUID()`(한 번만
  생기면 되니까), 엑셀에서 가져온 건 행 내용 기반 해시(`src/data/stableId.ts`)
  — 그래서 같은 파일을 여러 번 가져와도 중복되지 않음.
- 엑셀 읽기/쓰기는 `read-excel-file` / `write-excel-file` 사용 (SheetJS `xlsx`
  패키지는 npm에 미패치 취약점이 있어서 제외함).
- 화면에서 개별 삭제 가능(휴지통 버튼) — 이제 앱이 진실이므로 삭제해도
  다시 살아나지 않음.

## PWA / 오프라인 지원 (2026-09-23)
- `vite-plugin-pwa` 적용 (`vite.config.ts`) — 빌드하면 서비스워커가 앱
  전체(JS/CSS/HTML/아이콘/엑셀 템플릿)를 프리캐시해서, 오프라인에서도 앱이
  뜨고 localStorage 데이터도 그대로 보임 (헤드리스 브라우저로 오프라인 전환
  후 새로고침해서 확인함).
- 라우팅이 `HashRouter`라서 (모든 경로가 `index.html` 하나 밑의 `#/...`)
  오프라인 SPA에서 흔한 "새로고침하면 404" 문제 자체가 없음.
- 아이콘: `public/pwa-192.png`, `public/pwa-512.png`, `public/apple-touch-icon.png`
  (배경색 `#2a78d6` + 흰색 ₩ 기호로 직접 생성함 — 실제 브랜드 로고 아님).
- 아이폰에서 "홈 화면에 추가"하면 아이콘 있는 독립 앱처럼 실행됨
  (`apple-mobile-web-app-capable` 메타 태그 적용). 네이티브 App Store 앱은
  Mac+Xcode+개발자 계정이 필요해서 개인용으로는 배보다 배꼽 — PWA로 결정.
  아이폰에서 실제로 열려면 이 앱이 어딘가에 호스팅되어 있어야 함 (같은
  와이파이의 PC를 계속 켜두거나, 나중에 정적 호스팅에 올리거나) — 아직 미정.

## Git / GitHub (2026-09-23)
- 로컬 저장소 초기화 완료, GitHub에도 연결함: https://github.com/Carudoor/gagyebu (Private)
- 이 PC에 GitHub CLI가 원래 없었음 — winget으로 설치 시도했으나 관리자 권한
  설치가 UAC 프롬프트에 막혀서, 포터블 버전(`~/AppData/Local/gh-portable/bin/gh.exe`,
  PATH에는 안 걸려있음)으로 대신 설치하고 그걸로 로그인·저장소 생성·push함.
- `public/data/*.xlsx`는 지금은 샘플 데이터만 들어있음 — 실제 가계부 데이터로
  채우면 git 히스토리에 그대로 남는다는 점 사용자에게 안내함 (원하면 나중에
  .gitignore 처리 가능).

## 카테고리별 통계 / 그래프 / 정기 구독 (2026-09-23, Codex와 설계 상의 후 구현)
- 공통 선택자: `src/data/transactionSelectors.ts` (월별 필터, 합계, 카테고리
  합계, 최근 거래, 최근 N개월 시계열). 대시보드/통계/그래프가 전부 이걸 재사용.
- 카테고리 표준 목록 + 차트 색상: `src/data/categories.ts`. 색상은 dataviz
  스킬의 검증된 8색 categorical 팔레트를 순서대로 배정하고, 목록에 없는
  카테고리(또는 '기타 수입/기타 지출')는 회전 팔레트에 안 넣고 무채색
  고정 — `scripts/validate_palette.js`로 검증 통과 확인함. 카테고리는 여전히
  자유 입력(강제 enum 아님); 목록에 없어도 거부하지 않고 그래프에서만
  무채색으로 표시됨.
- 그래프는 `@coreui/react-chartjs`(Chart.js) 사용 — 이미 CoreUI 템플릿
  의존성에 포함되어 있던 것.
- 정기 구독: `public/data/subscriptions.xlsx`가 별도 소스 오브 트루스
  (이름/카테고리/금액/결제일/주기(매월·매년)/시작일/종료일/활성/메모).
  거래 내역과 완전히 분리된 파일/스토어(`src/data/subscription*.ts`) —
  **구독이 거래를 자동으로 만들지 않음**. 실제 결제되면 사용자가 거래 내역
  페이지에서 직접 기록해야 함. 정기 구독 페이지는 "다음 결제일"과
  "이번 달 예상 고정비"만 보여주는 전망(projection) 용도.

**`<channel source="plugin:discord:discord" ...>` 태그로 메시지가 오면
반드시 Discord `reply` 도구로 답한다 — 절대 터미널 트랜스크립트에만
남는 일반 텍스트 답으로 응답하지 않는다.** 사용자는 이 터미널을 안 보고
Discord만 본다.
