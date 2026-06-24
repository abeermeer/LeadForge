export default function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', class: 'badge-yellow' },
    running: { label: 'Running', class: 'badge-blue' },
    completed: { label: 'Completed', class: 'badge-green' },
    failed: { label: 'Failed', class: 'badge-red' },
    generated: { label: 'Draft', class: 'badge-blue' },
    no_email: { label: 'Needs Email', class: 'badge-yellow' },
    sent: { label: 'Sent', class: 'badge-green' },
    draft: { label: 'Draft', class: 'badge-blue' },
  };

  const s = map[status?.toLowerCase()] || { label: status || 'Unknown', class: 'badge-yellow' };

  return <span className={`badge ${s.class}`}>{s.label}</span>;
}
