<script>
  import { onDestroy } from 'svelte';
  import FateTimer from './FateTimer.svelte';

  /** @type {{ id: string; x: number; y: number; label: string; type: 'chest'|'copper'|'pot'|'carrot'|'aetheryte'|'fate'|'fate_pot'|'ce'|'ce_multi'|'record'; desc?: string }[]} */
  export let markers = [];
  export let mapWidth  = 800;
  export let mapHeight = 600;
  export let mapAlt    = 'クレセントアイル マップ';
  /** @type {{ name: string; x: number; y: number }[]} */
  export let areaLabels = [];
  export let mapSrc = '';
  export let mapMaxHeight = '';
  export let showTimer = false;
  export let showPanel = true;
  /** @type {{ id: string; color: string; label: string; icon?: string; points: string }[]} */
  export let zones = [];

  const ICONS = {
    chest:     { icon: '/crescent-isle/icons/chest.png',     color: '#60a5fa', label: '銀箱' },
    copper:    { icon: '/crescent-isle/icons/copper.png',    color: '#f87171', label: '銅箱' },
    pot:       { icon: '/crescent-isle/icons/pot.png',       color: '#2dd4bf', label: 'マジックポット' },
    carrot:    { icon: '/crescent-isle/icons/carrot.png',    color: '#f97316', label: 'にんじん' },
    aetheryte: { icon: '/crescent-isle/icons/aetheryte.png', color: '#a78bfa', label: 'エーテライト' },
    fate:      { icon: '/crescent-isle/icons/060722.png',    color: '#4ade80', label: '通常FATE' },
    fate_pot:  { icon: '/crescent-isle/icons/060958.png',    color: '#fbbf24', label: 'ポットFATE' },
    ce:        { icon: '/crescent-isle/icons/063909.png',    color: '#f43f5e', label: 'CE' },
    ce_multi:  { icon: '/crescent-isle/icons/063911.png',    color: '#f43f5e', label: 'CE（複数・内部用）' },
    record:    { icon: '/crescent-isle/icons/060442.png',    color: '#34d399', label: '探査記録', size: 48 },
  };

  // ce_multi はフィルター上 ce と同一扱い
  $: presentTypes = new Set(markers.map(m => m.type === 'ce_multi' ? 'ce' : m.type));
  let activeTypes = new Set(Object.keys(ICONS));
  function toggleType(type) {
    if (activeTypes.has(type)) {
      activeTypes.delete(type);
      if (type === 'ce') activeTypes.delete('ce_multi');
    } else {
      activeTypes.add(type);
      if (type === 'ce') activeTypes.add('ce_multi');
    }
    activeTypes = activeTypes;
  }

  let activeZones = new Set(zones.map(z => z.id));
  $: { activeZones = new Set(zones.map(z => z.id)); }
  function toggleZone(id) {
    if (activeZones.has(id)) activeZones.delete(id);
    else activeZones.add(id);
    activeZones = activeZones;
  }
  function toggleAllZones() {
    if (activeZones.size > 0) activeZones = new Set();
    else activeZones = new Set(zones.map(z => z.id));
  }

  function zoneCentroid(points) {
    const pts = points.trim().split(/\s+/).map(p => p.split(',').map(Number));
    return {
      cx: pts.reduce((s, p) => s + p[0], 0) / pts.length,
      cy: pts.reduce((s, p) => s + p[1], 0) / pts.length,
    };
  }

  // ラベルが SVG 端に掛からないようクランプ、右下の全画面ボタンも回避
  const LBL_HW  = 70; // テキスト推定半幅（9文字×13px ÷ 2 + 余白）
  const LBL_TOP = 30; // アイコン上端オフセット
  const LBL_BOT = 22; // テキスト下端オフセット
  const LBL_PAD = 8;  // SVG 端からの余白
  const FS_BTN  = 715; // 全画面ボタン回避境界 (x > FS_BTN && y > FS_BTN → シフト)

  function getLabelPos(zone) {
    const raw = zone.labelPos
      ? { x: zone.labelPos.x, y: zone.labelPos.y }
      : (() => { const c = zoneCentroid(zone.points); return { x: c.cx, y: c.cy }; })();
    let x = Math.max(LBL_HW + LBL_PAD, Math.min(mapWidth  - LBL_HW - LBL_PAD, raw.x));
    let y = Math.max(LBL_TOP + LBL_PAD, Math.min(mapHeight - LBL_BOT - LBL_PAD, raw.y));
    // 全画面ボタン（右下隅）と被らないよう左にずらす
    if (x > FS_BTN && y > FS_BTN) x = FS_BTN;
    return { x, y };
  }

  let hoverId = null;
  function show(id) { hoverId = id; }
  function hide()   { hoverId = null; }

  $: visibleMarkers = markers.filter(m => activeTypes.has(m.type));

  $: canvasStyle = mapMaxHeight
    ? `max-height: ${mapMaxHeight}; width: min(100%, ${mapMaxHeight}); aspect-ratio: ${mapWidth}/${mapHeight};`
    : `width: 100%; aspect-ratio: ${mapWidth}/${mapHeight};`;

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  let isFullscreen = false;

  function openFullscreen() {
    isFullscreen = true;
    zoom = 1; panX = 0; panY = 0;
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  }
  function closeFullscreen() {
    isFullscreen = false;
    zoom = 1; panX = 0; panY = 0;
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }
  function handleKeydown(e) { if (e.key === 'Escape') closeFullscreen(); }

  onDestroy(() => {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  });

  // ── Pan / Zoom (fullscreen only) ────────────────────────────────────────────
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 6;

  function handleWheel(e) {
    if (!isFullscreen) return;
    e.preventDefault();
    if (e.ctrlKey) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.85 : 1 / 0.85;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
      panX = mx - (mx - panX) * (newZoom / zoom);
      panY = my - (my - panY) * (newZoom / zoom);
      zoom = newZoom;
    } else if (e.shiftKey) {
      panX -= e.deltaY;
    } else {
      panY -= e.deltaY;
    }
  }

  $: transformStyle = `transform: translate(${panX}px, ${panY}px) scale(${zoom}); transform-origin: 0 0;`;

  // ── Tooltip position ────────────────────────────────────────────────────────
  // キャンバスの実サイズを bind で取得し、SVG の letterbox オフセットと
  // zoom/pan を考慮した正確なピクセル位置を計算する。
  // ツールチップがキャンバス外にはみ出さないようにクランプ処理も行う。
  let canvasW = 0;
  let canvasH = 0;

  const TIP_MAX_W = 264; // max-width(260) + border(2*2)
  const TIP_EST_H = 78;  // 高さの概算
  const TIP_GAP   = 6;   // マーカーとの距離
  const TIP_PAD   = 6;   // 端からの余白

  function tooltipStyle(m) {
    if (canvasW === 0 || canvasH === 0) {
      // bind 未取得時のフォールバック（通常ホバー前に解決済み）
      return `left:${(m.x / mapWidth * 100).toFixed(2)}%;top:${(m.y / mapHeight * 100).toFixed(2)}%;transform:translate(-50%,calc(-100% - 20px));`;
    }

    let px, py;
    if (isFullscreen) {
      // フルスクリーン: preserveAspectRatio="xMidYMid meet" letterbox + zoom/pan
      const scale = Math.min(canvasW / mapWidth, canvasH / mapHeight);
      const ox = (canvasW - mapWidth  * scale) / 2;
      const oy = (canvasH - mapHeight * scale) / 2;
      px = panX + (ox + m.x * scale) * zoom;
      py = panY + (oy + m.y * scale) * zoom;
    } else {
      // 通常モード: canvas の aspect-ratio = map のため letterbox なし
      px = m.x * canvasW / mapWidth;
      py = m.y * canvasH / mapHeight;
    }

    // デフォルト: マーカー上に中央揃え
    let tx = px - TIP_MAX_W / 2;
    let ty = py - TIP_EST_H - TIP_GAP;

    // 左右クランプ
    tx = Math.max(TIP_PAD, Math.min(canvasW - TIP_MAX_W - TIP_PAD, tx));
    // 上端に近い場合は下に表示
    if (ty < TIP_PAD) ty = py + TIP_GAP;

    return `left:${tx.toFixed(1)}px;top:${ty.toFixed(1)}px;`;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="map-viewer" class:fullscreen={isFullscreen}>
  <!-- Map canvas -->
  <div
    class="map-canvas"
    style={isFullscreen ? '' : canvasStyle}
    on:wheel={handleWheel}
    bind:clientWidth={canvasW}
    bind:clientHeight={canvasH}
  >
    <!-- SVG + markers inside transform wrapper -->
    <div class="map-transform" style={isFullscreen ? transformStyle : ''}>
      <svg
        viewBox="0 0 {mapWidth} {mapHeight}"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={mapAlt}
        role="img"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(45,212,191,0.08)" stroke-width="1"/>
          </pattern>
          <filter id="glow-idle" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.6"/>
          </filter>
          {#each Object.entries(ICONS) as [type, info]}
            <filter id="glow-{type}" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="{info.color}" flood-opacity="1"/>
            </filter>
          {/each}
        </defs>
        <rect width={mapWidth} height={mapHeight} fill="#0d1e35"/>
        {#if mapSrc}
          <image href={mapSrc} x="0" y="0" width={mapWidth} height={mapHeight} preserveAspectRatio="xMidYMid meet"/>
        {:else}
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)"/>
        {/if}

        {#each areaLabels as area}
          <text
            x={area.x} y={area.y}
            text-anchor="middle" dominant-baseline="middle"
            font-size="18" fill="rgba(200,216,240,0.25)"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="600" letter-spacing="1" pointer-events="none"
          >{area.name}</text>
        {/each}

        {#each zones.filter(z => activeZones.has(z.id)) as zone}
          {@const lp = getLabelPos(zone)}
          {@const lx = lp.x}
          {@const ly = lp.y}
          <polygon
            points={zone.points}
            fill={zone.color}
            fill-opacity="0.30"
            stroke={zone.color}
            stroke-width="2"
            stroke-opacity="0.75"
            pointer-events="none"
          />
          {#if zone.icon}
            <image
              href={zone.icon}
              x={lx - 16} y={ly - 28}
              width="32" height="32"
              pointer-events="none"
              opacity="0.9"
            />
          {/if}
          <text
            x={lx} y={ly + 10}
            text-anchor="middle" dominant-baseline="middle"
            font-size="13" fill="rgba(230,240,255,0.9)"
            font-family="ui-sans-serif, system-ui, sans-serif"
            font-weight="700"
            stroke="#0d1e35" stroke-width="3.5" paint-order="stroke"
            pointer-events="none"
          >{zone.label}</text>
        {/each}

        {#each visibleMarkers as m}
          {@const info = ICONS[m.type]}
          {#if info}
            {@const sz   = info.size ?? 24}
            {@const half = sz / 2}
            <g transform="translate({m.x} {m.y})">
              {#if info.size}
                <!-- ハイライトリング -->
                <circle
                  r={half + 5}
                  fill={info.color} fill-opacity="0.18"
                  stroke={info.color} stroke-width="1.5" stroke-opacity="0.7"
                  pointer-events="none"
                />
              {/if}
              <g
                class="marker"
                class:active={hoverId === m.id}
                on:mouseenter={() => show(m.id)}
                on:mouseleave={hide}
                role="img"
                aria-label={m.label}
              >
                <rect x={-half} y={-half} width={sz} height={sz} fill="transparent"/>
                <image
                  href={info.icon}
                  x={-half} y={-half} width={sz} height={sz}
                  filter={hoverId === m.id ? `url(#glow-${m.type})` : (info.size ? `url(#glow-${m.type})` : 'url(#glow-idle)')}
                />
              </g>
            </g>
          {/if}
        {/each}
      </svg>
    </div><!-- /.map-transform -->

    <!-- ツールチップは map-transform の外に配置:
         zoom/pan の影響を受けず、tooltipStyle() で正確な位置を計算する -->
    {#if hoverId}
      {@const m = markers.find(x => x.id === hoverId)}
      {#if m}
        {@const info = ICONS[m.type]}
        <div class="tooltip" style={tooltipStyle(m)}>
          {#if info}<img src={info.icon} alt="" class="tooltip-icon">{/if}
          <div>
            <div class="tooltip-label">{m.label}</div>
            {#if m.desc}<div class="tooltip-desc">{m.desc}</div>{/if}
          </div>
        </div>
      {/if}
    {/if}

    {#if !isFullscreen}
      <button class="maximize-btn" on:click={openFullscreen} title="最大化" aria-label="マップを最大化">
        <span class="material-icons">fullscreen</span>
      </button>
    {:else if !showPanel}
      <button class="maximize-btn close-overlay-btn" on:click={closeFullscreen} title="閉じる" aria-label="マップを閉じる">
        <span class="material-icons">close</span>
      </button>
    {/if}
  </div>

  <!-- Right panel -->
  {#if showPanel}
  <div class="filter-panel" class:with-timer={showTimer}>
    <div class="filter-section">
      <div class="panel-heading">
        表示
        {#if isFullscreen}
          <button class="close-btn" on:click={closeFullscreen} title="閉じる" aria-label="最大化を閉じる">
            <span class="material-icons">close</span>
          </button>
        {/if}
      </div>
      <div class="filter-checks">
        {#each Object.entries(ICONS).filter(([t]) => t !== 'ce_multi' && presentTypes.has(t)) as [type, info]}
          <label class="filter-item" style="--accent: {info.color}">
            <input type="checkbox" checked={activeTypes.has(type)} on:change={() => toggleType(type)}/>
            <img src={info.icon} alt={info.label} class="filter-icon" class:dim={!activeTypes.has(type)}/>
            <span class="filter-label" class:dim={!activeTypes.has(type)}>{info.label}</span>
          </label>
        {/each}
        {#if zones.length > 0}
          <label class="filter-item" style="--accent: #2dd4bf">
            <input type="checkbox" checked={activeZones.size > 0} on:change={toggleAllZones}/>
            {#if zones[0]?.icon}<img src={zones[0].icon} alt="ゾーン" class="filter-icon" class:dim={activeZones.size === 0}/>{/if}
            <span class="filter-label" class:dim={activeZones.size === 0}>デミアートマ表示</span>
          </label>
        {/if}
      </div>
    </div>

    {#if showTimer}
      <div class="timer-divider"></div>
      <div class="timer-wrap">
        <FateTimer />
      </div>
    {/if}

    {#if isFullscreen}
      <div class="hint-panel">
        <div class="hint-item"><kbd>Ctrl</kbd>+スクロール：拡大縮小</div>
        <div class="hint-item">スクロール：上下移動</div>
        <div class="hint-item"><kbd>Shift</kbd>+スクロール：左右移動</div>
        <div class="hint-item"><kbd>Esc</kbd>：閉じる</div>
      </div>
    {/if}
  </div>
  {/if}
</div>

<style>
  .map-viewer {
    background: #0a1425;
    border: 1px solid rgba(45,212,191,0.2);
    border-radius: 0.75rem;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
  }
  .map-viewer.fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    border-radius: 0;
    border: none;
  }

  .map-canvas {
    position: relative;
    display: block;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }
  .fullscreen .map-canvas {
    height: 100%;
    max-height: none;
    width: auto;
    aspect-ratio: unset;
  }

  .map-transform {
    width: 100%;
    height: 100%;
  }

  .marker {
    cursor: pointer;
    transition: transform 0.15s;
    transform-box: fill-box;
    transform-origin: center;
  }
  .marker:hover, .marker.active { transform: scale(1.3); }

  .tooltip {
    position: absolute;
    background: #111828;
    border: 1px solid rgba(45,212,191,0.4);
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.82rem;
    color: #c8d8f0;
    pointer-events: none;
    z-index: 20;
    min-width: 140px;
    max-width: 260px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    white-space: nowrap;
  }
  .tooltip-icon  { width: 1.5rem; height: 1.5rem; flex-shrink: 0; object-fit: contain; }
  .tooltip-label { font-weight: 600; color: #e2ecff; }
  .tooltip-desc  { font-size: 0.76rem; color: #6b8aad; margin-top: 0.15rem; white-space: normal; }

  .maximize-btn {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: rgba(10, 20, 37, 0.75);
    border: 1px solid rgba(45,212,191,0.3);
    border-radius: 0.375rem;
    color: #2dd4bf;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    backdrop-filter: blur(4px);
  }
  .maximize-btn:hover {
    background: rgba(45,212,191,0.15);
    border-color: rgba(45,212,191,0.6);
  }
  .maximize-btn .material-icons { font-size: 1.25rem; line-height: 1; }

  .close-btn {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: transparent;
    border: 1px solid rgba(45,212,191,0.2);
    border-radius: 0.25rem;
    color: #4a6580;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;
  }
  .close-btn:hover { background: rgba(45,212,191,0.1); color: #2dd4bf; }
  .close-btn .material-icons { font-size: 1rem; line-height: 1; }

  .filter-panel {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    border-left: 1px solid rgba(45,212,191,0.12);
    flex-shrink: 0;
    min-width: 160px;
  }
  .filter-section { padding: 0.75rem 1rem; flex-shrink: 0; }
  .panel-heading {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #4a6580;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.6rem;
  }
  .filter-checks { display: flex; flex-direction: column; gap: 0.55rem; }

  .hint-panel {
    margin-top: auto;
    padding: 0.75rem 1rem;
    border-top: 1px solid rgba(45,212,191,0.08);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .hint-item { font-size: 0.68rem; color: #3a5068; line-height: 1.4; }
  kbd {
    display: inline-block;
    padding: 0.05em 0.3em;
    font-size: 0.65rem;
    font-family: ui-monospace, monospace;
    color: #4a6580;
    background: rgba(45,212,191,0.06);
    border: 1px solid rgba(45,212,191,0.15);
    border-radius: 0.2rem;
  }

  @media (max-width: 600px) {
    .map-viewer { flex-direction: column; }
    .filter-panel {
      border-left: none;
      border-top: 1px solid rgba(45,212,191,0.12);
      min-width: 0;
    }
    .filter-checks { flex-direction: row; flex-wrap: wrap; gap: 0.5rem 1rem; }
    .timer-wrap { flex: none; }
    .map-viewer.fullscreen { flex-direction: row; }
    .map-viewer.fullscreen .filter-panel {
      border-left: 1px solid rgba(45,212,191,0.12);
      border-top: none;
      min-width: 160px;
    }
    .map-viewer.fullscreen .filter-checks { flex-direction: column; }
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;
    user-select: none;
  }
  .filter-item input[type="checkbox"] {
    appearance: auto;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    flex-shrink: 0;
    accent-color: var(--accent, #5eead4);
    margin: 0;
  }
  .filter-icon { width: 1.1rem; height: 1.1rem; object-fit: contain; flex-shrink: 0; transition: opacity 0.15s; }
  .filter-label { font-size: 0.78rem; color: #c8d8f0; white-space: nowrap; transition: color 0.15s; }
  .dim { opacity: 0.3; }

  .timer-divider { border-top: 1px solid rgba(45,212,191,0.12); margin: 0; flex-shrink: 0; }
  .timer-wrap { flex: 1; display: flex; flex-direction: column; padding: 0.75rem 1rem; min-height: 0; }
</style>
