/** Decorative architectural lines, separate from interactive content. */
export function LandingAtmosphere() {
  return (
    <div className="landing-atmosphere" aria-hidden="true">
      <div className="landing-atmosphere__wash landing-atmosphere__wash--clay" />
      <div className="landing-atmosphere__wash landing-atmosphere__wash--blue" />
      <div className="landing-atmosphere__dots" />
      <svg className="landing-atmosphere__plan" viewBox="0 0 900 1100" fill="none">
        <g className="landing-atmosphere__structure">
          <rect x="90" y="80" width="640" height="800" rx="220" />
          <rect x="125" y="115" width="570" height="730" rx="185" />
          <rect x="160" y="150" width="500" height="660" rx="150" />
          <path d="M90 410H730M90 620H730M410 80V880M160 205H350V355H160M475 660H660V810H475" />
          <path d="M410 410V520M410 520A110 110 0 0 0 520 410M410 620H520M520 620A110 110 0 0 1 410 730" />
          <path d="M40 980H800M40 970V990M800 970V990M810 80V880M800 80H820M800 880H820" />
        </g>
        <path className="landing-atmosphere__route" d="M90 620H410V410H730V180" />
        <circle className="landing-atmosphere__point" cx="410" cy="410" r="7" />
        <circle className="landing-atmosphere__point landing-atmosphere__point--delayed" cx="730" cy="180" r="7" />
      </svg>
      <svg className="landing-atmosphere__contours" viewBox="0 0 900 900" fill="none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={80 + i * 35} y={80 + i * 35} width={740 - i * 70} height={740 - i * 70} rx={230 - i * 24} />
        ))}
        <path className="landing-atmosphere__route" d="M450 80C660 80 820 240 820 450S660 820 450 820" />
      </svg>
      <div className="landing-atmosphere__horizon" />
    </div>
  );
}
