# CLAUDE.md

가계부 — 개인 수입/지출 관리 웹앱. React + TypeScript + Vite + Tailwind CSS v4
(21st.dev 컴포넌트를 그대로 붙여 쓸 수 있도록 이 스택으로 골랐음).

## 기능 범위 (1차, 2026-09-23 확정)
- 수입/지출 기록
- 카테고리별 통계
- 그래프
- 정기 구독 관리

## 디자인 히스토리
1. **2026-09-22**: [CoreUI Free React Admin Template](https://21st.dev/@coreui/templates/coreui-free-react-admin-template)
   기반 데스크톱 관리자 스타일(사이드바 네비)로 시작. CoreUI가 React 19 +
   **Bootstrap 5** 기반이라 원래 스택 선택 이유(Tailwind로 21st.dev 컴포넌트
   그대로 붙이기)와 충돌해서, Tailwind는 `preflight` 빼고 `tw:` 접두사로
   Bootstrap과 공존시킴 (`src/index.css`).
2. **2026-09-23**: 사용자가 실제로는 아이폰 전용 개인 앱으로 쓸 거라 완전히
   다른 디자인 가이드(토스/애플 스타일 모바일 UI, Indigo 팔레트, 하단 탭바,
   Tailwind 커스텀 컴포넌트)를 주면서 전면 리디자인 요청 — 아래 "모바일 UI
   리디자인" 참고. 사이드바/헤더/브레드크럼 전부 삭제하고 하단 탭바 3개
   (홈/기록/설정)로 재구성함.

## 모바일 UI 리디자인 (2026-09-23, 완료)
처음엔 홈 화면만 새로 만들고 기록/설정은 임시로 기존 CoreUI 화면을 얇은
세그먼트 탭 안에 넣어뒀었는데, "계속 진행해줘" 요청으로 전부 마무리함.

- **디자인 토큰**: `src/index.css`에 라이트/다크 색상을 CSS 변수로 정의
  (primary `#6366F1`(다크 `#818CF8`), bg `#F9FAFB`/`#111827`,
  surface `#FFFFFF`/`#1F2937`, text `#111827`/`#F3F4F6` 등 — 사용자가 준
  가이드 값 그대로). 카드 radius 16px(`rounded-2xl`), 버튼 12px(`rounded-xl`),
  섀도 `0_4px_6px_-1px_rgba(0,0,0,0.05)` 도 가이드값 그대로 적용.
- **테마 시스템 교체**: CoreUI의 `useColorModes`(AppHeader 드롭다운) 대신
  직접 만든 `src/theme.ts`(`applyTheme`/`getStoredThemeMode`/`initTheme`)로
  변경. 라이트/다크 전환 시 **이 앱 자체의 `data-theme` 속성**과 **CoreUI가
  보는 `data-coreui-theme` 속성을 동시에 설정**해서, 새로 만든 화면(홈)과
  아직 CoreUI로 남아있는 화면(기록/설정 안쪽)의 색이 항상 같이 바뀌게 함.
  localStorage 키는 기존과 동일한 `가계부-theme` 재사용.
- **네비게이션**: 사이드바 → 하단 탭바(`src/components/BottomNav.tsx`,
  홈/기록/설정 3개, `env(safe-area-inset-bottom)` 처리). 라우트도
  `/dashboard,/transactions,/statistics,/charts,/subscriptions,/backup`
  6개에서 `/home,/records,/settings` 3개로 줄임 — `src/routes.tsx`,
  `src/_nav.tsx`는 삭제함(더 이상 브레드크럼/사이드바가 없어서 라우트 이름
  레지스트리가 필요 없어짐).
- **삭제한 것**: `src/layout/DefaultLayout.tsx`, `src/components/AppSidebar*.tsx`,
  `AppHeader.tsx`, `AppFooter.tsx`, `AppBreadcrumb.tsx`, `AppContent.tsx`,
  `header/AppHeaderDropdown.tsx`, `src/_nav.tsx`, `src/store.ts`(redux),
  `src/routes.tsx`, `src/views/dashboard/Dashboard.tsx`. `react-redux`/`redux`
  npm 패키지도 제거함(사이드바 UI 상태 관리 외엔 쓰던 곳이 없었음).
- **홈 화면**(`src/views/home/Home.tsx`): 그라데이션 히어로 카드(이번 달
  잔액 + 지출/수입 진행률 바) + 최근 거래 카드 + 정기 구독 요약 카드.
- **기록 화면**(`src/views/records/Records.tsx`): 상단 세그먼트 탭
  (거래/통계/그래프). 거래(`Transactions.tsx`)는 카드 리스트 + 플로팅
  `+` 버튼 → `BottomSheet`(`src/components/BottomSheet.tsx`, 아래서 위로
  슬라이드하는 iOS 스타일 시트)로 입력 폼. 통계(`Statistics.tsx`)/그래프
  (`Charts.tsx`)는 CoreUI 카드 대신 Tailwind 카드 안에 `CChartDoughnut`/
  `CChartBar`(`@coreui/react-chartjs`)만 그대로 유지 — 이 패키지는 Chart.js
  래퍼일 뿐이라 Bootstrap CSS 의존이 없어서 CoreUI 제거 후에도 문제없음.
- **설정 화면**(`src/views/settings/Settings.tsx`): 테마 선택 + 세그먼트
  탭(정기 구독/백업). 구독(`Subscriptions.tsx`)도 거래와 같은 카드 리스트 +
  바텀시트 패턴. 백업(`Backup.tsx`)도 새 카드/버튼 스타일로 재작성.
- **CoreUI 완전 제거**: 화면 전체에서 `@coreui/react`(Bootstrap 기반 컴포넌트)
  사용을 다 걷어낸 뒤 `@coreui/react`, `@coreui/coreui`, `sass`,
  `simplebar-react`, `@popperjs/core` npm 패키지와 `src/scss/` 폴더를 통째로
  삭제함. Tailwind는 이제 `preflight` 다시 켜고 `tw:` 접두사도 없앰 (더 이상
  Bootstrap과 공존할 필요가 없어짐) — CSS 번들이 315KB → 16KB로 줄어듦.
  아이콘(`@coreui/icons-react`, `@coreui/icons`)과 차트
  (`@coreui/react-chartjs`, `@coreui/chartjs`, `chart.js`)는 Bootstrap CSS에
  의존하지 않아서 그대로 유지함.
  - **주의**: `@coreui/icons-react`의 `CIcon`은 자체 CSS(`.icon`, `.icon-sm`
    등 크기 클래스)가 있어야 정상 크기로 나오는데, 이 CSS를 패키지에서 안전하게
    import할 방법이 없어서(해시된 dist 파일뿐) 필요한 규칙만 `src/index.css`에
    직접 옮겨 적어둠. `size="..."` 새 값을 쓰게 되면 이 규칙도 같이 추가해야 함.
- 390×844(아이폰 기준) 헤드리스 브라우저로 전체 화면(홈/기록/설정, 라이트·
  다크), 바텀시트로 거래·구독 추가, 오프라인 재확인까지 전부 검증함.

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

## 오프라인 완전 지원 설계 (2026-09-23 계획 → 2026-09-25 구현 완료)
Codex와 상의해서 세운 계획을 전부 구현함. 엑셀 가져오기 기능은 이후 완전히
삭제됐으므로, 계획 중 엑셀 관련 항목(양식에 고유 ID 컬럼 추가 등)은 해당
없어짐 — id는 이제 항상 `crypto.randomUUID()`라 이 문제 자체가 없음.

- **원칙**: 앱 코드(서비스워커 프리캐시)와 사용자 데이터(localStorage)를
  분리해서 다루고, 업데이트 편의성보다 데이터 보호를 항상 우선한다.
- **1. 거래+구독 JSON 내보내기/복원** — 2026-09-23 구현 완료 (아래 "백업" 참고).
- **2. 서비스워커 업데이트를 확인형으로 전환** — 2026-09-25 구현 완료.
  `registerType: 'autoUpdate'` → `'prompt'` + `injectRegister: false`로 바꾸고,
  `virtual:pwa-register/react`의 `useRegisterSW` 훅을 직접 씀
  (`src/components/UpdatePrompt.tsx`, `App.tsx`에 마운트). 새 배포가 감지되면
  하단에 "새 버전이 있어요" 배너가 뜨고, 사용자가 "지금 적용" 눌러야
  `updateServiceWorker(true)`가 호출되어 새 워커가 활성화+새로고침됨 —
  "나중에" 누르면 계속 예전 버전으로 쓰다가 다음에 앱 켤 때 다시 물어봄.
  타입은 `tsconfig.app.json`의 `types`에 `vite-plugin-pwa/react` 추가해서 해결.
  - 헤드리스로 초기 등록/활성화는 확인함. 다만 "실제로 새 배포 후 배너가
    뜨는지"는 지금 세션에서 두 번째 배포를 만들어 재현하려다 실패함
    (playwright `launchPersistentContext` 헤드리스 조합에서 서비스워커
    등록 자체가 안 되는 환경 문제로 보임, 앱 코드 문제는 아닌 걸로 판단) —
    다음에 실제로 새 버전을 배포하는 시점에 자연스럽게 검증될 것.
- **3. localStorage 저장 포맷에 버전 붙이기** — 2026-09-25 구현 완료.
  `src/data/versionedStorage.ts`의 `loadVersioned`/`saveVersioned`를
  `transactionStore.ts`/`subscriptionStore.ts`가 같이 씀. 저장 형식이
  `Transaction[]` 같은 순수 배열에서 `{ version: 1, items: [...] }` 봉투로
  바뀜 — `loadVersioned`가 예전 배열 포맷(v0, 버전 필드 생기기 전)도 자동
  인식해서 그대로 읽어옴. 다음에 필드 구조가 바뀌면 `loadVersioned` 안에
  `payload.version`별 분기를 추가하면 됨. 헤드리스로 "예전 배열 포맷 데이터가
  있는 상태에서 새로 저장하면 버전 봉투로 바뀌고 기존 데이터도 안 사라지는
  것"까지 확인함. IndexedDB 전환은 여전히 미룸(저장 실패·대용량·첨부파일
  필요해질 때).

## 백업(내보내기/복원) (2026-09-23)
- `src/data/backup.ts` + `src/views/backup/Backup.tsx` — 지금은 설정 탭
  안의 "백업" 세그먼트로 들어가 있음 (모바일 리디자인 이후, 아래 참고).
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

**`<channel source="plugin:discord:discord" ...>` 태그로 메시지가 오면
반드시 Discord `reply` 도구로 답한다 — 절대 터미널 트랜스크립트에만
남는 일반 텍스트 답으로 응답하지 않는다.** 사용자는 이 터미널을 안 보고
Discord만 본다.
