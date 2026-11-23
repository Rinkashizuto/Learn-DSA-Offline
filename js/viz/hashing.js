/**
 * ============================================================================
 * DSA Playground - Hashing Visualizer (js/viz/hashing.js)
 * Hash Table with Separate Chaining & Linear Probing collision resolution
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  const TABLE_SIZE = 7;
  let collisionStrategy = 'chaining'; // 'chaining' or 'probing'
  
  // Chaining table: array of arrays [[val, val], ...]
  let chainTable = [[], [8], [16], [], [11, 18], [], [6]];
  // Probing table: array of { key: number, occupied: boolean }
  let probeTable = [
    { key: null, occupied: false },
    { key: 8, occupied: true },
    { key: 16, occupied: true },
    { key: null, occupied: false },
    { key: 11, occupied: true },
    { key: 18, occupied: true },
    { key: 6, occupied: true }
  ];

  let engine = null;

  function hash(key) {
    return Math.abs(key) % TABLE_SIZE;
  }

  function renderHashStage(stageEl, frameData) {
    if (!stageEl) return;
    const { strategy = 'chaining', cTable = [], pTable = [], activeBucket = -1, stateType = 'default' } = frameData;

    let html = '<div class="viz-hash-table" role="list" aria-label="Visual Hash Table">';

    if (strategy === 'chaining') {
      for (let i = 0; i < TABLE_SIZE; i++) {
        const isTarget = i === activeBucket;
        const bucketNodes = cTable[i] || [];
        const stateClass = isTarget ? `viz-state-${stateType}` : 'default';

        html += `
          <div class="viz-hash-row ${stateClass}" role="listitem">
            <div class="viz-hash-bucket-index ${isTarget ? 'viz-state-active' : ''}">
              [${i}] →
            </div>
            <div class="viz-hash-chain-list">
              ${bucketNodes.length === 0 ? '<span style="color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-mono);">nullptr</span>' : ''}
              ${bucketNodes.map(k => `
                <div class="viz-hash-node">
                  <span class="viz-hash-node-key">key:</span>
                  <span class="viz-hash-node-val">${k}</span>
                </div>
                <span style="color: var(--accent-primary); font-weight: bold;">→</span>
              `).join('')}
              ${bucketNodes.length > 0 ? '<span style="color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-mono);">nullptr</span>' : ''}
            </div>
          </div>`;
      }
    } else {
      // Linear Probing
      for (let i = 0; i < TABLE_SIZE; i++) {
        const isTarget = i === activeBucket;
        const slot = pTable[i] || { key: null, occupied: false };
        const stateClass = isTarget ? `viz-state-${stateType}` : 'default';

        html += `
          <div class="viz-hash-row ${stateClass}" role="listitem">
            <div class="viz-hash-bucket-index ${isTarget ? 'viz-state-active' : ''}">
              Slot [${i}]
            </div>
            <div class="viz-hash-chain-list">
              <div class="viz-hash-node" style="${!slot.occupied ? 'opacity: 0.35; border-style: dashed;' : ''}">
                <span class="viz-hash-node-key">stored:</span>
                <span class="viz-hash-node-val">${slot.occupied ? slot.key : 'EMPTY'}</span>
              </div>
            </div>
          </div>`;
      }
    }

    html += '</div>';
    stageEl.innerHTML = html;
  }

  /**
   * 1. Insert Operation
   */
  function buildInsertFrames(key) {
    const frames = [];
    const bucket = hash(key);

    frames.push({
      strategy: collisionStrategy,
      cTable: JSON.parse(JSON.stringify(chainTable)),
      pTable: JSON.parse(JSON.stringify(probeTable)),
      activeBucket: -1,
      caption: `1. Compute hash index for key ${key}: hash(${key}) = ${key} % ${TABLE_SIZE} = ${bucket}.`,
      codeLine: 8,
      render: (stage, f) => renderHashStage(stage, f)
    });

    if (collisionStrategy === 'chaining') {
      const working = JSON.parse(JSON.stringify(chainTable));

      frames.push({
        strategy: 'chaining',
        cTable: working,
        activeBucket: bucket,
        stateType: 'compare',
        caption: `Checking bucket [${bucket}]. Chaining resolution appends collisions as linked list nodes.`,
        codeLine: 12,
        render: (stage, f) => renderHashStage(stage, f)
      });

      working[bucket].push(key);

      frames.push({
        strategy: 'chaining',
        cTable: working,
        activeBucket: bucket,
        stateType: 'success',
        caption: `Inserted key ${key} into bucket [${bucket}] in O(1) average time!`,
        codeLine: 14,
        render: (stage, f) => renderHashStage(stage, f)
      });

      chainTable = working;
    } else {
      // Linear Probing
      const working = JSON.parse(JSON.stringify(probeTable));
      let idx = bucket;
      let inserted = false;

      for (let step = 0; step < TABLE_SIZE; step++) {
        const curr = (bucket + step) % TABLE_SIZE;

        frames.push({
          strategy: 'probing',
          pTable: working,
          activeBucket: curr,
          stateType: 'compare',
          caption: `Checking slot [${curr}]... ${working[curr].occupied ? `Occupied by key ${working[curr].key}! Collision detected.` : 'Empty slot found!'}`,
          codeLine: 18,
          render: (stage, f) => renderHashStage(stage, f)
        });

        if (!working[curr].occupied) {
          working[curr] = { key: key, occupied: true };
          inserted = true;

          frames.push({
            strategy: 'probing',
            pTable: working,
            activeBucket: curr,
            stateType: 'success',
            caption: `Placed key ${key} into slot [${curr}] using Linear Probing!`,
            codeLine: 20,
            render: (stage, f) => renderHashStage(stage, f)
          });
          break;
        }
      }

      if (!inserted) {
        frames.push({
          strategy: 'probing',
          pTable: working,
          activeBucket: -1,
          caption: `Hash table is full! Linear probing requires resizing / rehashing.`,
          codeLine: null,
          render: (stage, f) => renderHashStage(stage, f)
        });
      } else {
        probeTable = working;
      }
    }

    return frames;
  }

  /**
   * 2. Search Operation
   */
  function buildSearchFrames(key) {
    const frames = [];
    const bucket = hash(key);

    frames.push({
      strategy: collisionStrategy,
      cTable: JSON.parse(JSON.stringify(chainTable)),
      pTable: JSON.parse(JSON.stringify(probeTable)),
      activeBucket: -1,
      caption: `Searching for key ${key}. Calculate hash: hash(${key}) = ${key} % ${TABLE_SIZE} = ${bucket}.`,
      codeLine: 24,
      render: (stage, f) => renderHashStage(stage, f)
    });

    if (collisionStrategy === 'chaining') {
      const bucketNodes = chainTable[bucket] || [];
      frames.push({
        strategy: 'chaining',
        cTable: chainTable,
        activeBucket: bucket,
        stateType: 'compare',
        caption: `Inspecting bucket [${bucket}] chain for key ${key}...`,
        codeLine: 26,
        render: (stage, f) => renderHashStage(stage, f)
      });

      const found = bucketNodes.includes(key);
      frames.push({
        strategy: 'chaining',
        cTable: chainTable,
        activeBucket: bucket,
        stateType: found ? 'success' : 'danger',
        caption: found ? `Key ${key} found in bucket [${bucket}]! O(1) average lookup.` : `Key ${key} NOT found in bucket [${bucket}].`,
        codeLine: found ? 28 : 30,
        render: (stage, f) => renderHashStage(stage, f)
      });
    } else {
      // Linear Probing
      let found = false;
      for (let step = 0; step < TABLE_SIZE; step++) {
        const curr = (bucket + step) % TABLE_SIZE;
        const slot = probeTable[curr];

        frames.push({
          strategy: 'probing',
          pTable: probeTable,
          activeBucket: curr,
          stateType: 'compare',
          caption: `Inspecting slot [${curr}]: Stored = ${slot.occupied ? slot.key : 'EMPTY'}.`,
          codeLine: 34,
          render: (stage, f) => renderHashStage(stage, f)
        });

        if (!slot.occupied) {
          break; // Empty slot means key was never inserted
        }
        if (slot.key === key) {
          found = true;
          frames.push({
            strategy: 'probing',
            pTable: probeTable,
            activeBucket: curr,
            stateType: 'success',
            caption: `Found key ${key} at slot [${curr}]!`,
            codeLine: 36,
            render: (stage, f) => renderHashStage(stage, f)
          });
          break;
        }
      }

      if (!found) {
        frames.push({
          strategy: 'probing',
          pTable: probeTable,
          activeBucket: -1,
          caption: `Key ${key} does not exist in the hash table.`,
          codeLine: 38,
          render: (stage, f) => renderHashStage(stage, f)
        });
      }
    }

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'hash-code-block'
    });

    function setInitial() {
      const initFrame = {
        strategy: collisionStrategy,
        cTable: chainTable,
        pTable: probeTable,
        activeBucket: -1,
        caption: `Hash table (Table Size M = ${TABLE_SIZE}) ready. Collision method: ${collisionStrategy === 'chaining' ? 'Separate Chaining' : 'Linear Probing'}.`,
        codeLine: null,
        render: (stage, f) => renderHashStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const strategySelect = document.getElementById('select-hash-strategy');
    if (strategySelect) {
      strategySelect.addEventListener('change', (e) => {
        collisionStrategy = e.target.value;
        setInitial();
      });
    }

    const insertBtn = document.getElementById('btn-op-insert');
    const insertKey = document.getElementById('input-insert-key');
    if (insertBtn && insertKey) {
      insertBtn.addEventListener('click', () => {
        const k = parseInt(insertKey.value, 10);
        if (isNaN(k)) return;
        engine.setFrames(buildInsertFrames(k));
        engine.play();
      });
    }

    const searchBtn = document.getElementById('btn-op-search');
    const searchKey = document.getElementById('input-search-key');
    if (searchBtn && searchKey) {
      searchBtn.addEventListener('click', () => {
        const k = parseInt(searchKey.value, 10);
        if (isNaN(k)) return;
        engine.setFrames(buildSearchFrames(k));
        engine.play();
      });
    }

    const randomBtn = document.getElementById('btn-op-random');
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        chainTable = [[], [], [], [], [], [], []];
        probeTable = [];
        for (let i = 0; i < TABLE_SIZE; i++) probeTable.push({ key: null, occupied: false });

        for (let i = 0; i < 4; i++) {
          const rKey = Math.floor(Math.random() * 50) + 1;
          const b = hash(rKey);
          chainTable[b].push(rKey);
          probeTable[b] = { key: rKey, occupied: true };
        }
        setInitial();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
