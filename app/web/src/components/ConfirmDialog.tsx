import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onCancel();
  }

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onClose={onCancel}
      onClick={handleClick}
    >
      <div className="confirm-dialog__body">
        <div className="confirm-dialog__title">{title}</div>
        {message && <div className="confirm-dialog__message">{message}</div>}
      </div>
      <div className="confirm-dialog__actions">
        <button
          type="button"
          className="confirm-dialog__btn confirm-dialog__btn--cancel"
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={
            "confirm-dialog__btn " +
            (destructive
              ? "confirm-dialog__btn--destructive"
              : "confirm-dialog__btn--primary")
          }
          onClick={onConfirm}
          autoFocus
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
