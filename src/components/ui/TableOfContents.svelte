<script lang="ts">
  import { onMount } from 'svelte';

  export let items: { id: string; label: string; sub?: { id: string; label: string; icon?: string }[] }[] = [];

  const HEADER_H = 64;   // fixed header height (h-16)
  const MARGIN   = 16;   // extra breathing room below header

  let activeId = '';

  // すべての id をフラットに展開（上から順）
  const allIds: string[] = [];
  for (const item of items) {
    allIds.push(item.id);
    if (item.sub) for (const s of item.sub) allIds.push(s.id);
  }

  // クリック: ヘッダー分を引いたオフセットでスムーズスクロール
  function handleClick(e: MouseEvent, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H - MARGIN;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    activeId = id;
  }

  // スクロール: 「ヘッダー + MARGIN より上に top が来たセクションのうち最後のもの」がアクティブ
  function updateActive() {
    const threshold = HEADER_H + MARGIN + 8;
    let found = '';
    for (const id of allIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= threshold) found = id;
    }
    activeId = found || allIds[0] || '';
  }

  onMount(() => {
    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    return () => window.removeEventListener('scroll', updateActive);
  });
</script>

<!--
  sticky top は CSS で固定。
  top 値 = ヘッダー高さ + 少し余白
  max-height で画面に収まるようにし、溢れたらスクロール可能に。
-->
<nav
  class="toc-nav"
  style="position: sticky; top: {HEADER_H + MARGIN}px; max-height: calc(100vh - {HEADER_H + MARGIN + 16}px);"
>
  <div class="toc-title">目次</div>
  <ul class="toc-list">
    {#each items as item}
      <li>
        <a
          href="#{item.id}"
          class="toc-link"
          class:active={activeId === item.id}
          on:click={(e) => handleClick(e, item.id)}
        >{item.label}</a>
        {#if item.sub?.length}
          <ul class="toc-sublist">
            {#each item.sub as s}
              <li>
                <a
                  href="#{s.id}"
                  class="toc-sublink"
                  class:active={activeId === s.id}
                  on:click={(e) => handleClick(e, s.id)}
                >
                  {#if s.icon}
                    <img src={s.icon} alt="" class="toc-icon" aria-hidden="true" />
                  {/if}
                  {s.label}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
.toc-nav {
  font-size: 0.75rem;
  line-height: 1.4;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
.toc-nav::-webkit-scrollbar { width: 3px; }
.toc-nav::-webkit-scrollbar-track { background: transparent; }
.toc-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

.toc-title {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7a8ea8;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.toc-sublist {
  list-style: none;
  padding: 0;
  margin: 0.05rem 0 0.2rem 0.65rem;
  display: flex;
  flex-direction: column;
}
.toc-link {
  display: block;
  padding: 0.22rem 0.5rem;
  border-radius: 0.25rem;
  color: #7a8ea8;
  text-decoration: none;
  transition: color 0.12s, background 0.12s;
  border-left: 2px solid transparent;
}
.toc-link:hover {
  color: #c8d8f0;
  background: rgba(255,255,255,0.04);
}
.toc-link.active {
  color: #2dd4bf;
  border-left-color: #2dd4bf;
  background: rgba(45,212,191,0.07);
}
.toc-sublink {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.14rem 0.5rem;
  border-radius: 0.2rem;
  color: #4e6070;
  text-decoration: none;
  font-size: 0.7rem;
  transition: color 0.12s, background 0.12s;
  border-left: 2px solid transparent;
}
.toc-icon {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
  flex-shrink: 0;
  opacity: 0.6;
  filter: drop-shadow(0 0 2px rgba(212,175,55,0.4));
}
.toc-sublink:hover .toc-icon,
.toc-sublink.active .toc-icon {
  opacity: 1;
}
.toc-sublink:hover { color: #8aabcc; }
.toc-sublink.active {
  color: #2dd4bf;
  border-left-color: rgba(45,212,191,0.5);
  background: rgba(45,212,191,0.04);
}
</style>
