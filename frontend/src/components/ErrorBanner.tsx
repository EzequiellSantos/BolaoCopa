interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="flex items-center gap-3 bg-red-950/50 border border-red-800/50 text-red-300 rounded-xl px-4 py-3 text-sm">
      <span className="shrink-0">⚠️</span>
      <p className="flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs underline underline-offset-2 hover:text-red-200 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}