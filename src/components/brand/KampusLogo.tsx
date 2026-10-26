interface KampusLogoProps {
  variant?: "mark" | "wordmark";
  className?: string;
  markClassName?: string;
  size?: number;
}

export function KampusLogo({
  variant = "wordmark",
  className = "",
  markClassName = "",
  size = 32,
}: KampusLogoProps) {
  return (
    <span role="img" aria-label="Kampus" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className={`shrink-0 ${markClassName}`}
      >
        <path d="M8 40V22a16 16 0 0 1 32 0v18" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M18 15v19m0-10 12-9m-12 9 12 10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 40h32" stroke="#c45b37" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
      {variant === "wordmark" && (
        <span aria-hidden="true" className="text-[1.05rem] font-semibold leading-none tracking-[-0.065em] text-current">
          kampus<span className="text-[#c45b37]">.</span>
        </span>
      )}
    </span>
  );
}
