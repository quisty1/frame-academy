import { useId } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
export function IconButton({
  children,
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      className={`icon-button ${active ? 'active' : ''}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const titleId = useId();
  return (
    <dialog
      aria-labelledby={titleId}
      open
      className={`modal ${wide ? 'wide' : ''}`}
      ref={(node) => {
        if (node && !node.dataset.ready) {
          node.dataset.ready = 'true';
          node.removeAttribute('open');
          node.showModal();
        }
      }}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <IconButton label="Закрыть" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </div>
      {children}
    </dialog>
  );
}
