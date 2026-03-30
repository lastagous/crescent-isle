<script>
  /** @type {{ title: string; badge?: string; badgeColor?: string; content: string; icon?: string }[]} */
  export let items = [];
  export let allowMultiple = false;

  let open = new Set();

  function toggle(i) {
    if (open.has(i)) {
      open.delete(i);
    } else {
      if (!allowMultiple) open.clear();
      open.add(i);
    }
    open = open; // trigger reactivity
  }
</script>

<div class="accordion">
  {#each items as item, i}
    <div class="accordion-item" class:is-open={open.has(i)}>
      <button
        class="accordion-header"
        on:click={() => toggle(i)}
        aria-expanded={open.has(i)}
      >
        <span class="header-left">
          {#if item.icon}<span class="item-icon">{item.icon}</span>{/if}
          <span class="item-title">{item.title}</span>
          {#if item.badge}
            <span
              class="item-badge"
              style="--badge-color: {item.badgeColor ?? '#2dd4bf'}"
            >{item.badge}</span>
          {/if}
        </span>
        <svg
          class="chevron"
          class:rotated={open.has(i)}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {#if open.has(i)}
        <div class="accordion-body">
          {@html item.content}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .accordion { display: flex; flex-direction: column; gap: 0.5rem; }

  .accordion-item {
    border: 1px solid rgba(30, 48, 80, 0.8);
    border-radius: 0.625rem;
    overflow: hidden;
    transition: border-color 0.2s;
  }
  .accordion-item.is-open { border-color: rgba(45, 212, 191, 0.35); }

  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.875rem 1.125rem;
    background: #111828;
    border: none;
    color: #c8d8f0;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s;
  }
  .accordion-header:hover { background: #1a2540; }
  .is-open .accordion-header { background: #1a2540; }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .item-icon  { font-size: 1.1rem; }
  .item-title { font-size: 0.95rem; font-weight: 500; }

  .item-badge {
    font-size: 0.72rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent);
    background: color-mix(in srgb, var(--badge-color) 15%, transparent);
    color: var(--badge-color);
    font-family: 'JetBrains Mono', monospace;
  }

  .chevron {
    width: 1rem;
    height: 1rem;
    color: #6b8aad;
    flex-shrink: 0;
    transition: transform 0.3s ease, color 0.2s;
  }
  .chevron.rotated { transform: rotate(180deg); color: #2dd4bf; }

  .accordion-body {
    padding: 1rem 1.125rem 1.25rem;
    background: rgba(10, 20, 37, 0.6);
    font-size: 0.9rem;
    line-height: 1.75;
    color: #94a3b8;
    animation: slide-down 0.25s ease;
  }

  :global(.accordion-body h4) {
    font-size: 0.85rem;
    font-weight: 600;
    color: #c8d8f0;
    margin: 0.75rem 0 0.35rem;
    font-family: 'Noto Sans JP', sans-serif;
  }
  :global(.accordion-body ul) {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  :global(.accordion-body ul li) {
    padding: 0.2rem 0;
    padding-left: 1.2rem;
    position: relative;
  }
  :global(.accordion-body ul li::before) {
    content: '›';
    position: absolute;
    left: 0;
    color: #2dd4bf;
  }
  :global(.accordion-body strong) { color: #e2ecff; }
  :global(.accordion-body .warn)  { color: #f43f5e; }
  :global(.accordion-body .tip)   { color: #2dd4bf; }

  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
