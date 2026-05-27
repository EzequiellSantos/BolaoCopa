interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel  = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 font-semibold px-4 py-2 rounded-lg transition-colors text-sm ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="flex-1 btn-secondary text-sm">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}