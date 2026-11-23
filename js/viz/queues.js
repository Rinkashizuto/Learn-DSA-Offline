/**
 * ============================================================================
 * DSA Playground - Queues & Deques Visualizer (js/viz/queues.js)
 * FIFO Queue, Circular Queue, and Deque operations: Enqueue, Dequeue, Front/Rear
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  const QUEUE_CAPACITY = 6;
  // Circular buffer representation: array of size QUEUE_CAPACITY with front and rear indices
  let queue = [null, null, null, null, null, null];
  let front = -1;
  let rear = -1;
  let count = 0;
  let mode = 'fifo'; // 'fifo' or 'deque'
  let engine = null;

  function renderQueueStage(stageEl, frameData) {
    if (!stageEl) return;
    const { items = [], fIdx = -1, rIdx = -1, states = {}, totalCount = 0 } = frameData;

    let html = '<div style="display:flex; flex-direction:column; align-items:center;">';
    html += '<div class="viz-queue-track" role="list" aria-label="Visual Queue Track">';

    for (let i = 0; i < QUEUE_CAPACITY; i++) {
      const val = items[i];
      const hasVal = val !== null && val !== undefined;
      const state = states[i] || (hasVal ? 'default' : 'empty');
      const isFront = totalCount > 0 && i === fIdx;
      const isRear = totalCount > 0 && i === rIdx;

      html += `
        <div class="viz-queue-slot" role="listitem">
          ${isFront ? '<div class="viz-queue-tag queue-tag-front">FRONT ↓</div>' : ''}
          <div class="viz-queue-box viz-state-${state}" style="${!hasVal ? 'opacity: 0.35; border-style: dashed;' : ''}">
            ${hasVal ? val : '&nbsp;'}
          </div>
          <div class="viz-cell-index">[${i}]</div>
          ${isRear ? '<div class="viz-queue-tag queue-tag-rear">REAR ↑</div>' : ''}
        </div>`;
    }

    html += '</div>';
    html += `<div style="margin-top: 36px; font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-mono);">Elements: ${totalCount} / ${QUEUE_CAPACITY} | Front Index: ${fIdx} | Rear Index: ${rIdx}</div>`;
    html += '</div>';

    stageEl.innerHTML = html;
  }

  /**
   * Enqueue (Insert at Rear)
   */
  function buildEnqueueFrames(val) {
    const frames = [];
    if (count >= QUEUE_CAPACITY) {
      frames.push({
        items: [...queue],
        fIdx: front,
        rIdx: rear,
        states: {},
        totalCount: count,
        caption: `Queue Overflow! Cannot enqueue ${val}. Queue is completely full.`,
        codeLine: 12,
        render: (stage, f) => renderQueueStage(stage, f)
      });
      return frames;
    }

    const nextRear = (rear + 1) % QUEUE_CAPACITY;
    const nextFront = front === -1 ? 0 : front;

    frames.push({
      items: [...queue],
      fIdx: front,
      rIdx: rear,
      states: {},
      totalCount: count,
      caption: `Calling enqueue(${val}). Calculating circular rear position: (rear + 1) % capacity = (${rear} + 1) % ${QUEUE_CAPACITY} = ${nextRear}.`,
      codeLine: 14,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    const working = [...queue];
    working[nextRear] = val;

    frames.push({
      items: working,
      fIdx: nextFront,
      rIdx: nextRear,
      states: { [nextRear]: 'active' },
      totalCount: count + 1,
      caption: `Placed ${val} into slot [${nextRear}]. Advancing REAR pointer.`,
      codeLine: 16,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    frames.push({
      items: working,
      fIdx: nextFront,
      rIdx: nextRear,
      states: { [nextRear]: 'success' },
      totalCount: count + 1,
      caption: `Enqueue complete in O(1) time! Total queue count = ${count + 1}.`,
      codeLine: 18,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    queue = working;
    front = nextFront;
    rear = nextRear;
    count++;

    return frames;
  }

  /**
   * Dequeue (Remove from Front)
   */
  function buildDequeueFrames() {
    const frames = [];
    if (count === 0) {
      frames.push({
        items: [...queue],
        fIdx: front,
        rIdx: rear,
        states: {},
        totalCount: 0,
        caption: `Queue Underflow! Cannot dequeue from an empty queue.`,
        codeLine: 22,
        render: (stage, f) => renderQueueStage(stage, f)
      });
      return frames;
    }

    const removedVal = queue[front];

    frames.push({
      items: [...queue],
      fIdx: front,
      rIdx: rear,
      states: { [front]: 'danger' },
      totalCount: count,
      caption: `Removing front element (${removedVal}) from slot [${front}].`,
      codeLine: 24,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    const working = [...queue];
    working[front] = null;
    let nextFront = (front + 1) % QUEUE_CAPACITY;
    let nextRear = rear;
    const nextCount = count - 1;

    if (nextCount === 0) {
      nextFront = -1;
      nextRear = -1;
    }

    frames.push({
      items: working,
      fIdx: nextFront,
      rIdx: nextRear,
      states: {},
      totalCount: nextCount,
      caption: `Dequeued ${removedVal}! Front advances circularly to [${nextFront}]. Zero shifting needed (O(1)).`,
      codeLine: 26,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    queue = working;
    front = nextFront;
    rear = nextRear;
    count = nextCount;

    return frames;
  }

  /**
   * Peek Front
   */
  function buildPeekFrames() {
    const frames = [];
    if (count === 0) {
      frames.push({
        items: [...queue],
        fIdx: front,
        rIdx: rear,
        states: {},
        totalCount: 0,
        caption: `Queue is empty! No front element to peek.`,
        codeLine: 30,
        render: (stage, f) => renderQueueStage(stage, f)
      });
      return frames;
    }

    frames.push({
      items: [...queue],
      fIdx: front,
      rIdx: rear,
      states: { [front]: 'compare' },
      totalCount: count,
      caption: `Inspecting FRONT element: ${queue[front]} at index [${front}]. O(1) read.`,
      codeLine: 32,
      render: (stage, f) => renderQueueStage(stage, f)
    });

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'queue-code-block'
    });

    // Populate initial items: 3 items in circular buffer
    queue = [25, 48, 71, null, null, null];
    front = 0;
    rear = 2;
    count = 3;

    function setInitial() {
      const initFrame = {
        items: [...queue],
        fIdx: front,
        rIdx: rear,
        states: {},
        totalCount: count,
        caption: `Queue initialized with ${count} items. FIFO: First item in (FRONT) is the first item out.`,
        codeLine: null,
        render: (stage, f) => renderQueueStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const enqBtn = document.getElementById('btn-op-enqueue');
    const enqVal = document.getElementById('input-enqueue-val');
    if (enqBtn && enqVal) {
      enqBtn.addEventListener('click', () => {
        const val = parseInt(enqVal.value, 10);
        if (isNaN(val)) return;
        engine.setFrames(buildEnqueueFrames(val));
        engine.play();
      });
    }

    const deqBtn = document.getElementById('btn-op-dequeue');
    if (deqBtn) {
      deqBtn.addEventListener('click', () => {
        engine.setFrames(buildDequeueFrames());
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
        queue = [null, null, null, null, null, null];
        front = -1;
        rear = -1;
        count = 0;
        setInitial();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
