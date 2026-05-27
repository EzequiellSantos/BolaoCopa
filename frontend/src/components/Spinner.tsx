interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-[3px]', lg: 'w-10 h-10 border-4' };

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`${sizes[size]} border-brand-500 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}