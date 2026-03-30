<script lang="ts">
  import { onMount } from 'svelte';

  export let base = '';

  // ジョブ定義
  export const ROLES = [
    {
      role: 'タンク', color: '#fbbf24',
      jobs: ['ナイト', '戦士', '暗黒騎士', 'ガンブレイカー'],
    },
    {
      role: 'ヒーラー', color: '#34d399',
      jobs: ['白魔道士', '学者', '占星術師', '賢者'],
    },
    {
      role: '近接DPS', color: '#f87171',
      jobs: ['モンク', '竜騎士', '忍者', '侍', 'リーパー', 'ヴァイパー'],
    },
    {
      role: '遠隔物理DPS', color: '#60a5fa',
      jobs: ['吟遊詩人', '機工士', '踊り子'],
    },
    {
      role: 'キャスター', color: '#c084fc',
      jobs: ['黒魔道士', '召喚士', '赤魔道士', 'ピクトマンサー', '青魔道士'],
    },
  ];

  const JOB_ICONS: Record<string, number> = {
    'ナイト': 62119, '戦士': 62121, '暗黒騎士': 62132, 'ガンブレイカー': 62137,
    '白魔道士': 62124, '学者': 62128, '占星術師': 62133, '賢者': 62140,
    'モンク': 62120, '竜騎士': 62122, '忍者': 62130, '侍': 62134, 'リーパー': 62139, 'ヴァイパー': 62141,
    '吟遊詩人': 62123, '機工士': 62131, '踊り子': 62138,
    '黒魔道士': 62125, '召喚士': 62127, '赤魔道士': 62135, 'ピクトマンサー': 62142, '青魔道士': 62136,
  };

  function jobIconUrl(icon: number): string {
    return `${base}/icons/jobs/${String(icon).padStart(6, '0')}.png`;
  }

  export let selectedJobs: Set<string> = new Set();

  function toggle(job: string) {
    if (selectedJobs.has(job)) {
      selectedJobs.delete(job);
    } else {
      selectedJobs.add(job);
    }
    selectedJobs = selectedJobs; // trigger reactivity
    dispatch();
  }

  function toggleRole(jobs: string[]) {
    const allOn = jobs.every(j => selectedJobs.has(j));
    if (allOn) jobs.forEach(j => selectedJobs.delete(j));
    else        jobs.forEach(j => selectedJobs.add(j));
    selectedJobs = selectedJobs;
    dispatch();
  }

  function clearAll() {
    selectedJobs = new Set();
    dispatch();
  }

  function dispatch() {
    window.dispatchEvent(new CustomEvent('jobfilter', {
      detail: { jobs: [...selectedJobs] }
    }));
  }
</script>

<aside class="filter-panel">
  <div class="filter-title">ジョブで絞り込み</div>

  {#if selectedJobs.size > 0}
    <button class="clear-btn" on:click={clearAll}>
      クリア
    </button>
  {/if}

  {#each ROLES as { role, color, jobs }}
    <div class="role-group">
      <button
        class="role-label"
        style="color:{color}"
        on:click={() => toggleRole(jobs)}
      >
        {role}
      </button>
      <div class="job-list">
        {#each jobs as job}
          <label class="job-check" class:checked={selectedJobs.has(job)}>
            <input type="checkbox" checked={selectedJobs.has(job)} on:change={() => toggle(job)} />
            {#if JOB_ICONS[job]}
              <img src={jobIconUrl(JOB_ICONS[job])} alt={job} title={job} class="job-icon" />
            {/if}
            <span class="job-name">{job}</span>
          </label>
        {/each}
      </div>
    </div>
  {/each}
</aside>

<style>
.filter-panel {
  font-size: 0.72rem;
  line-height: 1.5;
}
.filter-title {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7a8ea8;
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.clear-btn {
  font-size: 0.65rem;
  color: #2dd4bf;
  background: rgba(45,212,191,0.08);
  border: 1px solid rgba(45,212,191,0.25);
  border-radius: 0.25rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  display: block;
  width: 100%;
  text-align: left;
}
.role-group {
  margin-bottom: 0.6rem;
}
.role-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 0.25rem;
  display: block;
}
.role-label:hover { opacity: 0.75; }
.job-list {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.job-check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  cursor: pointer;
  color: #5a6e82;
  transition: color 0.1s, background 0.1s;
}
.job-check:hover { color: #9ab0c8; }
.job-check.checked {
  color: #c8d8f0;
  background: rgba(255,255,255,0.04);
}
.job-check input {
  accent-color: #2dd4bf;
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}
.job-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  flex-shrink: 0;
  image-rendering: pixelated;
  opacity: 0.7;
  transition: opacity 0.1s;
}
.job-check:hover .job-icon,
.job-check.checked .job-icon {
  opacity: 1;
}
.job-name {
  flex: 1;
}
</style>
