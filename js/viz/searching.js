/**
 * ============================================================================
 * DSA Playground - Searching Visualizer (js/viz/searching.js)
 * Linear Search vs. Binary Search with Low/Mid/High pointer tracking
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  // Sorted array for binary search demonstration
  const SEARCH_ARRAY = [11, 23, 35, 47, 52, 68, 74, 83, 96];
  let searchMode = 'binary'; // 'binary' or 'linear'
  let engine = null;

  function renderSearchStage(stageEl, frameData) {
    if (!stageEl) return;
    const { arr = SEARCH_ARRAY, activeIdx = null, low = null, mid = null, high = null, stateType = 'default', eliminated = [] } = frameData;

    let html = '<div class="viz-array-row" role="list" aria-label="Search Array">';

    arr.forEach((val, idx) => {
      let isEliminated = eliminated.includes(idx);
      let isTarget = activeIdx === idx;
      let stateClass = isTarget ? `viz-state-${stateType}` : (isEliminated ? 'viz-state-empty' : 'viz-state-default');

      // Pointer labels: Low, Mid, High
      const ptrs = [];
      if (idx === low) ptrs.push('LOW');
      if (idx === mid) ptrs.push('MID');
      if (idx === high) ptrs.push('HIGH');
      if (activeIdx === idx && searchMode === 'linear') ptrs.push('i');

      const pointerText = ptrs.join(' | ');

      html += `
        <div class="viz-array-cell ${stateClass}" role="listitem" style="${isEliminated ? 'opacity: 0.25;' : ''}">
          ${pointerText ? `<div class="viz-cell-pointer" style="font-size:0.75rem;">${pointerText} ↓</div>` : ''}
          <div class="viz-cell-box">${val}</div>
          <div class="viz-cell-index">[${idx}]</div>
        </div>`;
    });

    html += '</div>';
    stageEl.innerHTML = html;
  }

  /**
   * 1. Binary Search Frames
   */
  function buildBinarySearchFrames(targetVal) {
    const frames = [];
    const arr = [...SEARCH_ARRAY];
    let low = 0;
    let high = arr.length - 1;
    let eliminated = [];
    let found = false;

    frames.push({
      arr: arr,
      low: low, mid: null, high: high,
      eliminated: [],
      caption: `1. Binary Search initialized for target: ${targetVal}. Low = [${low}], High = [${high}]. Array MUST be sorted.`,
      codeLine: 12,
      render: (stage, f) => renderSearchStage(stage, f)
    });

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);
      const midVal = arr[mid];

      frames.push({
        arr: arr,
        low: low, mid: mid, high: high,
        activeIdx: mid,
        stateType: 'compare',
        eliminated: [...eliminated],
        caption: `Calculate mid = low + (high - low) / 2 = ${mid}. Inspecting arr[${mid}] (${midVal}).`,
        codeLine: 14,
        render: (stage, f) => renderSearchStage(stage, f)
      });

      if (midVal === targetVal) {
        found = true;
        frames.push({
          arr: arr,
          low: low, mid: mid, high: high,
          activeIdx: mid,
          stateType: 'success',
          eliminated: [...eliminated],
          caption: `Match found! arr[${mid}] (${midVal}) == ${targetVal}. Returning index ${mid}. O(log n) efficiency!`,
          codeLine: 16,
          render: (stage, f) => renderSearchStage(stage, f)
        });
        break;
      }

      if (targetVal < midVal) {
        // Discard right half
        for (let k = mid; k <= high; k++) {
          if (!eliminated.includes(k)) eliminated.push(k);
        }
        high = mid - 1;

        frames.push({
          arr: arr,
          low: low, mid: mid, high: high,
          activeIdx: null,
          eliminated: [...eliminated],
          caption: `${targetVal} < ${midVal} → Target is in left half. Discarding right half. Updated High = [${high}].`,
          codeLine: 19,
          render: (stage, f) => renderSearchStage(stage, f)
        });
      } else {
        // Discard left half
        for (let k = low; k <= mid; k++) {
          if (!eliminated.includes(k)) eliminated.push(k);
        }
        low = mid + 1;

        frames.push({
          arr: arr,
          low: low, mid: mid, high: high,
          activeIdx: null,
          eliminated: [...eliminated],
          caption: `${targetVal} > ${midVal} → Target is in right half. Discarding left half. Updated Low = [${low}].`,
          codeLine: 21,
          render: (stage, f) => renderSearchStage(stage, f)
        });
      }
    }

    if (!found) {
      frames.push({
        arr: arr,
        low: low, mid: null, high: high,
        activeIdx: null,
        eliminated: Array.from({ length: arr.length }, (_, i) => i),
        caption: `Low > High! Search space exhausted. Target ${targetVal} is not in the array. Returning -1.`,
        codeLine: 24,
        render: (stage, f) => renderSearchStage(stage, f)
      });
    }

    return frames;
  }

  /**
   * 2. Linear Search Frames
   */
  function buildLinearSearchFrames(targetVal) {
    const frames = [];
    const arr = [...SEARCH_ARRAY];
    let found = false;

    frames.push({
      arr: arr,
      activeIdx: 0,
      stateType: 'compare',
      caption: `Linear Search for ${targetVal}: Checking elements sequentially from index [0].`,
      codeLine: 6,
      render: (stage, f) => renderSearchStage(stage, f)
    });

    for (let i = 0; i < arr.length; i++) {
      const isMatch = arr[i] === targetVal;

      frames.push({
        arr: arr,
        activeIdx: i,
        stateType: isMatch ? 'success' : 'compare',
        caption: `Step ${i + 1}: Checking arr[${i}] (${arr[i]}). Does it equal ${targetVal}?`,
        codeLine: 7,
        render: (stage, f) => renderSearchStage(stage, f)
      });

      if (isMatch) {
        found = true;
        frames.push({
          arr: arr,
          activeIdx: i,
          stateType: 'success',
          caption: `Found target ${targetVal} at index [${i}] in ${i + 1} steps!`,
          codeLine: 8,
          render: (stage, f) => renderSearchStage(stage, f)
        });
        break;
      }
    }

    if (!found) {
      frames.push({
        arr: arr,
        activeIdx: null,
        caption: `Scanned all ${arr.length} elements without finding ${targetVal}. O(n) scan finished.`,
        codeLine: 10,
        render: (stage, f) => renderSearchStage(stage, f)
      });
    }

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'searching-code-block'
    });

    function setInitial() {
      const initFrame = {
        arr: SEARCH_ARRAY,
        activeIdx: null,
        low: 0,
        mid: 4,
        high: 8,
        eliminated: [],
        caption: `Sorted array loaded. Mode: ${searchMode === 'binary' ? 'Binary Search (Divide & Conquer)' : 'Linear Search (Sequential)'}.`,
        codeLine: null,
        render: (stage, f) => renderSearchStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const modeSelect = document.getElementById('select-search-mode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        searchMode = e.target.value;
        setInitial();
      });
    }

    const searchBtn = document.getElementById('btn-op-search');
    const searchInput = document.getElementById('input-search-val');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(searchInput.value, 10);
        if (isNaN(val)) return;
        const frames = searchMode === 'binary' 
          ? buildBinarySearchFrames(val) 
          : buildLinearSearchFrames(val);
        engine.setFrames(frames);
        engine.play();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
