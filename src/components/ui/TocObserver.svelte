<script>
  import { onMount, onDestroy } from 'svelte';

  /** @type {IntersectionObserver|null} */
  let observer = null;
  /** @type {string} */
  let activeId = '';

  onMount(() => {
    const sections = /** @type {HTMLElement[]} */ (
      Array.from(document.querySelectorAll('.tower-main section[id], .tower-main div[id]'))
    );
    if (!sections.length) return;

    // Use the section whose top edge has passed the middle of the viewport
    observer = new IntersectionObserver(
      (entries) => {
        // Find topmost visible section
        let topmost = '';
        let topmostTop = Infinity;

        entries.forEach(e => {
          if (e.isIntersecting && e.boundingClientRect.top < topmostTop) {
            topmostTop = e.boundingClientRect.top;
            topmost = e.target.id;
          }
        });

        if (topmost) activeId = topmost;
        updateHighlight();
      },
      {
        rootMargin: '-10% 0px -70% 0px',
        threshold: 0,
      }
    );

    sections.forEach(s => observer?.observe(s));

    // Also update on scroll to handle "between sections" state
    const onScroll = () => {
      // Find the last section whose top is above 25% of viewport height
      const vh25 = window.innerHeight * 0.25;
      let best = '';
      for (const s of sections) {
        const rect = s.getBoundingClientRect();
        if (rect.top <= vh25) best = s.id;
      }
      if (best && best !== activeId) {
        activeId = best;
        updateHighlight();
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Set initial
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  });

  onDestroy(() => {
    observer?.disconnect();
  });

  function updateHighlight() {
    document.querySelectorAll('.toc-item').forEach(el => {
      const href = el.getAttribute('href');
      if (href === '#' + activeId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }
</script>
