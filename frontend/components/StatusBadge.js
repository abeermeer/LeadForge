import { Check, X, Edit3, Star, Phone, Mail } from 'lucide-react';

const statusMap = {
  pending: { label: 'Pending', cls: 'badge-slate' },
  running: { label: 'Running', cls: 'badge-sky' },
  completed: { label: 'Completed', cls: 'badge-emerald' },
  failed: { label: 'Failed', cls: 'badge-rose' },
  generated: { label: 'Draft', cls: 'badge-sky' },
  no_email: { label: 'No Email', cls: 'badge-slate' },
  sent: { label: 'Sent', cls: 'badge-emerald' },
  draft: { label: 'Draft', cls: 'badge-sky' },
};

export default function StatusBadge({ status }) {
  const s = statusMap[status?.toLowerCase()] || {
    label: status || 'Unknown',
    cls: 'badge-slate',
  };
  return <span className={s.cls}>{s.label}</span>;
}
