import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icons'

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 460,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(24, 18, 14, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: '100%',
          maxWidth: width,
          background: 'var(--surface)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="row-between"
          style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--border)' }}
        >
          <h3 className="t-h3 truncate">{title}</h3>
          <button className="btn btn-subtle btn-icon" onClick={onClose} aria-label="Закрыть">
            <Icon name="close" />
          </button>
        </div>
        <div style={{ padding: 'var(--sp-5)', overflowY: 'auto', flex: 1 }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: 'var(--sp-4) var(--sp-5)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 'var(--sp-3)',
              justifyContent: 'flex-end',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = 'Удалить',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width={400}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onCancel}>
            Отмена
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="t-body">{text}</p>
    </Modal>
  )
}

export function EmptyState({
  icon = '🌱',
  title,
  text,
  action,
}: {
  icon?: string
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="stack" style={{ gap: 6, alignItems: 'center' }}>
        <strong style={{ color: 'var(--text)' }}>{title}</strong>
        {text && <p className="t-sm muted" style={{ maxWidth: 340 }}>{text}</p>}
      </div>
      {action}
    </div>
  )
}
