/**
 * ============================================================================
 * DSA Playground - Trees & BST Visualizer (js/viz/trees.js)
 * Binary Search Tree Operations: Insert, Search, and In/Pre/Post Traversals
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  // Node representation: { val, left: null|idx, right: null|idx, x, y }
  // We maintain a fixed coordinates layout for levels:
  // Root: level 0 (x: 300, y: 35)
  // Level 1: Left (x: 170, y: 110), Right (x: 430, y: 110)
  // Level 2: (x: 100, y: 195), (x: 230, y: 195), (x: 370, y: 195), (x: 490, y: 195)
  
  let treeNodes = [
    { id: 0, val: 50, x: 300, y: 40, left: 1, right: 2 },
    { id: 1, val: 30, x: 180, y: 115, left: 3, right: 4 },
    { id: 2, val: 70, x: 420, y: 115, left: 5, right: 6 },
    { id: 3, val: 20, x: 110, y: 200, left: null, right: null },
    { id: 4, val: 40, x: 240, y: 200, left: null, right: null },
    { id: 5, val: 60, x: 360, y: 200, left: null, right: null },
    { id: 6, val: 80, x: 480, y: 200, left: null, right: null }
  ];

  let engine = null;

  function renderTreeStage(stageEl, frameData) {
    if (!stageEl) return;
    const { nodes = [], activeNodeId = null, stateType = 'default', activeEdge = null, visited = [] } = frameData;

    let svg = `<svg class="tree-svg" viewBox="0 0 600 250">`;

    // 1. Draw edges first so they sit under the nodes
    nodes.forEach(node => {
      if (node.left !== null) {
        const child = nodes.find(n => n.id === node.left);
        if (child) {
          const isEdgeActive = activeEdge && activeEdge.from === node.id && activeEdge.to === child.id;
          svg += `<line class="tree-edge ${isEdgeActive ? 'edge-active' : ''}" x1="${node.x}" y1="${node.y}" x2="${child.x}" y2="${child.y}" />`;
        }
      }
      if (node.right !== null) {
        const child = nodes.find(n => n.id === node.right);
        if (child) {
          const isEdgeActive = activeEdge && activeEdge.from === node.id && activeEdge.to === child.id;
          svg += `<line class="tree-edge ${isEdgeActive ? 'edge-active' : ''}" x1="${node.x}" y1="${node.y}" x2="${child.x}" y2="${child.y}" />`;
        }
      }
    });

    // 2. Draw nodes
    nodes.forEach(node => {
      const isSelected = activeNodeId === node.id;
      const nodeClass = isSelected ? `node-${stateType}` : (visited.includes(node.val) ? 'node-compare' : 'node-default');

      svg += `
        <g class="tree-node ${nodeClass}">
          <circle cx="${node.x}" cy="${node.y}" r="20" />
          <text x="${node.x}" y="${node.y}">${node.val}</text>
        </g>`;
    });

    svg += '</svg>';

    // 3. Traversal visited order bar if active
    let barHtml = '';
    if (visited && visited.length > 0) {
      barHtml = `
        <div class="viz-traversal-output">
          <span style="font-weight: 700;">Visited Order:</span>
          ${visited.map(v => `<span class="traversal-item">${v}</span>`).join(' → ')}
        </div>`;
    }

    stageEl.innerHTML = `<div class="viz-tree-container">${svg}${barHtml}</div>`;
  }

  /**
   * Search Operation
   */
  function buildSearchFrames(targetVal) {
    const frames = [];
    const nodes = JSON.parse(JSON.stringify(treeNodes));

    frames.push({
      nodes: nodes,
      activeNodeId: 0,
      stateType: 'compare',
      caption: `Starting BST search for ${targetVal} at root node (50).`,
      codeLine: 8,
      render: (stage, f) => renderTreeStage(stage, f)
    });

    let currId = 0;
    let found = false;

    while (currId !== null) {
      const curr = nodes.find(n => n.id === currId);
      if (!curr) break;

      if (curr.val === targetVal) {
        found = true;
        frames.push({
          nodes: nodes,
          activeNodeId: curr.id,
          stateType: 'success',
          caption: `Success! Target ${targetVal} matches node value ${curr.val}. Returning true.`,
          codeLine: 10,
          render: (stage, f) => renderTreeStage(stage, f)
        });
        break;
      }

      if (targetVal < curr.val) {
        const nextId = curr.left;
        frames.push({
          nodes: nodes,
          activeNodeId: curr.id,
          stateType: 'active',
          activeEdge: nextId !== null ? { from: curr.id, to: nextId } : null,
          caption: `${targetVal} < ${curr.val} → BST Rule: Go LEFT.`,
          codeLine: 12,
          render: (stage, f) => renderTreeStage(stage, f)
        });
        currId = nextId;
      } else {
        const nextId = curr.right;
        frames.push({
          nodes: nodes,
          activeNodeId: curr.id,
          stateType: 'active',
          activeEdge: nextId !== null ? { from: curr.id, to: nextId } : null,
          caption: `${targetVal} > ${curr.val} → BST Rule: Go RIGHT.`,
          codeLine: 14,
          render: (stage, f) => renderTreeStage(stage, f)
        });
        currId = nextId;
      }

      if (currId !== null) {
        frames.push({
          nodes: nodes,
          activeNodeId: currId,
          stateType: 'compare',
          caption: `Arrived at child node (${nodes.find(n => n.id === currId).val}).`,
          codeLine: 9,
          render: (stage, f) => renderTreeStage(stage, f)
        });
      }
    }

    if (!found) {
      frames.push({
        nodes: nodes,
        activeNodeId: null,
        caption: `Hit nullptr! Value ${targetVal} does not exist in this BST. O(log n) search ends.`,
        codeLine: 17,
        render: (stage, f) => renderTreeStage(stage, f)
      });
    }

    return frames;
  }

  /**
   * Traversals: In-Order (L, Root, R), Pre-Order (Root, L, R), Post-Order (L, R, Root)
   */
  function buildTraversalFrames(type) {
    const frames = [];
    const nodes = JSON.parse(JSON.stringify(treeNodes));
    const visited = [];

    function traverse(nodeId) {
      if (nodeId === null) return;
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      if (type === 'pre') {
        visited.push(node.val);
        frames.push({
          nodes: nodes,
          activeNodeId: node.id,
          stateType: 'success',
          visited: [...visited],
          caption: `Pre-Order: Visit ROOT (${node.val}) before children.`,
          codeLine: 24,
          render: (stage, f) => renderTreeStage(stage, f)
        });
      }

      // Recurse left
      traverse(node.left);

      if (type === 'in') {
        visited.push(node.val);
        frames.push({
          nodes: nodes,
          activeNodeId: node.id,
          stateType: 'success',
          visited: [...visited],
          caption: `In-Order: Finished left subtree. Visit ROOT (${node.val}). Notice: output is sorted!`,
          codeLine: 28,
          render: (stage, f) => renderTreeStage(stage, f)
        });
      }

      // Recurse right
      traverse(node.right);

      if (type === 'post') {
        visited.push(node.val);
        frames.push({
          nodes: nodes,
          activeNodeId: node.id,
          stateType: 'success',
          visited: [...visited],
          caption: `Post-Order: Finished left & right subtrees. Visit ROOT (${node.val}).`,
          codeLine: 32,
          render: (stage, f) => renderTreeStage(stage, f)
        });
      }
    }

    frames.push({
      nodes: nodes,
      caption: `Starting ${type.toUpperCase()}-ORDER tree traversal at root (50).`,
      codeLine: 22,
      render: (stage, f) => renderTreeStage(stage, f)
    });

    traverse(0);

    frames.push({
      nodes: nodes,
      visited: [...visited],
      caption: `Traversal complete! Total visited: [${visited.join(', ')}].`,
      codeLine: null,
      render: (stage, f) => renderTreeStage(stage, f)
    });

    return frames;
  }

  function init() {
    engine = new window.VisualizerEngine({
      stageId: 'viz-stage',
      captionId: 'viz-caption-text',
      codeBlockId: 'tree-code-block'
    });

    function setInitial() {
      const initFrame = {
        nodes: treeNodes,
        activeNodeId: null,
        caption: `Binary Search Tree (BST) loaded. Rule: Left child < Parent < Right child.`,
        codeLine: null,
        render: (stage, f) => renderTreeStage(stage, f)
      };
      engine.setFrames([initFrame]);
    }

    setInitial();

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

    const inBtn = document.getElementById('btn-op-inorder');
    if (inBtn) {
      inBtn.addEventListener('click', () => {
        engine.setFrames(buildTraversalFrames('in'));
        engine.play();
      });
    }

    const preBtn = document.getElementById('btn-op-preorder');
    if (preBtn) {
      preBtn.addEventListener('click', () => {
        engine.setFrames(buildTraversalFrames('pre'));
        engine.play();
      });
    }

    const postBtn = document.getElementById('btn-op-postorder');
    if (postBtn) {
      postBtn.addEventListener('click', () => {
        engine.setFrames(buildTraversalFrames('post'));
        engine.play();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
