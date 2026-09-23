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

## 거래 내역 데이터 (2026-09-23)
- 데이터 모델: `src/data/transaction.ts` (날짜/금액/구분(수입·지출)/카테고리/메모)
- 소스 오브 트루스는 프로젝트 안의 엑셀 파일 `public/data/transactions.xlsx`.
  사용자가 이 파일을 직접 열어서 수정하고, 앱의 "거래 내역" 페이지에서
  **최신화** 버튼을 누르면 `fetch`로 그 파일을 다시 읽어와 로컬 상태를
  통째로 교체함 (`src/data/transactionSync.ts`,
  `src/data/transactionStore.ts`). 업로드 방식(파일 선택창)은 쓰지 않기로
  결정함 — 사용자가 "프로젝트 안에 파일 넣고 최신화 버튼" 방식을 요청함.
- 엑셀 읽기/쓰기는 `read-excel-file` / `write-excel-file` 사용 (SheetJS `xlsx`
  패키지는 npm에 미패치 취약점이 있어서 제외함).
- 실제 데이터는 브라우저 localStorage에도 캐시됨(새로고침 시 유지) — 진짜
  소스는 어디까지나 `public/data/transactions.xlsx` 파일.
- id는 매번 랜덤 생성하지 않고 행 내용(날짜/구분/금액/카테고리/메모) 기반
  해시로 만들어서, 같은 내용이면 최신화할 때마다 같은 id가 나오게 함
  (`src/data/stableId.ts`). 완전히 동일한 행이 여러 개면 등장 순서로 구분.
- 최신화는 **fail-closed**: 파일에 오류 있는 행이 하나라도 있으면 아무것도
  반영하지 않고 기존 데이터를 그대로 둠(부분 반영 안 함). 화면에서 직접
  삭제하는 기능은 없앰 — 파일이 진실이므로 삭제는 파일에서 해야 함.

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
  **구독이 거래를 자동으로 만들지 않음**. 실제 결제되면 사용자가
  `transactions.xlsx`에 직접 기록해야 함. 정기 구독 페이지는 "다음 결제일"과
  "이번 달 예상 고정비"만 보여주는 전망(projection) 용도.
- 알려진 한계(다음에 손볼 것): 배포된 정적 사이트에서는 `public/` 파일을
  재배포 없이 수정해도 반영 안 됨 — 지금은 로컬 개발 전제.

**`<channel source="plugin:discord:discord" ...>` 태그로 메시지가 오면
반드시 Discord `reply` 도구로 답한다 — 절대 터미널 트랜스크립트에만
남는 일반 텍스트 답으로 응답하지 않는다.** 사용자는 이 터미널을 안 보고
Discord만 본다.
