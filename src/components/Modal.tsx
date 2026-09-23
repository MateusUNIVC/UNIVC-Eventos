import type { ReactNode } from 'react'

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="text-xl font-extrabold text-[#04301D]">{title}</h2>
          <button className="secondary-btn !min-h-9" onClick={onClose}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  )
}
