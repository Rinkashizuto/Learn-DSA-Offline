/**
 * ============================================================================
 * DSA Playground - Stack Visualizer (js/viz/stacks.js)
 * LIFO vertical stack container: Push, Pop, Peek, Clear
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  const MAX_STACK = 6;
  let stackData = [12, 45, 78];
  let engine = null;

  function renderStackStage(stageEl, frameData) {
    if (!stageEl) return;
    const { items = [], states = {}, showTop = true } = frameData;

    let html = '<div style="display:flex; flex-direction:column; align-items:center;">';
    html += '<div class="viz-stack-tube" role="list" aria-label="Visual Stack">';

    for (let i = 0; i < items.length; i++) {
      const val = items[i];
      const isTop = i === items.length - 1;
      const state = states[i] || (isTop ? 'active' : 'default');

      html += `
        <div class="viz-stack-item viz-state-${state}" role="listitem">
          ${val}
          ${isTop && showTop ? '<span class="viz-stack-top-badge">TOP ↑</span>' : ''}
        </div>`;
    }

    html += '</div>';
    html += `<div style="margin-top: 10px; font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">Size: ${items.length} / ${MAX_STACK}</div>`;
    html += '</div>';

    stageEl.innerHTML = html;
  }

  /**
   * 1. Push Operation Frames
   */
  function buildPushFrames(val) {
    const frames = [];
    const items = [...stackData];

    if (items.length >= MAX_STACK) {
      frames.push({
        items: [...items],
        states: {},
        caption: `Stack Overflow! Cannot push ${val}. Stack is already at maximum capacity (${MAX_STACK}).`,
        codeLine: 12,
        render: (stage, f) => renderStackStage(stage, f)
      });
      return frames;
    }

    frames.push({
      items: [...items],
      states: {},
      caption: `Calling push(${val}). Preparing to place ${val} on top of stack.`,
      codeLine: 14,
      render: (stage, f) => renderStackStage(stage, f)
    });

    const newItems = [...items, val];
    const topIdx = newItems.length - 1;

    frames.push({
      items: newItems,
      states: { [topIdx]: 'active' },
      caption: `Element ${val} placed at index [${topIdx}]. TOP pointer advances to this item.`,
      codeLine: 15,
      render: (stage, f) => renderStackStage(stage, f)
    });

    frames.push({
      items: newItems,
      states: { [topIdx]: 'success' },
      caption: `Push complete! Stack size is now ${newItems.length}. Operates in instant O(1) time.`,
      codeLine: 16,
      render: (stage, f) => renderStackStage(stage, f)
    });

    stackData = newItems;
    return frames;
  }

  /**
   * 2. Pop Operation Frames
   */
  function buildPopFrames() {
    const frames = [];
    const items = [...stackData];

    if (items.length === 0) {
      frames.push({
        items: [],
        states: {},
        caption: `Stack Underflow! Cannot pop from an empty stack (size == 0).`,
        codeLine: 20,
        render: (stage, f) => renderStackStage(stage, f)
      });
      return frames;
    }

    const topIdx = items.length - 1;
    const poppedVal = items[topIdx];

    frames.push({
      items: [...items],
      states: { [topIdx]: 'danger' },
      caption: `Inspecting top item: ${poppedVal} at index [${topIdx}]. Preparing to pop.`,
      codeLine: 22,
      render: (stage, f) => renderStackStage(stage, f)
    });

    const remaining = items.slice(0, -1);

    frames.push({
      items: remaining,
      states: {},
      caption: `Popped ${poppedVal} off the stack! TOP pointer moves down to index [${remaining.length - 1}].`,
      codeLine: 24,
      render: (stage, f) => renderStackStage(stage, f)
    });

    stackData = remaining;
    return frames;
  }

  /**
   * 3. Peek Operation Frames
   */
  function buildPeekFrames() {
    const frames = [];
    const items = [...stackData];

    if (items.length === 0) {
      frames.push({
        items: [],
        states: {},
        caption: `Stack is empty! Cannot peek at TOP element.`,
        codeLine: 28,
        render: (stage, f) => renderStackStage(stage, f)
      });
      return frames;
    }

    const topIdx = items.length - 1;
    frames.push({
      items: [...items],
      states: { [topIdx]: 'compare' },
      caption: `Peeking at TOP item: ${items[topIdx]}. No elements are removed from memory. O(1).`,
      codeLine: 30,
      render: (stage, f) => renderStackStage(stage, f)
    });

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'stack-code-block'
    });

    function setInitial() {
      const initFrame = {
        items: [...stackData],
        states: {},
        caption: `Stack loaded with ${stackData.length} elements. LIFO: Last element in is the first element out.`,
        codeLine: null,
        render: (stage, f) => renderStackStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const pushBtn = document.getElementById('btn-op-push');
    const pushVal = document.getElementById('input-push-val');
    if (pushBtn && pushVal) {
      pushBtn.addEventListener('click', () => {
        const val = parseInt(pushVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildPushFrames(val));
        engine.play();
      });
    }

    const popBtn = document.getElementById('btn-op-pop');
    if (popBtn) {
      popBtn.addEventListener('click', () => {
        engine.setFrames(buildPopFrames());
        engine.play();
      });
    }

    const peekBtn = document.getElementById('btn-op-peek');
    if (peekBtn) {
      peekBtn.addEventListener('click', () => {
        engine.setFrames(buildPeekFrames());
        engine.play();
      });
    }

    const clearBtn = document.getElementById('btn-op-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        stackData = [];
        setInitial();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
