/**
 * ============================================================================
 * DSA Playground - Heaps & Priority Queues Visualizer (js/viz/heaps.js)
 * Dual Tree & Array visualization: Max-Heap & Min-Heap, Heapify Up & Down
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  let isMaxHeap = true;
  // Complete binary tree initial array (Max Heap):
  let heapArray = [90, 75, 60, 40, 55, 30, 20];
  let engine = null;

  // Fixed coordinate positions for complete binary tree up to 7 nodes
  const TREE_POS = [
    { x: 300, y: 35 },   // 0 (root)
    { x: 180, y: 105 },  // 1 (left)
    { x: 420, y: 105 },  // 2 (right)
    { x: 110, y: 180 },  // 3 (left.left)
    { x: 240, y: 180 },  // 4 (left.right)
    { x: 360, y: 180 },  // 5 (right.left)
    { x: 480, y: 180 }   // 6 (right.right)
  ];

  function renderHeapStage(stageEl, frameData) {
    if (!stageEl) return;
    const { arr = [], activeIndices = [], stateType = 'default' } = frameData;

    // 1. SVG Tree view
    let svg = `<svg class="tree-svg" style="height: 200px;" viewBox="0 0 600 210">`;

    // Draw tree edges
    for (let i = 0; i < arr.length; i++) {
      const leftIdx = 2 * i + 1;
      const rightIdx = 2 * i + 2;
      const p = TREE_POS[i];

      if (leftIdx < arr.length) {
        const c = TREE_POS[leftIdx];
        const isEdgeActive = activeIndices.includes(i) && activeIndices.includes(leftIdx);
        svg += `<line class="tree-edge ${isEdgeActive ? 'edge-active' : ''}" x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}" />`;
      }
      if (rightIdx < arr.length) {
        const c = TREE_POS[rightIdx];
        const isEdgeActive = activeIndices.includes(i) && activeIndices.includes(rightIdx);
        svg += `<line class="tree-edge ${isEdgeActive ? 'edge-active' : ''}" x1="${p.x}" y1="${p.y}" x2="${c.x}" y2="${c.y}" />`;
      }
    }

    // Draw tree nodes
    for (let i = 0; i < arr.length; i++) {
      const p = TREE_POS[i];
      const isActive = activeIndices.includes(i);
      const nodeClass = isActive ? `node-${stateType}` : 'node-default';

      svg += `
        <g class="tree-node ${nodeClass}">
          <circle cx="${p.x}" cy="${p.y}" r="18" />
          <text x="${p.x}" y="${p.y}">${arr[i]}</text>
        </g>`;
    }
    svg += '</svg>';

    // 2. Underlying Flat Array View
    let arrayHtml = '<div style="margin-top: 15px; text-align: center;">';
    arrayHtml += '<div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Underlying Array Storage:</div>';
    arrayHtml += '<div class="viz-array-row" style="justify-content: center;">';

    for (let i = 0; i < 7; i++) {
      const hasVal = i < arr.length;
      const isActive = activeIndices.includes(i);
      const stateClass = isActive ? `viz-state-${stateType}` : (hasVal ? 'default' : 'empty');

      arrayHtml += `
        <div class="viz-array-cell viz-state-${stateClass}">
          <div class="viz-cell-box" style="width: 48px; height: 48px; font-size: 1rem; ${!hasVal ? 'opacity: 0.35; border-style: dashed;' : ''}">
            ${hasVal ? arr[i] : '&nbsp;'}
          </div>
          <div class="viz-cell-index">[${i}]</div>
        </div>`;
    }

    arrayHtml += '</div>';
    arrayHtml += `<div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Formulas: Left = 2i+1 | Right = 2i+2 | Parent = ⌊(i-1)/2⌋</div>`;
    arrayHtml += '</div>';

    stageEl.innerHTML = `<div class="viz-tree-container">${svg}${arrayHtml}</div>`;
  }

  /**
   * Insert Operation with Heapify Up
   */
  function buildInsertFrames(val) {
    const frames = [];
    const arr = [...heapArray];

    if (arr.length >= 7) {
      frames.push({
        arr: [...arr],
        activeIndices: [],
        caption: `Heap capacity reached (max 7 nodes for demonstration). Extract root first!`,
        codeLine: null,
        render: (stage, f) => renderHeapStage(stage, f)
      });
      return frames;
    }

    // Step 1: Append to end
    arr.push(val);
    let curr = arr.length - 1;

    frames.push({
      arr: [...arr],
      activeIndices: [curr],
      stateType: 'active',
      caption: `1. Appended ${val} at index [${curr}] (next available complete tree leaf).`,
      codeLine: 12,
      render: (stage, f) => renderHeapStage(stage, f)
    });

    // Step 2: Heapify Up
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      const needsSwap = isMaxHeap ? arr[curr] > arr[parent] : arr[curr] < arr[parent];

      frames.push({
        arr: [...arr],
        activeIndices: [curr, parent],
        stateType: 'compare',
        caption: `Comparing child [${curr}] (${arr[curr]}) with parent [${parent}] (${arr[parent]}). Does ${arr[curr]} violate ${isMaxHeap ? 'Max-Heap (child > parent)' : 'Min-Heap (child < parent)'}?`,
        codeLine: 15,
        render: (stage, f) => renderHeapStage(stage, f)
      });

      if (needsSwap) {
        // Swap
        const temp = arr[curr];
        arr[curr] = arr[parent];
        arr[parent] = temp;

        frames.push({
          arr: [...arr],
          activeIndices: [curr, parent],
          stateType: 'success',
          caption: `Swapped! ${temp} promoted up to index [${parent}].`,
          codeLine: 18,
          render: (stage, f) => renderHeapStage(stage, f)
        });

        curr = parent;
      } else {
        break;
      }
    }

    frames.push({
      arr: [...arr],
      activeIndices: [curr],
      stateType: 'success',
      caption: `Heap property satisfied! Insertion complete in O(log n) time.`,
      codeLine: 21,
      render: (stage, f) => renderHeapStage(stage, f)
    });

    heapArray = arr;
    return frames;
  }

  /**
   * Extract Root (Max or Min) with Heapify Down
   */
  function buildExtractFrames() {
    const frames = [];
    const arr = [...heapArray];

    if (arr.length === 0) {
      frames.push({
        arr: [],
        activeIndices: [],
        caption: `Heap is empty! Nothing to extract.`,
        codeLine: null,
        render: (stage, f) => renderHeapStage(stage, f)
      });
      return frames;
    }

    const rootVal = arr[0];

    frames.push({
      arr: [...arr],
      activeIndices: [0],
      stateType: 'danger',
      caption: `Extracting ${isMaxHeap ? 'maximum' : 'minimum'} element: ${rootVal} from root [0].`,
      codeLine: 25,
      render: (stage, f) => renderHeapStage(stage, f)
    });

    if (arr.length === 1) {
      heapArray = [];
      frames.push({
        arr: [],
        activeIndices: [],
        caption: `Extracted only node. Heap is now empty.`,
        codeLine: 27,
        render: (stage, f) => renderHeapStage(stage, f)
      });
      return frames;
    }

    // Move last element to root
    const lastVal = arr.pop();
    arr[0] = lastVal;

    frames.push({
      arr: [...arr],
      activeIndices: [0],
      stateType: 'active',
      caption: `Replaced root with last leaf item (${lastVal}). Now running Heapify Down!`,
      codeLine: 29,
      render: (stage, f) => renderHeapStage(stage, f)
    });

    // Heapify Down
    let curr = 0;
    while (true) {
      let target = curr;
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;

      if (left < arr.length) {
        if (isMaxHeap ? arr[left] > arr[target] : arr[left] < arr[target]) {
          target = left;
        }
      }
      if (right < arr.length) {
        if (isMaxHeap ? arr[right] > arr[target] : arr[right] < arr[target]) {
          target = right;
        }
      }

      if (target !== curr) {
        frames.push({
          arr: [...arr],
          activeIndices: [curr, target],
          stateType: 'compare',
          caption: `Swapping parent [${curr}] (${arr[curr]}) with dominant child [${target}] (${arr[target]}).`,
          codeLine: 34,
          render: (stage, f) => renderHeapStage(stage, f)
        });

        const temp = arr[curr];
        arr[curr] = arr[target];
        arr[target] = temp;

        frames.push({
          arr: [...arr],
          activeIndices: [curr, target],
          stateType: 'success',
          caption: `Pushed ${temp} down into slot [${target}].`,
          codeLine: 37,
          render: (stage, f) => renderHeapStage(stage, f)
        });

        curr = target;
      } else {
        break;
      }
    }

    frames.push({
      arr: [...arr],
      activeIndices: [],
      caption: `Extracted ${rootVal} successfully! Heap property restored in O(log n) time.`,
      codeLine: 40,
      render: (stage, f) => renderHeapStage(stage, f)
    });

    heapArray = arr;
    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'heap-code-block'
    });

    function setInitial() {
      const initFrame = {
        arr: [...heapArray],
        activeIndices: [],
        caption: `Complete Binary Tree mapped into Array. Mode: ${isMaxHeap ? 'Max-Heap (Parent ≥ Children)' : 'Min-Heap (Parent ≤ Children)'}.`,
        codeLine: null,
        render: (stage, f) => renderHeapStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const typeSelect = document.getElementById('select-heap-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        isMaxHeap = e.target.value === 'max';
        if (isMaxHeap) {
          heapArray = [90, 75, 60, 40, 55, 30, 20];
        } else {
          heapArray = [10, 25, 30, 60, 40, 70, 85];
        }
        setInitial();
      });
    }

    const insertBtn = document.getElementById('btn-op-insert');
    const insertVal = document.getElementById('input-insert-val');
    if (insertBtn && insertVal) {
      insertBtn.addEventListener('click', () => {
        const val = parseInt(insertVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildInsertFrames(val));
        engine.play();
      });
    }

    const extractBtn = document.getElementById('btn-op-extract');
    if (extractBtn) {
      extractBtn.addEventListener('click', () => {
        engine.setFrames(buildExtractFrames());
        engine.play();
      });
    }

    const randomBtn = document.getElementById('btn-op-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        heapArray = isMaxHeap 
          ? [95, 80, 65, 50, 45, 30, 15] 
          : [12, 28, 35, 48, 62, 70, 88];
        setInitial();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
