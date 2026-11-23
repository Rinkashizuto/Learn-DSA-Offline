/**
 * ============================================================================
 * DSA Playground - Linked Lists Visualizer (js/viz/linked-lists.js)
 * Singly & Doubly Linked List animations: Insert Head/Tail, Delete, Search
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  let isDoubly = false;
  let listData = [10, 24, 38, 52];
  let engine = null;

  /**
   * Render Linked List Stage
   */
  function renderLinkedListStage(stageEl, frameData) {
    if (!stageEl) return;
    const { nodes = [], states = {}, pointers = {}, isDoublyMode = false } = frameData;

    if (nodes.length === 0) {
      stageEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-weight: 700; color: var(--accent-primary);">HEAD →</span>
          <div class="viz-ll-null">nullptr (Empty List)</div>
        </div>`;
      return;
    }

    let html = '<div class="viz-ll-container" role="list" aria-label="Visual Linked List">';

    nodes.forEach((val, idx) => {
      const state = states[idx] || 'default';
      const pointerLabels = [];

      if (idx === 0) pointerLabels.push('<span class="pointer-head">HEAD</span>');
      if (idx === nodes.length - 1) pointerLabels.push('<span class="pointer-tail">TAIL</span>');
      if (pointers[idx]) pointerLabels.push(`<span class="pointer-curr">${pointers[idx]}</span>`);

      const pointerHtml = pointerLabels.length > 0 
        ? `<div class="viz-ll-pointer">${pointerLabels.join(' | ')}</div>` 
        : '';

      html += `
        <div class="viz-ll-node-wrapper" role="listitem">
          ${pointerHtml}
          <div class="viz-ll-node viz-state-${state}">
            ${isDoublyMode ? '<div class="viz-ll-prev">&larr;</div>' : ''}
            <div class="viz-ll-data">${val}</div>
            <div class="viz-ll-next">&rarr;</div>
          </div>
          <div class="viz-ll-arrow">${isDoublyMode ? '⇄' : '→'}</div>
        </div>`;
    });

    html += '<div class="viz-ll-null">nullptr</div>';
    html += '</div>';

    stageEl.innerHTML = html;
  }

  /**
   * 1. Search Operation Frames
   */
  function buildSearchFrames(targetVal) {
    const frames = [];
    const nodes = [...listData];

    frames.push({
      nodes: [...nodes],
      states: {},
      pointers: { 0: 'curr' },
      isDoublyMode: isDoubly,
      caption: `Starting traversal at HEAD (curr = head). Looking for value: ${targetVal}.`,
      codeLine: 8,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    let found = false;
    for (let i = 0; i < nodes.length; i++) {
      frames.push({
        nodes: [...nodes],
        states: { [i]: 'compare' },
        pointers: { [i]: 'curr' },
        isDoublyMode: isDoubly,
        caption: `Inspecting curr->data (${nodes[i]}). Does it match target (${targetVal})?`,
        codeLine: 10,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });

      if (nodes[i] === targetVal) {
        found = true;
        frames.push({
          nodes: [...nodes],
          states: { [i]: 'success' },
          pointers: { [i]: 'FOUND!' },
          isDoublyMode: isDoubly,
          caption: `Success! Target value ${targetVal} found at node index ${i}.`,
          codeLine: 11,
          render: (stage, f) => renderLinkedListStage(stage, f)
        });
        break;
      }

      if (i < nodes.length - 1) {
        frames.push({
          nodes: [...nodes],
          states: {},
          pointers: { [i + 1]: 'curr' },
          isDoublyMode: isDoubly,
          caption: `No match. Advance pointer to curr->next.`,
          codeLine: 13,
          render: (stage, f) => renderLinkedListStage(stage, f)
        });
      }
    }

    if (!found) {
      frames.push({
        nodes: [...nodes],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `Reached nullptr without finding ${targetVal}. Returning false / nullptr.`,
        codeLine: 15,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });
    }

    return frames;
  }

  /**
   * 2. Insert at Head
   */
  function buildInsertHeadFrames(val) {
    const frames = [];
    const nodes = [...listData];

    if (nodes.length >= 7) {
      frames.push({
        nodes: [...nodes],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `List is at maximum demo length (7 nodes). Delete a node first!`,
        codeLine: null,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });
      return frames;
    }

    frames.push({
      nodes: [...nodes],
      states: {},
      pointers: { 0: 'curr' },
      isDoublyMode: isDoubly,
      caption: `Allocating new Node on heap with value ${val} (Node* newNode = new Node(${val})).`,
      codeLine: 18,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    const newNodes = [val, ...nodes];

    frames.push({
      nodes: newNodes,
      states: { 0: 'active' },
      pointers: { 0: 'newNode', 1: 'old HEAD' },
      isDoublyMode: isDoubly,
      caption: `Connecting pointers: newNode->next = head. ${isDoubly ? 'head->prev = newNode.' : ''}`,
      codeLine: 20,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    frames.push({
      nodes: newNodes,
      states: { 0: 'success' },
      pointers: {},
      isDoublyMode: isDoubly,
      caption: `Updated head pointer: head = newNode. Insertion at head complete in instant O(1) time!`,
      codeLine: 24,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    listData = newNodes;
    return frames;
  }

  /**
   * 3. Insert at Tail
   */
  function buildInsertTailFrames(val) {
    const frames = [];
    const nodes = [...listData];

    if (nodes.length >= 7) {
      frames.push({
        nodes: [...nodes],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `List is at maximum demo length (7 nodes). Delete a node first!`,
        codeLine: null,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });
      return frames;
    }

    if (nodes.length === 0) {
      return buildInsertHeadFrames(val);
    }

    const lastIdx = nodes.length - 1;

    frames.push({
      nodes: [...nodes],
      states: { [lastIdx]: 'compare' },
      pointers: { [lastIdx]: 'TAIL' },
      isDoublyMode: isDoubly,
      caption: `Allocating new Node(${val}). Locating tail pointer (or traversing to end).`,
      codeLine: 28,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    const newNodes = [...nodes, val];
    const newTailIdx = newNodes.length - 1;

    frames.push({
      nodes: newNodes,
      states: { [newTailIdx]: 'active' },
      pointers: { [lastIdx]: 'old TAIL', [newTailIdx]: 'newNode' },
      isDoublyMode: isDoubly,
      caption: `Linking old tail->next to newNode. ${isDoubly ? 'newNode->prev = tail.' : ''}`,
      codeLine: 31,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    frames.push({
      nodes: newNodes,
      states: { [newTailIdx]: 'success' },
      pointers: {},
      isDoublyMode: isDoubly,
      caption: `Updated tail pointer: tail = newNode. New node now points to nullptr.`,
      codeLine: 34,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    listData = newNodes;
    return frames;
  }

  /**
   * 4. Delete by Value
   */
  function buildDeleteFrames(val) {
    const frames = [];
    const nodes = [...listData];

    if (nodes.length === 0) {
      frames.push({
        nodes: [],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `List is empty! Nothing to delete.`,
        codeLine: null,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });
      return frames;
    }

    frames.push({
      nodes: [...nodes],
      states: {},
      pointers: { 0: 'curr' },
      isDoublyMode: isDoubly,
      caption: `Searching for node containing value ${val} to uncouple and delete.`,
      codeLine: 38,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    let targetIdx = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] === val) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx === -1) {
      frames.push({
        nodes: [...nodes],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `Value ${val} not found in the list. No nodes deleted.`,
        codeLine: 48,
        render: (stage, f) => renderLinkedListStage(stage, f)
      });
      return frames;
    }

    frames.push({
      nodes: [...nodes],
      states: { [targetIdx]: 'danger' },
      pointers: { [targetIdx]: 'deleteTarget' },
      isDoublyMode: isDoubly,
      caption: `Found node to delete at index ${targetIdx}. Unhooking pointers around it.`,
      codeLine: 41,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    const remaining = nodes.filter((_, idx) => idx !== targetIdx);

    frames.push({
      nodes: remaining,
      states: {},
      pointers: {},
      isDoublyMode: isDoubly,
      caption: `Bypassed node: previous->next = target->next. Memory safely freed via delete!`,
      codeLine: 44,
      render: (stage, f) => renderLinkedListStage(stage, f)
    });

    listData = remaining;
    return frames;
  }

  /**
   * Initialize
   */
  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'll-code-block'
    });

    function setInitial() {
      const initFrame = {
        nodes: [...listData],
        states: {},
        pointers: {},
        isDoublyMode: isDoubly,
        caption: `Loaded ${isDoubly ? 'Doubly' : 'Singly'} Linked List with ${listData.length} nodes. Choose an operation above.`,
        codeLine: null,
        render: (stage, f) => renderLinkedListStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    // Mode Toggle (Singly vs Doubly)
    const modeSelect = document.getElementById('select-ll-mode');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        isDoubly = e.target.value === 'doubly';
        setInitial();
      });
    }

    // Buttons
    const searchBtn = document.getElementById('btn-op-search');
    const searchVal = document.getElementById('input-search-val');
    if (searchBtn && searchVal) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(searchVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildSearchFrames(val));
        engine.play();
      });
    }

    const insertHeadBtn = document.getElementById('btn-op-insert-head');
    const insertTailBtn = document.getElementById('btn-op-insert-tail');
    const insertVal = document.getElementById('input-insert-val');

    if (insertHeadBtn && insertVal) {
      insertHeadBtn.addEventListener('click', () => {
        const val = parseInt(insertVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildInsertHeadFrames(val));
        engine.play();
      });
    }

    if (insertTailBtn && insertVal) {
      insertTailBtn.addEventListener('click', () => {
        const val = parseInt(insertVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildInsertTailFrames(val));
        engine.play();
      });
    }

    const deleteBtn = document.getElementById('btn-op-delete');
    const deleteVal = document.getElementById('input-delete-val');
    if (deleteBtn && deleteVal) {
      deleteBtn.addEventListener('click', () => {
        const val = parseInt(deleteVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildDeleteFrames(val));
        engine.play();
      });
    }

    const randomBtn = document.getElementById('btn-op-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        listData = [
          Math.floor(Math.random() * 80) + 10,
          Math.floor(Math.random() * 80) + 10,
          Math.floor(Math.random() * 80) + 10,
          Math.floor(Math.random() * 80) + 10
        ];
        setInitial();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
