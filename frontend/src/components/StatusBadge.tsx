import { MatchStatus } from '../types';

const map: Record<MatchStatus, { label: string; cls: string }> = {
  [MatchStatus.OPEN]:     { label: 'Aberta',     cls: 'badge-open' },
  [MatchStatus.CLOSED]:   { label: 'Fechada',    cls: 'badge-closed' },
  [MatchStatus.FINISHED]: { label: 'Finalizada', cls: 'badge-finished' },
};

export default function StatusBadge({ status }: { status: MatchStatus }) {
  const { label, cls } = map[status] ?? map[MatchStatus.OPEN];
  return <span className={cls}>{label}</span>;
}