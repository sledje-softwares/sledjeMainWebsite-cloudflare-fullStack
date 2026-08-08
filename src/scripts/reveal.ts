/**
 * Fades/rises each [data-reveal] element into place the first time
 * it enters the viewport, then stops watching it. Pairs with the
 * `[data-reveal]` / `.is-visible` rules in `global.css`.
 */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );

  targets.forEach((el) => observer.observe(el));

  // Safety net: content must never be permanently invisible just because
  // a browser quirk kept the observer from firing (e.g. an element that's
  // already fully in view on load in some layouts). If a section hasn't
  // revealed itself within 2s, show it anyway — a late fade beats a
  // section that silently never appears.
  window.setTimeout(() => {
    targets.forEach((el) => el.classList.add('is-visible'));
    observer.disconnect();
  }, 2000);
}
