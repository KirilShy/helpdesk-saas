const styles = {
  low:    { text: 'text-gray-500',   dot: 'bg-gray-400' },
  medium: { text: 'text-amber-600',  dot: 'bg-amber-500' },
  high:   { text: 'text-orange-600', dot: 'bg-orange-500' },
  urgent: { text: 'text-red-600',    dot: 'bg-red-500' },
};

export default function PriorityBadge({ priority }) {
  const s = styles[priority] ?? styles.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {priority}
    </span>
  );
}
