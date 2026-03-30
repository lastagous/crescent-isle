<script>
  export let label = 'ネタバレを表示する';
  export let labelHide = 'ネタバレを隠す';
  let revealed = false;
</script>

<div class="spoiler-wrapper">
  <button
    class="spoiler-btn"
    class:revealed
    on:click={() => revealed = !revealed}
    aria-expanded={revealed}
  >
    <span class="icon">{revealed ? '🙈' : '👁️'}</span>
    <span>{revealed ? labelHide : label}</span>
    <svg
      class="chevron"
      class:open={revealed}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </button>

  {#if revealed}
    <div class="spoiler-content" role="region">
      <slot />
    </div>
  {:else}
    <div class="spoiler-blur" aria-hidden="true">
      <slot />
    </div>
  {/if}
</div>

<style>
  .spoiler-wrapper {
    margin: 1.5rem 0;
    border-radius: 0.75rem;
    overflow: hidden;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }

  .spoiler-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.875rem 1.25rem;
    background: rgba(251, 191, 36, 0.06);
    border: none;
    color: #fde68a;
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.2s;
    text-align: left;
  }

  .spoiler-btn:hover { background: rgba(251, 191, 36, 0.12); }
  .spoiler-btn.revealed { background: rgba(251, 191, 36, 0.08); }

  .icon { font-size: 1rem; }

  .chevron {
    width: 1rem;
    height: 1rem;
    margin-left: auto;
    transition: transform 0.3s ease;
  }
  .chevron.open { transform: rotate(180deg); }

  .spoiler-content {
    padding: 1.25rem;
    background: rgba(17, 24, 40, 0.5);
    animation: reveal 0.3s ease;
  }

  .spoiler-blur {
    padding: 1.25rem;
    background: rgba(17, 24, 40, 0.5);
    filter: blur(6px);
    user-select: none;
    pointer-events: none;
    max-height: 100px;
    overflow: hidden;
    opacity: 0.4;
  }

  @keyframes reveal {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
