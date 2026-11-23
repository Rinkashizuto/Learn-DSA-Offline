/**
 * ============================================================================
 * DSA Playground - Array Visualizer (js/viz/arrays.js)
 * Implements Search, Insert, and Delete with step-by-step memory frame recording
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  // Current array state
  const MAX_CAPACITY = 8;
  let arrayData = [15, 42, 8, 23, 74, 39];
  let engine = null;

  /**
   * Helper: Render Array Elements into the DOM Stage
   */
  function renderArrayStage(stageEl, frameData) {
    if (!stageEl) return;
    const { elements, states = {}, pointers = {} } = frameData;

    let html = '<div class="viz-array-row" role="list" aria-label="Visual Array">';

    // Render cells up to MAX_CAPACITY to visually convey contiguous allocated memory
    for (let i = 0; i < MAX_CAPACITY; i++) {
      const isAllocated = i < elements.length;
      const val = isAllocated ? elements[i] : '&nbsp;';
      const cellState = states[i] || (isAllocated ? 'default' : 'empty');
      const pointerText = pointers[i] || null;

      html += `
        <div class="viz-array-cell viz-state-${cellState}" role="listitem">
          ${pointerText ? `<div class="viz-cell-pointer">${pointerText} ↓</div>` : ''}
          <div class="viz-cell-box" style="${!isAllocated ? 'opacity: 0.35; border-style: dashed;' : ''}">
            ${val}
          </div>
          <div class="viz-cell-index">[${i}]</div>
        </div>`;
    }

    html += '</div>';
    stageEl.innerHTML = html;
  }

  /**
   * 1. Linear Search Operation Frames Generator
   */
  function buildSearchFrames(targetVal) {
    const frames = [];
    const elements = [...arrayData];

    frames.push({
      elements: [...elements],
      states: {},
      pointers: {},
      caption: `Starting Linear Search for target value: ${targetVal}. Looking sequentially from index 0.`,
      codeLine: 2,
      render: (stage) => renderArrayStage(stage, frames[0])
    });

    let foundIndex = -1;

    for (let i = 0; i < elements.length; i++) {
      // Comparison step
      const isMatch = elements[i] === targetVal;
      const compareStates = { [i]: 'compare' };
      const comparePointers = { [i]: `i = ${i}` };

      frames.push({
        elements: [...elements],
        states: compareStates,
        pointers: comparePointers,
        caption: `Checking index [${i}]: Does arr[${i}] (${elements[i]}) equal target (${targetVal})?`,
        codeLine: 4,
        render: (stage, f) => renderArrayStage(stage, f)
      });

      if (isMatch) {
        foundIndex = i;
        frames.push({
          elements: [...elements],
          states: { [i]: 'success' },
          pointers: { [i]: `FOUND!` },
          caption: `Match found! Element ${targetVal} exists at index [${i}]. Returning index ${i}.`,
          codeLine: 5,
          render: (stage, f) => renderArrayStage(stage, f)
        });
        break;
      }
    }

    if (foundIndex === -1) {
      frames.push({
        elements: [...elements],
        states: {},
        pointers: {},
        caption: `Reached end of array without finding ${targetVal}. Returning -1 (not found).`,
        codeLine: 8,
        render: (stage, f) => renderArrayStage(stage, f)
      });
    }

    return frames;
  }

  /**
   * 2. Insert Operation Frames Generator
   */
  function buildInsertFrames(insertVal, insertIdx) {
    const frames = [];
    const elements = [...arrayData];

    if (elements.length >= MAX_CAPACITY) {
      frames.push({
        elements: [...elements],
        states: {},
        pointers: {},
        caption: `Cannot insert: Array capacity limit reached (${MAX_CAPACITY} elements). Dynamic resizing needed.`,
        codeLine: null,
        render: (stage, f) => renderArrayStage(stage, f)
      });
      return frames;
    }

    if (insertIdx < 0 || insertIdx > elements.length) {
      frames.push({
        elements: [...elements],
        states: {},
        pointers: {},
        caption: `Invalid index ${insertIdx}. Valid insertion range is [0 to ${elements.length}].`,
        codeLine: null,
        render: (stage, f) => renderArrayStage(stage, f)
      });
      return frames;
    }

    frames.push({
      elements: [...elements],
      states: {},
      pointers: { [insertIdx]: 'Insert here' },
      caption: `Preparing to insert value ${insertVal} at index [${insertIdx}]. Existing items must shift right.`,
      codeLine: 12,
      render: (stage, f) => renderArrayStage(stage, f)
    });

    // Allocate room in array
    const working = [...elements, null];

    // Shift elements from back to front
    for (let j = elements.length - 1; j >= insertIdx; j--) {
      working[j + 1] = working[j];
      frames.push({
        elements: [...working],
        states: { [j]: 'compare', [j + 1]: 'active' },
        pointers: { [j]: `Shift →`, [j + 1]: `arr[${j+1}]` },
        caption: `Shifting arr[${j}] (${working[j]}) rightwards into index [${j + 1}].`,
        codeLine: 15,
        render: (stage, f) => renderArrayStage(stage, f)
      });
    }

    // Insert new value
    working[insertIdx] = insertVal;
    frames.push({
      elements: [...working],
      states: { [insertIdx]: 'success' },
      pointers: { [insertIdx]: `Inserted!` },
      caption: `Placed ${insertVal} into the freed slot at index [${insertIdx}]. Array size is now ${working.length}.`,
      codeLine: 18,
      render: (stage, f) => renderArrayStage(stage, f)
    });

    // Update state on completion
    arrayData = [...working];

    return frames;
  }

  /**
   * 3. Delete Operation Frames Generator
   */
  function buildDeleteFrames(deleteIdx) {
    const frames = [];
    const elements = [...arrayData];

    if (elements.length === 0) {
      frames.push({
        elements: [],
        states: {},
        pointers: {},
        caption: `Array is empty! Nothing to delete.`,
        codeLine: null,
        render: (stage, f) => renderArrayStage(stage, f)
      });
      return frames;
    }

    if (deleteIdx < 0 || deleteIdx >= elements.length) {
      frames.push({
        elements: [...elements],
        states: {},
        pointers: {},
        caption: `Invalid index [${deleteIdx}]. Valid index range is [0 to ${elements.length - 1}].`,
        codeLine: null,
        render: (stage, f) => renderArrayStage(stage, f)
      });
      return frames;
    }

    frames.push({
      elements: [...elements],
      states: { [deleteIdx]: 'danger' },
      pointers: { [deleteIdx]: 'Delete' },
      caption: `Removing element at index [${deleteIdx}] (value: ${elements[deleteIdx]}). Shift left to close gap.`,
      codeLine: 22,
      render: (stage, f) => renderArrayStage(stage, f)
    });

    const working = [...elements];

    for (let j = deleteIdx; j < working.length - 1; j++) {
      working[j] = working[j + 1];
      frames.push({
        elements: [...working],
        states: { [j]: 'active', [j + 1]: 'compare' },
        pointers: { [j]: `← Overwrite`, [j + 1]: `arr[${j+1}]` },
        caption: `Shifting arr[${j + 1}] (${working[j]}) left into index [${j}].`,
        codeLine: 25,
        render: (stage, f) => renderArrayStage(stage, f)
      });
    }

    working.pop();

    frames.push({
      elements: [...working],
      states: {},
      pointers: {},
      caption: `Deletion complete! Decremented array size to ${working.length}.`,
      codeLine: 28,
      render: (stage, f) => renderArrayStage(stage, f)
    });

    arrayData = [...working];

    return frames;
  }

  /**
   * Initialize Array Visualizer
   */
  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'arrays-code-block'
    });

    // Initial render frame
    const initialFrame = {
      elements: [...arrayData],
      states: {},
      pointers: {},
      caption: `Initial array with ${arrayData.length} items. Select Search, Insert, or Delete above.`,
      codeLine: null,
      render: (stage, f) => renderArrayStage(stage, f)
    };
    engine.setFrames([initialFrame]);

    // Attach form controls
    const searchBtn = document.getElementById('btn-op-search');
    const insertBtn = document.getElementById('btn-op-insert');
    const deleteBtn = document.getElementById('btn-op-delete');
    const randomBtn = document.getElementById('btn-op-random');

    const searchInput = document.getElementById('input-search-val');
    const insertValInput = document.getElementById('input-insert-val');
    const insertIdxInput = document.getElementById('input-insert-idx');
    const deleteIdxInput = document.getElementById('input-delete-idx');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(searchInput.value, 10);
        if (isNaN(val)) return;
        const frames = buildSearchFrames(val);
        engine.setFrames(frames);
        engine.play();
      });
    }

    if (insertBtn && insertValInput && insertIdxInput) {
      insertBtn.addEventListener('click', () => {
        const val = parseInt(insertValInput.value, 10);
        const idx = parseInt(insertIdxInput.value, 10);
        if (isNaN(val) || isNaN(idx)) return;
        const frames = buildInsertFrames(val, idx);
        engine.setFrames(frames);
        engine.play();
      });
    }

    if (deleteBtn && deleteIdxInput) {
      deleteBtn.addEventListener('click', () => {
        const idx = parseInt(deleteIdxInput.value, 10);
        if (isNaN(idx)) return;
        const frames = buildDeleteFrames(idx);
        engine.setFrames(frames);
        engine.play();
      });
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        const count = 5 + Math.floor(Math.random() * 2);
        arrayData = [];
        for (let i = 0; i < count; i++) {
          arrayData.push(Math.floor(Math.random() * 90) + 10);
        }
        const freshFrame = {
          elements: [...arrayData],
          states: {},
          pointers: {},
          caption: `Generated fresh random array of ${arrayData.length} elements.`,
          codeLine: null,
          render: (stage, f) => renderArrayStage(stage, f)
        };
        engine.setFrames([freshFrame]);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
