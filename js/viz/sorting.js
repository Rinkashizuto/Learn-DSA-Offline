/**
 * ============================================================================
 * DSA Playground - Sorting Visualizer & Racing Engine (js/viz/sorting.js)
 * Step-by-step sorting: Bubble, Selection, Insertion, Merge, Quick Sort
 * Plus Side-by-Side Algorithm Racing with comparison and swap counters
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  const DEFAULT_ARRAY = [45, 18, 72, 29, 64, 12, 53, 38];
  let currentArray = [...DEFAULT_ARRAY];
  let currentAlgo = 'bubble';
  let engine = null;

  function renderSortingStage(stageEl, frameData) {
    if (!stageEl) return;
    const { arr = [], compareIndices = [], activeIndices = [], sortedIndices = [], comps = 0, swaps = 0 } = frameData;

    let html = '<div style="display:flex; flex-direction:column; align-items:center; width:100%;">';
    
    // Counter badges
    html += `
      <div style="display: flex; gap: 1.5rem; margin-bottom: 1rem; font-family: var(--font-mono); font-size: 0.85rem;">
        <span style="color: var(--text-secondary);">Comparisons: <strong style="color: var(--accent-primary);">${comps}</strong></span>
        <span style="color: var(--text-secondary);">Swaps / Moves: <strong style="color: var(--warning-color);">${swaps}</strong></span>
      </div>`;

    // Bar chart
    html += '<div class="viz-bars-container" role="list" aria-label="Sorting Bars">';
    arr.forEach((val, idx) => {
      let stateClass = '';
      if (sortedIndices.includes(idx)) {
        stateClass = 'bar-sorted';
      } else if (activeIndices.includes(idx)) {
        stateClass = 'bar-active';
      } else if (compareIndices.includes(idx)) {
        stateClass = 'bar-compare';
      }

      // Max value 80 -> calculate percentage height
      const heightPercent = Math.max(15, Math.min(100, Math.round((val / 80) * 100)));

      html += `
        <div class="viz-bar-wrapper" role="listitem">
          <div class="viz-bar-val">${val}</div>
          <div class="viz-bar-column ${stateClass}" style="height: ${heightPercent}%;"></div>
          <div class="viz-cell-index">[${idx}]</div>
        </div>`;
    });
    html += '</div></div>';

    stageEl.innerHTML = html;
  }

  /**
   * 1. Bubble Sort Frames
   */
  function buildBubbleSortFrames(input) {
    const frames = [];
    const arr = [...input];
    let comps = 0;
    let swaps = 0;
    const sorted = [];

    frames.push({
      arr: [...arr],
      compareIndices: [],
      activeIndices: [],
      sortedIndices: [],
      comps, swaps,
      caption: `Starting Bubble Sort: Repeatedly compares adjacent items and bubbles largest to the end.`,
      codeLine: 8,
      render: (stage, f) => renderSortingStage(stage, f)
    });

    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comps++;
        frames.push({
          arr: [...arr],
          compareIndices: [j, j + 1],
          activeIndices: [],
          sortedIndices: [...sorted],
          comps, swaps,
          caption: `Comparing arr[${j}] (${arr[j]}) and arr[${j+1}] (${arr[j+1]}).`,
          codeLine: 10,
          render: (stage, f) => renderSortingStage(stage, f)
        });

        if (arr[j] > arr[j + 1]) {
          // Swap
          swaps++;
          const tmp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = tmp;

          frames.push({
            arr: [...arr],
            compareIndices: [],
            activeIndices: [j, j + 1],
            sortedIndices: [...sorted],
            comps, swaps,
            caption: `${arr[j+1]} > ${arr[j]}! Swapped arr[${j}] and arr[${j+1}].`,
            codeLine: 11,
            render: (stage, f) => renderSortingStage(stage, f)
          });
        }
      }
      sorted.push(n - i - 1);
    }
    sorted.push(0);

    frames.push({
      arr: [...arr],
      compareIndices: [],
      activeIndices: [],
      sortedIndices: Array.from({ length: n }, (_, i) => i),
      comps, swaps,
      caption: `Bubble Sort Complete! Sorted in ${comps} comparisons and ${swaps} swaps.`,
      codeLine: 14,
      render: (stage, f) => renderSortingStage(stage, f)
    });

    return frames;
  }

  /**
   * 2. Selection Sort Frames
   */
  function buildSelectionSortFrames(input) {
    const frames = [];
    const arr = [...input];
    let comps = 0;
    let swaps = 0;
    const sorted = [];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      frames.push({
        arr: [...arr],
        compareIndices: [],
        activeIndices: [i],
        sortedIndices: [...sorted],
        comps, swaps,
        caption: `Pass ${i + 1}: Finding minimum element from index [${i}] to [${n - 1}].`,
        codeLine: 18,
        render: (stage, f) => renderSortingStage(stage, f)
      });

      for (let j = i + 1; j < n; j++) {
        comps++;
        frames.push({
          arr: [...arr],
          compareIndices: [minIdx, j],
          activeIndices: [i],
          sortedIndices: [...sorted],
          comps, swaps,
          caption: `Comparing candidate min arr[${minIdx}] (${arr[minIdx]}) with arr[${j}] (${arr[j]}).`,
          codeLine: 20,
          render: (stage, f) => renderSortingStage(stage, f)
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        swaps++;
        const tmp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = tmp;

        frames.push({
          arr: [...arr],
          compareIndices: [],
          activeIndices: [i, minIdx],
          sortedIndices: [...sorted],
          comps, swaps,
          caption: `Swapped found minimum (${arr[i]}) into sorted position [${i}].`,
          codeLine: 23,
          render: (stage, f) => renderSortingStage(stage, f)
        });
      }
      sorted.push(i);
    }
    sorted.push(n - 1);

    frames.push({
      arr: [...arr],
      compareIndices: [],
      activeIndices: [],
      sortedIndices: Array.from({ length: n }, (_, i) => i),
      comps, swaps,
      caption: `Selection Sort Complete! Total comparisons: ${comps}, Swaps: ${swaps}.`,
      codeLine: 25,
      render: (stage, f) => renderSortingStage(stage, f)
    });

    return frames;
  }

  /**
   * 3. Insertion Sort Frames
   */
  function buildInsertionSortFrames(input) {
    const frames = [];
    const arr = [...input];
    let comps = 0;
    let swaps = 0;
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      frames.push({
        arr: [...arr],
        compareIndices: [],
        activeIndices: [i],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        comps, swaps,
        caption: `Taking element arr[${i}] (${key}) to insert into sorted sub-array on left.`,
        codeLine: 29,
        render: (stage, f) => renderSortingStage(stage, f)
      });

      while (j >= 0) {
        comps++;
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;

          frames.push({
            arr: [...arr],
            compareIndices: [j],
            activeIndices: [j + 1],
            sortedIndices: [],
            comps, swaps,
            caption: `${arr[j]} > ${key} → Shifted ${arr[j]} rightwards to slot [${j+1}].`,
            codeLine: 32,
            render: (stage, f) => renderSortingStage(stage, f)
          });
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;

      frames.push({
        arr: [...arr],
        compareIndices: [],
        activeIndices: [j + 1],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        comps, swaps,
        caption: `Inserted ${key} into slot [${j+1}].`,
        codeLine: 34,
        render: (stage, f) => renderSortingStage(stage, f)
      });
    }

    frames.push({
      arr: [...arr],
      compareIndices: [],
      activeIndices: [],
      sortedIndices: Array.from({ length: n }, (_, i) => i),
      comps, swaps,
      caption: `Insertion Sort Complete! Great for nearly-sorted data.`,
      codeLine: 36,
      render: (stage, f) => renderSortingStage(stage, f)
    });

    return frames;
  }

  /**
   * 4. Quick Sort Frames
   */
  function buildQuickSortFrames(input) {
    const frames = [];
    const arr = [...input];
    let comps = 0;
    let swaps = 0;

    function quickSort(low, high) {
      if (low < high) {
        const pivot = arr[high];
        frames.push({
          arr: [...arr],
          compareIndices: [],
          activeIndices: [high],
          sortedIndices: [],
          comps, swaps,
          caption: `Partitioning range [${low}..${high}] with Pivot = arr[${high}] (${pivot}).`,
          codeLine: 40,
          render: (stage, f) => renderSortingStage(stage, f)
        });

        let i = low - 1;
        for (let j = low; j < high; j++) {
          comps++;
          if (arr[j] < pivot) {
            i++;
            swaps++;
            const t = arr[i];
            arr[i] = arr[j];
            arr[j] = t;

            frames.push({
              arr: [...arr],
              compareIndices: [j, high],
              activeIndices: [i, j],
              sortedIndices: [],
              comps, swaps,
              caption: `arr[${j}] (${arr[i]}) < pivot (${pivot}) → Swapped into left side [${i}].`,
              codeLine: 44,
              render: (stage, f) => renderSortingStage(stage, f)
            });
          }
        }
        swaps++;
        const t = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = t;
        const pi = i + 1;

        frames.push({
          arr: [...arr],
          compareIndices: [],
          activeIndices: [pi],
          sortedIndices: [pi],
          comps, swaps,
          caption: `Placed pivot ${pivot} into its final sorted position at index [${pi}].`,
          codeLine: 48,
          render: (stage, f) => renderSortingStage(stage, f)
        });

        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
      }
    }

    quickSort(0, arr.length - 1);

    frames.push({
      arr: [...arr],
      compareIndices: [],
      activeIndices: [],
      sortedIndices: Array.from({ length: arr.length }, (_, k) => k),
      comps, swaps,
      caption: `Quick Sort Complete! Divide-and-conquer efficiency in O(n log n).`,
      codeLine: 50,
      render: (stage, f) => renderSortingStage(stage, f)
    });

    return frames;
  }

  /**
   * Side-by-Side Algorithm Racing Engine
   */
  function setupRaceMode() {
    const raceContainer = document.getElementById('viz-race-container');
    if (!raceContainer) return;

    const dataset = [38, 12, 75, 42, 60, 25, 90, 18, 55, 30, 80, 48];
    const algorithms = [
      { name: 'Bubble Sort', timeComplexity: 'O(n²)', key: 'bubble' },
      { name: 'Selection Sort', timeComplexity: 'O(n²)', key: 'selection' },
      { name: 'Insertion Sort', timeComplexity: 'O(n²)', key: 'insertion' },
      { name: 'Quick Sort', timeComplexity: 'O(n log n)', key: 'quick' }
    ];

    let gridHtml = '<div class="viz-race-grid">';
    algorithms.forEach(algo => {
      gridHtml += `
        <div class="viz-race-card" id="race-card-${algo.key}">
          <div class="viz-race-header">
            <span class="viz-race-title">${algo.name}</span>
            <span class="badge ${algo.timeComplexity.includes('log') ? 'badge-beginner' : 'badge-intermediate'}">${algo.timeComplexity}</span>
          </div>
          <div class="viz-race-counters">
            <span>Comps: <strong id="race-comps-${algo.key}">0</strong></span>
            <span>Swaps: <strong id="race-swaps-${algo.key}">0</strong></span>
            <span id="race-status-${algo.key}" style="margin-left: auto; font-weight: 700; color: var(--text-muted);">Ready</span>
          </div>
          <div class="viz-race-bars" id="race-bars-${algo.key}">
            ${dataset.map(v => `<div class="mini-bar" style="height: ${Math.round((v / 90) * 100)}%;"></div>`).join('')}
          </div>
        </div>`;
    });
    gridHtml += '</div>';

    raceContainer.innerHTML = gridHtml;

    const startRaceBtn = document.getElementById('btn-start-race');
    if (startRaceBtn) {
      startRaceBtn.addEventListener('click', () => {
        startRaceBtn.disabled = true;
        let finishedCount = 0;

        algorithms.forEach(algo => {
          let frames = [];
          if (algo.key === 'bubble') frames = buildBubbleSortFrames(dataset);
          if (algo.key === 'selection') frames = buildSelectionSortFrames(dataset);
          if (algo.key === 'insertion') frames = buildInsertionSortFrames(dataset);
          if (algo.key === 'quick') frames = buildQuickSortFrames(dataset);

          const statusEl = document.getElementById(`race-status-${algo.key}`);
          const compsEl = document.getElementById(`race-comps-${algo.key}`);
          const swapsEl = document.getElementById(`race-swaps-${algo.key}`);
          const barsEl = document.getElementById(`race-bars-${algo.key}`);

          if (statusEl) {
            statusEl.textContent = 'Racing...';
            statusEl.style.color = 'var(--accent-primary)';
          }

          let step = 0;
          const interval = setInterval(() => {
            if (step >= frames.length) {
              clearInterval(interval);
              finishedCount++;
              if (statusEl) {
                statusEl.textContent = `Finished (${finishedCount}${getOrdinal(finishedCount)})`;
                statusEl.style.color = 'var(--success-color)';
              }
              if (barsEl) {
                barsEl.querySelectorAll('.mini-bar').forEach(b => b.classList.add('sorted'));
              }
              if (finishedCount === algorithms.length) {
                startRaceBtn.disabled = false;
              }
              return;
            }

            const f = frames[step];
            if (compsEl) compsEl.textContent = f.comps;
            if (swapsEl) swapsEl.textContent = f.swaps;

            if (barsEl) {
              barsEl.innerHTML = f.arr.map(v => `<div class="mini-bar" style="height: ${Math.round((v / 90) * 100)}%;"></div>`).join('');
            }
            step++;
          }, 40);
        });
      });
    }
  }

  function getOrdinal(n) {
    if (n === 1) return 'st 🏆';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  }

  function loadAlgorithm(algoName) {
    currentAlgo = algoName;
    let frames = [];
    if (algoName === 'bubble') frames = buildBubbleSortFrames(currentArray);
    else if (algoName === 'selection') frames = buildSelectionSortFrames(currentArray);
    else if (algoName === 'insertion') frames = buildInsertionSortFrames(currentArray);
    else if (algoName === 'quick') frames = buildQuickSortFrames(currentArray);
    else frames = buildBubbleSortFrames(currentArray);

    engine.setFrames(frames);
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'sorting-code-block'
    });

    loadAlgorithm('bubble');
    setupRaceMode();

    const algoSelect = document.getElementById('select-sort-algo');
    if (algoSelect) {
      algoSelect.addEventListener('change', (e) => {
        loadAlgorithm(e.target.value);
      });
    }

    const randomBtn = document.getElementById('btn-op-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        currentArray = [];
        for (let i = 0; i < 8; i++) {
          currentArray.push(Math.floor(Math.random() * 70) + 10);
        }
        loadAlgorithm(currentAlgo);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
