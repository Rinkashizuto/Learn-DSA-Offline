/**
 * ============================================================================
 * DSA Playground - Graphs Visualizer (js/viz/graphs.js)
 * Breadth-First Search (BFS) & Depth-First Search (DFS) animations
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  // 6 Vertices with coordinate layout:
  // A (top left), B (top center), C (bottom left), D (top right), E (bottom center), F (bottom right)
  const GRAPH_NODES = [
    { id: 0, label: 'A', x: 120, y: 70 },
    { id: 1, label: 'B', x: 300, y: 70 },
    { id: 2, label: 'C', x: 120, y: 190 },
    { id: 3, label: 'D', x: 480, y: 70 },
    { id: 4, label: 'E', x: 300, y: 190 },
    { id: 5, label: 'F', x: 480, y: 190 }
  ];

  // Undirected Adjacency List
  const ADJ_LIST = {
    0: [1, 2],       // A -> B, C
    1: [0, 3, 4],    // B -> A, D, E
    2: [0, 4, 5],    // C -> A, E, F
    3: [1, 4],       // D -> B, E
    4: [1, 2, 3, 5], // E -> B, C, D, F
    5: [2, 4]        // F -> C, E
  };

  const EDGES = [
    { u: 0, v: 1 }, { u: 0, v: 2 },
    { u: 1, v: 3 }, { u: 1, v: 4 },
    { u: 2, v: 4 }, { u: 2, v: 5 },
    { u: 3, v: 4 }, { u: 4, v: 5 }
  ];

  let engine = null;

  function renderGraphStage(stageEl, frameData) {
    if (!stageEl) return;
    const { activeNode = null, stateType = 'default', activeEdge = null, visited = [], queueOrStack = [], structureName = 'Queue' } = frameData;

    let svg = `<svg class="graph-svg" viewBox="0 0 600 240">`;

    // 1. Draw Edges
    EDGES.forEach(e => {
      const uNode = GRAPH_NODES[e.u];
      const vNode = GRAPH_NODES[e.v];
      const isEdgeActive = activeEdge && (
        (activeEdge.u === e.u && activeEdge.v === e.v) ||
        (activeEdge.u === e.v && activeEdge.v === e.u)
      );

      svg += `<line class="graph-edge ${isEdgeActive ? 'edge-active' : ''}" x1="${uNode.x}" y1="${uNode.y}" x2="${vNode.x}" y2="${vNode.y}" />`;
    });

    // 2. Draw Vertices
    GRAPH_NODES.forEach(node => {
      const isCurrent = activeNode === node.id;
      const isVisited = visited.includes(node.id);
      let nodeClass = 'node-default';

      if (isCurrent) {
        nodeClass = `node-${stateType}`;
      } else if (isVisited) {
        nodeClass = 'node-compare';
      }

      svg += `
        <g class="graph-node ${nodeClass}">
          <circle cx="${node.x}" cy="${node.y}" r="22" />
          <text x="${node.x}" y="${node.y}">${node.label}</text>
        </g>`;
    });

    svg += '</svg>';

    // 3. Status Bar: Visited Sequence & Data Structure state
    let infoHtml = '<div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-top: 10px;">';
    
    // Visited Pill list
    infoHtml += `
      <div class="viz-traversal-output" style="margin-top: 0;">
        <span style="font-weight: 700;">Visited (${visited.length}):</span>
        ${visited.length > 0 
          ? visited.map(id => `<span class="traversal-item">${GRAPH_NODES[id].label}</span>`).join(' → ')
          : '<span style="color: var(--text-muted);">None</span>'}
      </div>`;

    // Queue / Stack state
    infoHtml += `
      <div class="viz-traversal-output" style="margin-top: 0; background: var(--bg-subtle);">
        <span style="font-weight: 700;">${structureName} State:</span>
        <span style="font-family: var(--font-mono); color: var(--accent-primary);">
          [${queueOrStack.map(id => GRAPH_NODES[id].label).join(', ')}]
        </span>
      </div>`;

    infoHtml += '</div>';

    stageEl.innerHTML = `<div class="viz-graph-container">${svg}${infoHtml}</div>`;
  }

  /**
   * Breadth-First Search (BFS) Frames Generator
   */
  function buildBFSFrames(startId = 0) {
    const frames = [];
    const visited = [];
    const visitedSet = new Set();
    const queue = [startId];
    visitedSet.add(startId);

    frames.push({
      activeNode: startId,
      stateType: 'active',
      visited: [],
      queueOrStack: [...queue],
      structureName: 'FIFO Queue',
      caption: `1. Enqueue starting vertex ${GRAPH_NODES[startId].label} and mark it visited.`,
      codeLine: 12,
      render: (stage, f) => renderGraphStage(stage, f)
    });

    while (queue.length > 0) {
      const curr = queue.shift();
      visited.push(curr);

      frames.push({
        activeNode: curr,
        stateType: 'success',
        visited: [...visited],
        queueOrStack: [...queue],
        structureName: 'FIFO Queue',
        caption: `Dequeued vertex ${GRAPH_NODES[curr].label}. Now exploring all its unvisited neighbors.`,
        codeLine: 15,
        render: (stage, f) => renderGraphStage(stage, f)
      });

      const neighbors = ADJ_LIST[curr] || [];
      for (let neighbor of neighbors) {
        if (!visitedSet.has(neighbor)) {
          visitedSet.add(neighbor);
          queue.push(neighbor);

          frames.push({
            activeNode: neighbor,
            stateType: 'active',
            activeEdge: { u: curr, v: neighbor },
            visited: [...visited],
            queueOrStack: [...queue],
            structureName: 'FIFO Queue',
            caption: `Discovered neighbor ${GRAPH_NODES[neighbor].label} via edge (${GRAPH_NODES[curr].label}-${GRAPH_NODES[neighbor].label}). Added to Queue.`,
            codeLine: 18,
            render: (stage, f) => renderGraphStage(stage, f)
          });
        }
      }
    }

    frames.push({
      activeNode: null,
      visited: [...visited],
      queueOrStack: [],
      structureName: 'FIFO Queue',
      caption: `BFS complete! All reachable vertices explored layer-by-layer in O(V + E) time.`,
      codeLine: 21,
      render: (stage, f) => renderGraphStage(stage, f)
    });

    return frames;
  }

  /**
   * Depth-First Search (DFS) Frames Generator
   */
  function buildDFSFrames(startId = 0) {
    const frames = [];
    const visited = [];
    const visitedSet = new Set();
    const stack = [];

    function dfs(u) {
      visitedSet.add(u);
      visited.push(u);
      stack.push(u);

      frames.push({
        activeNode: u,
        stateType: 'success',
        visited: [...visited],
        queueOrStack: [...stack],
        structureName: 'Call Stack',
        caption: `Visited vertex ${GRAPH_NODES[u].label} (pushed to recursion call stack).`,
        codeLine: 28,
        render: (stage, f) => renderGraphStage(stage, f)
      });

      const neighbors = ADJ_LIST[u] || [];
      for (let v of neighbors) {
        if (!visitedSet.has(v)) {
          frames.push({
            activeNode: v,
            stateType: 'active',
            activeEdge: { u: u, v: v },
            visited: [...visited],
            queueOrStack: [...stack],
            structureName: 'Call Stack',
            caption: `Traversing edge (${GRAPH_NODES[u].label}-${GRAPH_NODES[v].label}) deeper into graph.`,
            codeLine: 31,
            render: (stage, f) => renderGraphStage(stage, f)
          });

          dfs(v);

          frames.push({
            activeNode: u,
            stateType: 'compare',
            visited: [...visited],
            queueOrStack: [...stack],
            structureName: 'Call Stack',
            caption: `Backtracked to vertex ${GRAPH_NODES[u].label}. Continuing neighbor scan.`,
            codeLine: 33,
            render: (stage, f) => renderGraphStage(stage, f)
          });
        }
      }

      stack.pop();
    }

    frames.push({
      activeNode: startId,
      stateType: 'active',
      visited: [],
      queueOrStack: [],
      structureName: 'Call Stack',
      caption: `Starting DFS from vertex ${GRAPH_NODES[startId].label}. Plunge deeply down each branch before backtracking.`,
      codeLine: 25,
      render: (stage, f) => renderGraphStage(stage, f)
    });

    dfs(startId);

    frames.push({
      activeNode: null,
      visited: [...visited],
      queueOrStack: [],
      structureName: 'Call Stack',
      caption: `DFS complete! Total vertices visited: [${visited.map(id => GRAPH_NODES[id].label).join(', ')}].`,
      codeLine: 35,
      render: (stage, f) => renderGraphStage(stage, f)
    });

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'graph-code-block'
    });

    function setInitial() {
      const initFrame = {
        activeNode: null,
        visited: [],
        queueOrStack: [],
        structureName: 'Queue/Stack',
        caption: `Undirected Graph with 6 vertices (A-F) and 8 edges ready. Choose BFS or DFS above.`,
        codeLine: null,
        render: (stage, f) => renderGraphStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

    const startSelect = document.getElementById('select-graph-start');
    const bfsBtn = document.getElementById('btn-op-bfs');
    const dfsBtn = document.getElementById('btn-op-dfs');

    function getStartNode() {
      return startSelect ? parseInt(startSelect.value, 10) : 0;
    }

    if (bfsBtn) {
      bfsBtn.addEventListener('click', () => {
        engine.setFrames(buildBFSFrames(getStartNode()));
        engine.play();
      });
    }

    if (dfsBtn) {
      dfsBtn.addEventListener('click', () => {
        engine.setFrames(buildDFSFrames(getStartNode()));
        engine.play();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
