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
}
