export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      <circle cx="40" cy="40" r="38" fill="#1E3A5F" stroke="#2563EB" strokeWidth="4"/>
      <circle cx="40" cy="40" r="28" fill="#1E40AF" opacity="0.8"/>
      <rect x="22" y="18" width="36" height="44" rx="4" fill="white" opacity="0.95"/>
      <rect x="28" y="28" width="16" height="3" rx="1.5" fill="#2563EB"/>
      <rect x="28" y="36" width="24" height="3" rx="1.5" fill="#2563EB"/>
      <rect x="28" y="44" width="14" height="3" rx="1.5" fill="#2563EB"/>
      <text x="40" y="56" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#059669" fontFamily="Arial">RS</text>
      <circle cx="55" cy="25" r="10" fill="#059669"/>
      <path d="M51 25L54 28L59 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
