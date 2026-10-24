/** Two circular repeat arrows and a central play triangle, matching the reference HUD. */
export function AutoplayIcon() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden>
      <path d="M82 40C75 15 39 8 20 29L12 24V48L36 37L29 33C43 18 69 23 82 40Z" />
      <path d="M82 40C75 15 39 8 20 29L12 24V48L36 37L29 33C43 18 69 23 82 40Z" transform="rotate(180 50 50)" />
      <path d="M42 34L65 50L42 66Z" />
    </svg>
  );
}
