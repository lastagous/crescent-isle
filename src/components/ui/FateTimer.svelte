<script>
  import { onMount, onDestroy } from 'svelte';

  const INTERVAL_MS = 30 * 60 * 1000; // 30分
  const STORAGE_KEY = 'crescent-fate-timer-v1';

  let lastTime  = /** @type {number|null} */ (null);
  let lastSide  = /** @type {'north'|'south'|null} */ (null);
  let now       = Date.now();
  let intervalId;

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        lastTime = s.lastTime ?? null;
        lastSide = s.lastSide ?? null;
      }
    } catch {}
    intervalId = setInterval(() => { now = Date.now(); }, 1000);
  });

  onDestroy(() => clearInterval(intervalId));

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastTime, lastSide })); } catch {}
  }

  function record(side) {
    lastTime = Date.now();
    lastSide = side;
    persist();
  }

  function reset() {
    lastTime = null;
    lastSide = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  // --- 派生値 ---
  $: nextSide   = lastSide === 'north' ? 'south' : 'north';
  $: nextTime   = lastTime ? lastTime + INTERVAL_MS : null;
  $: remaining  = nextTime ? nextTime - now : null;
  $: overdue    = remaining !== null && remaining < 0;
  $: absMs      = remaining !== null ? Math.abs(remaining) : 0;
  $: remMin     = Math.floor(absMs / 60000);
  $: remSec     = Math.floor((absMs % 60000) / 1000);

  function fmt(ts) {
    return new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const LABEL = { north: '北側', south: '南側' };
</script>

<div class="fate-timer">
  <div class="title">おねだりポット FATE（30分交互）</div>

  <!-- 記録ボタン -->
  <div class="buttons">
    <button class="btn north" on:click={() => record('north')}>北側の FATE が発生</button>
    <button class="btn south" on:click={() => record('south')}>南側の FATE が発生</button>
  </div>

  <!-- 常に表示（記録前は --:-- プレースホルダー） -->
  <div class="info">
    <div class="info-row">
      <span class="label">最終記録</span>
      <span class="val">
        <span class="side side-{lastSide ?? 'north'}" style:visibility={lastTime !== null ? 'visible' : 'hidden'}>{lastSide ? LABEL[lastSide] : LABEL.north}</span>
        {#if lastTime !== null}{fmt(lastTime)}{:else}<span class="placeholder">--:--:--</span>{/if}
      </span>
    </div>
    <div class="info-row">
      <span class="label">次の予測</span>
      <span class="val">
        <span class="side side-{nextSide}" style:visibility={lastTime !== null ? 'visible' : 'hidden'}>{LABEL[nextSide]}</span>
        {#if lastTime !== null}{fmt(nextTime)}{:else}<span class="placeholder">--:--:--</span>{/if}
      </span>
    </div>
    <div class="countdown" class:overdue>
      {#if lastTime !== null}
        <button class="btn-reset" on:click={reset} aria-label="リセット">×</button>
      {/if}
      {#if lastTime === null}
        <span class="cd-prefix">あと</span>
        <span class="cd-time">--:--</span>
      {:else if overdue}
        <span class="cd-prefix">経過超過</span>
        <span class="cd-time">+{remMin}:{String(remSec).padStart(2,'0')}</span>
      {:else}
        <span class="cd-prefix">あと</span>
        <span class="cd-time">{remMin}:{String(remSec).padStart(2,'0')}</span>
      {/if}
    </div>
  </div>

  <div class="tip-block">
    <div class="tip-heading">他プレイヤーの残り時間で湧きを判断</div>
    <table class="tip-table">
      <thead>
        <tr><th>残り時間</th><th>湧きサイド</th></tr>
      </thead>
      <tbody>
        <tr><td>170分</td><td><span class="side side-north">北側</span></td></tr>
        <tr><td>140分</td><td><span class="side side-south">南側</span></td></tr>
        <tr><td>110分</td><td><span class="side side-north">北側</span></td></tr>
        <tr><td> 80分</td><td><span class="side side-south">南側</span></td></tr>
        <tr><td> 50分</td><td><span class="side side-north">北側</span></td></tr>
        <tr><td> 20分</td><td><span class="side side-south">南側</span></td></tr>
      </tbody>
    </table>
    <div class="tip-warn">⚠ 新島の場合は＋そのプレイヤーが現地にいるか確認</div>
  </div>
</div>

<style>
  .fate-timer {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 0.55rem;
    font-size: 0.82rem;
    min-width: 0;
    min-height: 0;
  }

  .title {
    color: #6b8aad;
    font-size: 0.72rem;
    line-height: 1.3;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .btn {
    padding: 0.3rem 0.5rem;
    border-radius: 0.4rem;
    border: 1px solid;
    background: transparent;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.15s;
    width: 100%;
    text-align: center;
  }
  .btn.north {
    border-color: #60a5fa66;
    color: #93c5fd;
  }
  .btn.north:hover { background: rgba(96,165,250,0.15); border-color: #60a5fa; }
  .btn.south {
    border-color: #fb923c66;
    color: #fdba74;
  }
  .btn.south:hover { background: rgba(249,115,22,0.15); border-color: #fb923c; }
  .info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .info-row {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    min-width: 0;
  }
  .label { color: #6b8aad; font-size: 0.7rem; white-space: nowrap; flex-shrink: 0; }
  .val   { color: #c8d8f0; display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; min-width: 0; flex-wrap: wrap; }

  .side {
    display: inline-block;
    padding: 0.05rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.68rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .side-north { background: rgba(96,165,250,0.15); color: #93c5fd; border: 1px solid #60a5fa44; }
  .side-south { background: rgba(249,115,22,0.15);  color: #fdba74;  border: 1px solid #fb923c44; }

  .countdown {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    padding: 0.5rem;
    background: rgba(45,212,191,0.08);
    border: 1px solid rgba(45,212,191,0.25);
    border-radius: 0.5rem;
    min-height: 0;
  }

  .btn-reset {
    position: absolute;
    top: 0.3rem;
    right: 0.35rem;
    background: transparent;
    border: none;
    color: #3d5166;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0.1rem 0.25rem;
    border-radius: 0.2rem;
    transition: color 0.15s;
  }
  .btn-reset:hover { color: #f87171; }
  .countdown.overdue {
    background: rgba(248,113,113,0.08);
    border-color: rgba(248,113,113,0.35);
  }
  .placeholder { color: #3d5166; font-variant-numeric: tabular-nums; }
  .cd-prefix { color: #6b8aad; font-size: 0.7rem; }
  .cd-time {
    font-size: 1.2rem;
    font-weight: 700;
    color: #5eead4;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .countdown.overdue .cd-time { color: #f87171; }

  .tip {
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
    font-size: 0.68rem;
    color: #6b8aad;
    line-height: 1.4;
    flex-shrink: 0;
  }
  .tip-icon { flex-shrink: 0; }
  .tip-link { color: #5eead4; text-decoration: none; }
  .tip-link:hover { text-decoration: underline; }
</style>
