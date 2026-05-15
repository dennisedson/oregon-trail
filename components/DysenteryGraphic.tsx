import type { ReactNode } from "react";

type DysenteryGraphicProps = {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function DysenteryGraphic({
  title = "You have died of dysentery",
  message,
  action,
  className = ""
}: DysenteryGraphicProps) {
  return (
    <section
      className={`dysentery-card text-center uppercase ${className}`}
      aria-labelledby="dysentery-heading"
    >
      <svg
        className="dysentery-graphic mx-auto"
        viewBox="0 0 360 172"
        role="img"
        aria-labelledby="dysentery-art-title"
        shapeRendering="crispEdges"
      >
        <title id="dysentery-art-title">A broken green trail wagon</title>
        <g fill="currentColor">
          <rect x="28" y="86" width="16" height="12" />
          <rect x="44" y="76" width="78" height="34" />
          <rect x="65" y="66" width="34" height="14" />
          <rect x="104" y="82" width="18" height="10" />
          <rect x="28" y="104" width="10" height="10" />
          <rect x="54" y="108" width="10" height="10" />
          <rect x="86" y="108" width="10" height="10" />
          <rect x="122" y="94" width="50" height="6" />

          <rect x="176" y="72" width="132" height="38" />
          <rect x="172" y="62" width="144" height="14" />
          <rect x="168" y="48" width="36" height="18" />
          <rect x="210" y="42" width="46" height="24" />
          <rect x="262" y="38" width="54" height="28" />
          <rect x="184" y="28" width="20" height="20" />
          <rect x="204" y="32" width="14" height="30" />
          <rect x="154" y="32" width="14" height="38" />
          <rect x="164" y="50" width="10" height="18" />
          <rect x="220" y="76" width="8" height="34" className="dysentery-cutout" />
          <rect x="266" y="72" width="8" height="38" className="dysentery-cutout" />
        </g>

        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="square"
          strokeLinejoin="miter"
        >
          <circle cx="210" cy="122" r="20" />
          <circle cx="290" cy="122" r="20" />
          <path d="M210 102v40M190 122h40M196 108l28 28M224 108l-28 28" />
          <path d="M290 102v40M270 122h40M276 108l28 28M304 108l-28 28" />
        </g>

        <g fill="currentColor">
          <rect x="192" y="118" width="36" height="8" className="dysentery-cutout" />
          <rect x="286" y="102" width="8" height="40" className="dysentery-cutout" />
        </g>
      </svg>

      <h1
        id="dysentery-heading"
        className="dysentery-title mx-auto mt-4 text-4xl leading-none sm:text-5xl"
      >
        {title}
      </h1>
      {message ? (
        <p className="mx-auto mt-3 max-w-2xl text-2xl leading-tight text-trail-green">
          {message}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
