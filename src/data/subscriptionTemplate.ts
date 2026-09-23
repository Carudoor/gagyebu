import writeXlsxFile from 'write-excel-file/browser'
import type { SheetData } from 'write-excel-file/browser'

export const SUBSCRIPTION_TEMPLATE_HEADERS = [
  '이름',
  '카테고리',
  '금액',
  '결제일',
  '주기',
  '시작일',
  '종료일',
  '활성',
  '메모',
] as const

const TEMPLATE_EXAMPLE_ROWS: (string | number)[][] = [
  ['넷플릭스', '문화/여가', 17000, 15, '매월', '2026-01-15', '', '예', ''],
  ['정수기 렌탈', '주거/공과금', 25000, 5, '매월', '2025-06-05', '', '예', ''],
]

export async function downloadSubscriptionTemplate() {
  const data: SheetData = [[...SUBSCRIPTION_TEMPLATE_HEADERS], ...TEMPLATE_EXAMPLE_ROWS]

  await writeXlsxFile(data, {
    columns: [
      { width: 16 },
      { width: 14 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 12 },
      { width: 12 },
      { width: 6 },
      { width: 20 },
    ],
  }).toFile('가계부_정기구독_템플릿.xlsx')
}
