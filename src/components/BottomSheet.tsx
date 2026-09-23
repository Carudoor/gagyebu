import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const BottomSheet = ({ open, onClose, title, children }: BottomSheetProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="sheet-panel relative w-full rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-3 h-1.5 w-10 rounded-full"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default BottomSheet
