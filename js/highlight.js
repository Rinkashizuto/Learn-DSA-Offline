/**
 * ============================================================================
 * DSA Playground - Custom Offline C++ Syntax Highlighter (highlight.js)
 * Zero external libraries, works offline on file:// protocol
 * Supports token highlighting, line numbers, and visualizer line-linking
 * ============================================================================
 */

(function () {
  'use strict';

  const CPP_KEYWORDS = new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit',
    'atomic_noexcept', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch',
    'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const',
    'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await',
    'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'double',
    'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float',
    'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace',
    'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq',
    'private', 'protected', 'public', 'reflexpr', 'register', 'reinterpret_cast',
    'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
    'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this',
    'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
    'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while',
    'xor', 'xor_eq', 'size_t', 'int32_t', 'int64_t', 'uint32_t', 'uint64_t'
  ]);

  const CPP_TYPES_STL = new Set([
    'vector', 'string', 'queue', 'stack', 'deque', 'map', 'unordered_map',
    'set', 'unordered_set', 'pair', 'tuple', 'list', 'priority_queue',
    'cout', 'cin', 'endl', 'std', 'Node', 'TreeNode', 'ListNode', 'Graph'
  ]);

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightLineCode(line) {
    if (!line.trim()) return '&nbsp;';

    if (/^\s*#\w+/.test(line)) {
      return `<span class="token-preprocessor">${escapeHtml(line)}</span>`;
    }

    if (/^\s*\/\//.test(line)) {
      return `<span class="token-comment">${escapeHtml(line)}</span>`;
    }

    const tokenRegex = /(\/\/.*$)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b)|([^\s\w]+|\s+)/g;

    let html = '';
    let match;

    while ((match = tokenRegex.exec(line)) !== null) {
      const [full, comment, str, ch, num, ident, symbol] = match;

      if (comment) {
        html += `<span class="token-comment">${escapeHtml(comment)}</span>`;
      } else if (str) {
        html += `<span class="token-string">${escapeHtml(str)}</span>`;
      } else if (ch) {
        html += `<span class="token-string">${escapeHtml(ch)}</span>`;
      } else if (num) {
        html += `<span class="token-number">${escapeHtml(num)}</span>`;
      } else if (ident) {
        if (CPP_KEYWORDS.has(ident)) {
          html += `<span class="token-keyword">${escapeHtml(ident)}</span>`;
        } else if (CPP_TYPES_STL.has(ident)) {
          html += `<span class="token-type">${escapeHtml(ident)}</span>`;
        } else {
          const lookahead = line.slice(tokenRegex.lastIndex).trim();
          if (lookahead.startsWith('(')) {
            html += `<span class="token-function">${escapeHtml(ident)}</span>`;
          } else {
            html += escapeHtml(ident);
          }
        }
      } else if (symbol) {
        html += escapeHtml(symbol);
      }
    }

    return html || escapeHtml(line);
  }

  function renderCodeBlock(codeElement, blockId) {
    const rawCode = codeElement.textContent.replace(/^\n+|\n+$/g, '');
    const lines = rawCode.split('\n');

    let containerHtml = '';
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const highlighted = highlightLineCode(lineText);
      containerHtml += `
        <div class="code-line" id="${blockId}-line-${lineNum}" data-line="${lineNum}">
          <span class="code-line-num" aria-hidden="true">${lineNum}</span>
          <span class="code-content">${highlighted}</span>
        </div>`;
    });

    codeElement.innerHTML = containerHtml;
  }

  let isSyncEnabled = true;

  const Highlight = {
    init() {
      const codeBlocks = document.querySelectorAll('pre.code-pre');
      codeBlocks.forEach((block, idx) => {
        const blockId = block.id || `code-block-${idx + 1}`;
        block.id = blockId;
        renderCodeBlock(block, blockId);
      });

      document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.code-copy-btn');
        if (copyBtn) {
          const targetId = copyBtn.getAttribute('data-target');
          const block = document.getElementById(targetId);
          if (block) {
            const lines = block.querySelectorAll('.code-content');
            const codeText = Array.from(lines).map(l => l.textContent).join('\n');

            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(codeText).then(() => {
                const orig = copyBtn.textContent;
                copyBtn.textContent = '✓ Copied!';
                setTimeout(() => { copyBtn.textContent = orig; }, 1800);
              }).catch(() => {
                fallbackCopy(codeText, copyBtn);
              });
            } else {
              fallbackCopy(codeText, copyBtn);
            }
          }
        }
      });
    },

    setSyncEnabled(enabled) {
      isSyncEnabled = Boolean(enabled);
      if (!isSyncEnabled) {
        const activeLines = document.querySelectorAll('.code-line.active-line');
        activeLines.forEach(el => el.classList.remove('active-line'));
      }
    },

    isSyncEnabled() {
      return isSyncEnabled;
    },

    highlightLine(blockId, lineNum) {
      if (!isSyncEnabled) return;
      const block = document.getElementById(blockId);
      if (!block) return;

      // Remove existing active lines
      const prevActive = block.querySelectorAll('.code-line.active-line');
      prevActive.forEach(el => el.classList.remove('active-line'));

      if (lineNum !== null && lineNum !== undefined && lineNum > 0) {
        const targetLine = document.getElementById(`${blockId}-line-${lineNum}`);
        if (targetLine) {
          targetLine.classList.add('active-line');
          // NOTE: Do NOT use targetLine.scrollIntoView() because that scrolls the whole PAGE viewport!
          // We only adjust internal scrollTop of the <pre> tag if the <pre> itself has scrollable overflow.
          const pre = targetLine.closest('pre');
          if (pre && pre.scrollHeight > pre.clientHeight) {
            const lineTop = targetLine.offsetTop - pre.offsetTop;
            if (lineTop < pre.scrollTop || lineTop > pre.scrollTop + pre.clientHeight - 30) {
              pre.scrollTop = Math.max(0, lineTop - pre.clientHeight / 2);
            }
          }
        }
      }
    },

    getLineText(blockId, lineNum) {
      if (!lineNum) return '';
      const targetLine = document.getElementById(`${blockId}-line-${lineNum}`);
      if (!targetLine) return '';
      const content = targetLine.querySelector('.code-content');
      return content ? content.textContent.trim() : '';
    },

    clearHighlight(blockId) {
      const block = document.getElementById(blockId);
      if (!block) return;
      const prevActive = block.querySelectorAll('.code-line.active-line');
      prevActive.forEach(el => el.classList.remove('active-line'));
    }
  };

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    } catch (e) {
      btn.textContent = 'Copy failed';
    }
    document.body.removeChild(ta);
  }

  window.DSAHighlight = Highlight;

  document.addEventListener('DOMContentLoaded', () => {
    Highlight.init();
  });

})();
