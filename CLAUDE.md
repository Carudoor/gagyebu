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

## 데이터 저장 방식 (2026-09-23 최종 — 엑셀 우선 → 앱 우선 → 엑셀 완전 제거)
처음엔 "엑셀 파일이 유일한 진실, 앱은 최신화 버튼으로 통째로 교체"하는
방식으로 시작했다가, 사용자가 "엑셀 없이 앱에서 바로 입력"하고 싶어하고
"아이폰에서도 오프라인으로 쓰고 싶다"고 해서 앱(localStorage) 우선으로
바꿨고, 그 다음엔 **엑셀 가져오기 기능 자체를 완전히 삭제**함 (앱 내 입력만으로
충분하다고 판단). 지금은:

- **브라우저 localStorage가 유일한 저장소**임. 거래/구독을 앱 화면의 폼으로
  바로 추가·수정·삭제함 (`addTransaction`/`updateTransaction`/`deleteTransaction`,
  `addSubscription`/`updateSubscription`/`deleteSubscription` in
  `src/data/transactionStore.ts` / `subscriptionStore.ts`). id는
  `crypto.randomUUID()`.
- 엑셀 관련 파일/의존성은 전부 제거함: `transactionSync.ts`,
  `subscriptionSync.ts`, `transactionImport.ts`, `subscriptionImport.ts`,
  `transactionTemplate.ts`, `subscriptionTemplate.ts`, `stableId.ts`,
  `dateParsing.ts`, `importError.ts`, `public/data/*.xlsx`,
  `read-excel-file`/`write-excel-file` npm 패키지 — 한때 이런 게 있었다는
  기록만 남김. 되살릴 필요 생기면 git 히스토리에서 찾을 것.
- 화면에서 개별 삭제 가능(휴지통 버튼).

## PWA / 오프라인 지원 (2026-09-23)
- `vite-plugin-pwa` 적용 (`vite.config.ts`) — 빌드하면 서비스워커가 앱
  전체(JS/CSS/HTML/아이콘)를 프리캐시해서, 오프라인에서도 앱이 뜨고
  localStorage 데이터도 그대로 보임 (헤드리스 브라우저로 오프라인 전환 후
  새로고침해서 확인함, 로컬/실제 배포 사이트 둘 다).
- 라우팅이 `HashRouter`라서 (모든 경로가 `index.html` 하나 밑의 `#/...`)
  오프라인 SPA에서 흔한 "새로고침하면 404" 문제 자체가 없음.
- 아이콘: `public/pwa-192.png`, `public/pwa-512.png`, `public/apple-touch-icon.png`
  (배경색 `#2a78d6` + 흰색 ₩ 기호로 직접 생성함 — 실제 브랜드 로고 아님).
- 아이폰에서 "홈 화면에 추가"하면 아이콘 있는 독립 앱처럼 실행됨
  (`apple-mobile-web-app-capable` 메타 태그 적용). 네이티브 App Store 앱은
  Mac+Xcode+개발자 계정이 필요해서 개인용으로는 배보다 배꼽 — PWA로 결정.
  아이폰에서 실제로 열려면(설치/업데이트 시점에만) 이 앱이 어딘가에
  호스팅되어 있어야 함 — 아래 "Git / GitHub / 배포" 참고, GitHub Pages로
  해결함.
- **버그 수정**: `apple-mobile-web-app-status-bar-style`을 `black-translucent`로
  했더니 아이폰 홈 화면 추가(독립 실행) 모드에서 상단 상태바(시계/배터리)가
  앱 콘텐츠 위에 그대로 겹쳐서 헤더가 안 보이고 스크롤로도 안 드러나는 문제
  발생 (사용자가 실제 아이폰 스크린샷으로 확인해줌). `black-translucent`는
  상태바 아래까지 웹뷰가 그려지는 모드라 `env(safe-area-inset-top)` 패딩을
  직접 넣어줘야 하는데 안 넣어서 생긴 문제 — 대신 `default`로 바꿔서 iOS가
  상태바 영역을 자동으로 비워주게 함(더 간단하고 확실한 해결). 이 메타
  태그는 사파리/iOS 독립 실행 모드에서만 의미가 있어서 헤드리스
  Chrome으로는 재현도 검증도 불가능함 — **사용자가 아이폰에서 직접 재확인
  필요**.

## Git / GitHub / 배포 (2026-09-23)
- 로컬 저장소 초기화 완료, GitHub에도 연결함: https://github.com/Carudoor/gagyebu
- 이 PC에 GitHub CLI가 원래 없었음 — winget으로 설치 시도했으나 관리자 권한
  설치가 UAC 프롬프트에 막혀서, 포터블 버전(`~/AppData/Local/gh-portable/bin/gh.exe`,
  PATH에는 안 걸려있음)으로 대신 설치하고 그걸로 로그인·저장소 생성·push함.
- **GitHub Pages로 배포함** (아이폰 PWA 설치/업데이트 접속용).
  Private 저장소는 무료 플랜에서 Pages가 안 돼서(API로 직접 확인:
  "current plan does not support GitHub Pages for this repository") 사용자
  확인 후 **저장소를 Public으로 전환**함 — 코드는 공개되지만 실제 가계부
  데이터는 브라우저 localStorage에만 있어서 데이터 유출은 아님. 커밋 전에
  이메일/시크릿 없는지 grep으로 확인함.
  - 배포 주소: https://carudoor.github.io/gagyebu/
  - `vite.config.ts`에 `base: '/gagyebu/'` 설정 (서브패스 배포라서 필요).
    PWA manifest의 `start_url`/`scope`/아이콘 경로도 전부 이 base를 씀.
    이후 절대경로로 fetch하는 걸 추가하게 되면 `import.meta.env.BASE_URL`을
    붙여야 서브패스 배포에서 404 안 남 (엑셀 fetch 코드는 이제 삭제됨).
  - `.github/workflows/deploy.yml`: master에 push되면 자동 빌드 + Pages 배포
    (actions/upload-pages-artifact + deploy-pages). 앞으로 커밋 push하면
    자동으로 사이트에 반영됨.
  - 로컬 `npm run preview`와 실제 배포 사이트 둘 다 헤드리스 브라우저로
    서비스워커 등록·오프라인 새로고침 재검증함.

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
- 정기 구독: 거래 내역과 완전히 분리된 데이터/스토어
  (`src/data/subscription.ts`, `subscriptionStore.ts`, `subscriptionSelectors.ts`)
  — 필드는 이름/카테고리/금액/결제일/주기(매월·매년)/시작일/종료일/활성/메모.
  **구독이 거래를 자동으로 만들지 않음**. 실제 결제되면 사용자가 거래 내역
  페이지에서 직접 기록해야 함. 정기 구독 페이지는 "다음 결제일"과
  "이번 달 예상 고정비"만 보여주는 전망(projection) 용도.

## 오프라인 완전 지원 설계 (2026-09-23, Codex와 상의 — 아직 미구현, 계획만)
지금 PWA 오프라인은 "이미 있는 데이터 보고 CRUD" 수준까지만 검증됨
(로컬 preview + 실제 GitHub Pages 배포 사이트 둘 다). 완전한 오프라인
대응을 위해 다음을 계획함 (구현은 아직 안 함). 엑셀 가져오기 기능은 이후
완전히 삭제됐으므로, 이 계획 중 엑셀 관련 항목(양식에 고유 ID 컬럼 추가 등)은
더 이상 해당 없음 — id는 이제 항상 `crypto.randomUUID()`라 이 문제 자체가 없음:

- **원칙**: 앱 코드(서비스워커 프리캐시)와 사용자 데이터(localStorage)를
  분리해서 다루고, 업데이트 편의성보다 데이터 보호를 항상 우선한다.
- **알려진 위험**: 지금 서비스워커가 `registerType: 'autoUpdate'`라서 새
  배포가 뜨면 바로 활성화됨 — 나중에 저장 포맷(Transaction/Subscription
  shape)이 바뀌는 업데이트를 내면 안전장치가 없음.
- **다음에 할 것(순서대로)**:
  1. ~~거래+구독을 JSON으로 내보내기~~ — **2026-09-23 구현 완료** (아래 참고)
  2. 서비스워커를 "업데이트 있음—백업 후 적용" 방식으로 전환 + 저장 포맷
     버전 체크
  3. localStorage 유지, 저장 포맷에 버전/마이그레이션 규칙 추가
     (IndexedDB 전환은 저장 실패·대용량·첨부파일 필요해질 때로 미룸)
  4. ~~백업 파일 불러오기(복원)~~ — **2026-09-23 구현 완료** (아래 참고)

## 백업(내보내기/복원) (2026-09-23)
- `src/data/backup.ts` + `src/views/backup/Backup.tsx`, 사이드바에 "백업"
  메뉴 추가 (`/backup`).
- **내보내기**: 거래+구독 전체를 `{ schemaVersion, exportedAt, transactions,
  subscriptions }` JSON 파일 하나로 만듦 (`가계부_백업_YYYY-MM-DD.json`).
  **Web Share API**(`navigator.share`에 `files` 넘기기)를 우선 사용 — 지원되면
  OS 공유 시트가 떠서 디스코드/메시지/에어드랍 등으로 바로 보낼 수 있음
  (아이폰 사파리가 요청한 이유). 지원 안 하는 환경(주로 데스크톱 브라우저)은
  자동으로 파일 다운로드로 대체됨.
  - 헤드리스 브라우저로는 실제 OS 공유 시트가 뜨는 것까지는 검증 불가능함
    (환경 자체에 공유 대상이 없어서 `navigator.share`가 에러로 끝남 — 정상적인
    에러 핸들링 동작까지만 확인함). 다운로드 폴백 경로는 실제로 받은 JSON
    파일 내용까지 검증함. **아이폰에서 실제 공유 시트가 뜨는지는 사용자가
    직접 확인 필요.**
- **복원**: 백업 파일(.json) 선택 → 형식 검증(타입가드로 항목별 필터링,
  깨진 항목은 개수만 알려주고 건너뜀) → 요약(건수/내보낸 시각) 보여준 뒤
  **병합**(id 기준으로 이미 있는 건 건너뛰고 새 것만 추가,
  `mergeTransactions`/`mergeSubscriptions`) 또는 **완전 교체**
  (`replaceAllTransactions`/`replaceAllSubscriptions`, 되돌릴 수 없어서
  확인 단계 한 번 더 거침) 중 선택.
  - 헤드리스 브라우저로 전체 흐름 검증함: 내보내기 → 로컬 데이터 변경 →
    같은 백업으로 병합(중복 안 생기는 것 확인) → 같은 백업으로 완전 교체
    (원래 백업 상태로 정확히 되돌아가는 것 확인) → 잘못된 형식 파일 넣었을 때
    에러 메시지 뜨는 것까지 확인함.
- 아직 **불러오기(복원) 기능은 없음** — 다음 순서로 예정.

**`<channel source="plugin:discord:discord" ...>` 태그로 메시지가 오면
반드시 Discord `reply` 도구로 답한다 — 절대 터미널 트랜스크립트에만
남는 일반 텍스트 답으로 응답하지 않는다.** 사용자는 이 터미널을 안 보고
Discord만 본다.
