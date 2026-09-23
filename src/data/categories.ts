import type { TransactionType } from './transaction'

// 카테고리 순서가 곧 차트 색상 순서 (dataviz 팔레트의 categorical 순서를 그대로 씀).
// '기타 수입'/'기타 지출'은 회전 팔레트에 넣지 않고 무채색(muted)으로 고정한다.
export const INCOME_CATEGORIES = ['급여', '용돈', '이자/배당'] as const
export const EXPENSE_CATEGORIES = [
  '식비',
  '교통',
  '주거/공과금',
  '통신',
  '문화/여가',
  '의료',
  '교육',
  '경조사',
] as const

export const OTHER_INCOME_CATEGORY = '기타 수입'
export const OTHER_EXPENSE_CATEGORY = '기타 지출'

// dataviz 스킬의 검증된 8색 categorical 팔레트 (light 기준값)
const CATEGORICAL_PALETTE = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const

const MUTED_COLOR = '#898781'

function getOrderedCategories(type: TransactionType): readonly string[] {
  return type === '수입' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function getCategoryColor(type: TransactionType, category: string): string {
  const ordered = getOrderedCategories(type)
  const index = ordered.indexOf(category)
  if (index === -1) return MUTED_COLOR
  return CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
}
