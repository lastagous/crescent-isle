<script>
  import { onMount } from 'svelte';
  let scrolled = false;
  let mobileOpen = false;

  // sub配列が1件 → 直リンク、2件以上 → ドロップダウン
  // separatorAfter: true → その項目の後にセパレーターを挿入
  const navItems = [
    { href: '/crescent-isle/leveling/', label: 'レベリングのすすめ', separatorAfter: true },
    {
      label: 'ストーリー一覧',
      sub: [{ href: '/crescent-isle/story/',  label: 'クレセントアイル', zone: 'south' }],
    },
    { href: '/crescent-isle/support-jobs/', label: 'サポートジョブ一覧' },
    {
      label: '装備一覧',
      sub: [{ href: '/crescent-isle/gear/',   label: 'クレセントアイル', zone: 'south' }],
    },
    { href: '/crescent-isle/tower/',        label: 'フォークタワー' },
    { href: '/crescent-isle/records/',      label: '探査記録一覧' },
    {
      label: 'FATE・CE 一覧',
      sub: [{ href: '/crescent-isle/fate/',   label: 'クレセントアイル', zone: 'south' }],
    },
    {
      label: '宝箱の配置',
      sub: [{ href: '/crescent-isle/chests/', label: 'クレセントアイル', zone: 'south' }],
    },
  ];

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 20; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<header
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
  class:scrolled
>
  <div class="container mx-auto px-4 flex items-center justify-between h-16">

    <!-- Logo -->
    <span class="font-display text-lg font-semibold text-moon-light">
      クレセントアイル攻略サイト
    </span>

    <!-- Desktop Nav -->
    <nav class="hidden lg:flex items-center gap-0.5">
      {#each navItems as item}
        {#if item.href}
          <!-- 直リンク -->
          <a
            href={item.href}
            class="nav-item"
          >
            <span>{item.label}</span>
          </a>
          {#if item.separatorAfter}
            <span class="nav-sep" aria-hidden="true"></span>
          {/if}

        {:else if item.sub.length === 1}
          <!-- 現在は単一エリア → 直リンク（構造はドロップ対応済み） -->
          <a
            href={item.sub[0].href}
            class="nav-item"
          >
            <span>{item.label}</span>
          </a>

        {:else}
          <!-- 複数エリア → ドロップダウン -->
          <div class="relative group">
            <button class="nav-item cursor-default">
              <span>{item.label}</span>
              <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div class="dropdown-panel hidden group-hover:block">
              {#each item.sub as s}
                <a href={s.href} class="dropdown-item zone-{s.zone}">
                  <span class="zone-dot"></span>
                  {s.label}
                </a>
              {/each}
            </div>
          </div>
        {/if}
      {/each}
    </nav>

    <!-- Mobile Toggle -->
    <button
      class="lg:hidden p-2 rounded-lg hover:bg-night-200 transition-colors text-moon"
      on:click={() => mobileOpen = !mobileOpen}
      aria-label="メニュー"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {#if mobileOpen}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        {:else}
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        {/if}
      </svg>
    </button>
  </div>

  <!-- Mobile Menu -->
  {#if mobileOpen}
    <div class="lg:hidden bg-night-100 border-t border-[var(--color-border)] px-4 py-3">
      <nav class="grid grid-cols-2 gap-1">
        {#each navItems as item}
          {#if item.href}
            <a
              href={item.href}
              class="mobile-item"
              on:click={() => mobileOpen = false}
            >
              <span>{item.label}</span>
            </a>
          {:else if item.sub.length === 1}
            <a
              href={item.sub[0].href}
              class="mobile-item"
              on:click={() => mobileOpen = false}
            >
              <span>{item.label}</span>
            </a>
          {:else}
            <!-- 複数エリアはグループ表示（モバイル全幅） -->
            <div class="col-span-2">
              <div class="mobile-group-label">
                <span>{item.label}</span>
              </div>
              <div class="grid grid-cols-2 gap-1 pl-2">
                {#each item.sub as s}
                  <a
                    href={s.href}
                    class="mobile-item zone-{s.zone}"
                    on:click={() => mobileOpen = false}
                  >
                    <span class="zone-dot-sm"></span>
                    {s.label}
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </nav>
    </div>
  {/if}
</header>

<style>
  header {
    background: transparent;
  }
  header.scrolled {
    background: rgba(10, 15, 30, 0.95);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(45, 212, 191, 0.1);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }

  /* ─── セパレーター ─── */
  .nav-sep {
    display: inline-block;
    width: 1px;
    height: 1rem;
    background: rgba(45, 212, 191, 0.25);
    margin: 0 0.375rem;
    flex-shrink: 0;
  }

  /* ─── デスクトップ nav ─── */
  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.625rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    color: #8aa8d0;
    text-decoration: none;
    background: transparent;
    border: none;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .nav-item:hover {
    color: #2dd4bf;
    background: rgba(45,212,191,0.08);
  }

  /* ─── ドロップダウン ─── */
  .dropdown-panel {
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 10rem;
    background: rgba(10, 15, 30, 0.97);
    border: 1px solid rgba(45,212,191,0.2);
    border-radius: 0.5rem;
    padding: 0.375rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    backdrop-filter: blur(12px);
    z-index: 60;
  }
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #8aa8d0;
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
    white-space: nowrap;
  }
  .dropdown-item:hover {
    color: #c8d8f0;
    background: rgba(255,255,255,0.06);
  }

  /* ─── ゾーンドット ─── */
  .zone-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .zone-south .zone-dot { background: #2dd4bf; }
  .zone-north .zone-dot { background: #fbbf24; }

  /* ─── モバイル ─── */
  .mobile-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    color: #8aa8d0;
    text-decoration: none;
    transition: color 0.15s, background 0.15s;
  }
  .mobile-item:hover {
    color: #2dd4bf;
    background: rgba(45,212,191,0.08);
  }
  .mobile-group-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem 0.2rem;
    font-size: 0.7rem;
    color: #6b8aad;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  .zone-dot-sm {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .zone-south .zone-dot-sm { background: #2dd4bf; }
  .zone-north .zone-dot-sm { background: #fbbf24; }
</style>
