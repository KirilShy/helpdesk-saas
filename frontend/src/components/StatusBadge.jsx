const styles = {
  open:         'bg-blue-100 text-blue-700 ring-blue-200',
  'in-progress':'bg-amber-100 text-amber-700 ring-amber-200',
  resolved:     'bg-emerald-100 text-emerald-700 ring-emerald-200',
  closed:       'bg-gray-100 text-gray-500 ring-gray-200',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] ?? styles.open}`}>
      {status}
    </span>
  );
}
