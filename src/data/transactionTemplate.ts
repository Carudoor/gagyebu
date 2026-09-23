import writeXlsxFile from 'write-excel-file/browser'
import type { SheetData } from 'write-excel-file/browser'

export const TEMPLATE_HEADERS = ['날짜', '금액', '구분', '카테고리', '메모'] as const

const TEMPLATE_EXAMPLE_ROWS: (string | number)[][] = [
  ['2026-09-01', 12000, '지출', '식비', '점심'],
  ['2026-09-01', 3000000, '수입', '급여', '9월 급여'],
]

export async function downloadTransactionTemplate() {
  const data: SheetData = [[...TEMPLATE_HEADERS], ...TEMPLATE_EXAMPLE_ROWS]

  await writeXlsxFile(data, {
    columns: [{ width: 12 }, { width: 12 }, { width: 8 }, { width: 14 }, { width: 24 }],
  }).toFile('가계부_거래내역_템플릿.xlsx')
}
