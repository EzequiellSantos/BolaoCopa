interface Props {
  emoji?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ emoji = '📭', title, description, action }: Props) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-5xl">{emoji}</span>
      <p className="font-bold text-white text-lg">{title}</p>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-2 text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}