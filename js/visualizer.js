/**
 * ============================================================================
 * DSA Playground - Reusable Visualizer Engine (visualizer.js)
 * Step-by-step playback, play/pause, speed controls, in-visualizer code trace
 * Zero external libraries, works offline on file:// protocol
 * ============================================================================
 */

(function () {
  'use strict';

  class VisualizerEngine {
    constructor(config = {}) {
      this.stageId = config.stageId || 'viz-stage';
      this.captionId = config.captionId || 'viz-caption-text';
      this.miniCodeId = config.miniCodeId || 'viz-mini-code';
      this.codeBlockId = config.codeBlockId || 'main-code-block';

      this.playBtnId = config.playBtnId || 'btn-play';
      this.stepFwdBtnId = config.stepFwdBtnId || 'btn-step-fwd';
      this.stepBackBtnId = config.stepBackBtnId || 'btn-step-back';
      this.resetBtnId = config.resetBtnId || 'btn-reset';
      this.speedSliderId = config.speedSliderId || 'slider-speed';
      this.codeSyncCheckboxId = config.codeSyncCheckboxId || 'check-code-sync';

      this.frames = [];
      this.currentFrame = 0;
      this.isPlaying = false;
      this.timerId = null;

      this.baseDelay = config.baseDelay || 1000;
      this.speed = 1.0;
      this.codeSyncEnabled = true;

      this.onFrameChange = config.onFrameChange || null;

      this.initDom();
    }

    initDom() {
      this.stageEl = document.getElementById(this.stageId);
      this.captionEl = document.getElementById(this.captionId);
      this.miniCodeEl = document.getElementById(this.miniCodeId);
      this.playBtn = document.getElementById(this.playBtnId);
      this.stepFwdBtn = document.getElementById(this.stepFwdBtnId);
      this.stepBackBtn = document.getElementById(this.stepBackBtnId);
      this.resetBtn = document.getElementById(this.resetBtnId);
      this.speedSlider = document.getElementById(this.speedSliderId);
      this.codeSyncCheckbox = document.getElementById(this.codeSyncCheckboxId);

      if (this.playBtn) {
        this.playBtn.addEventListener('click', () => this.togglePlay());
      }
      if (this.stepFwdBtn) {
        this.stepFwdBtn.addEventListener('click', () => this.stepForward());
      }
      if (this.stepBackBtn) {
        this.stepBackBtn.addEventListener('click', () => this.stepBackward());
      }
      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => this.reset());
      }
      if (this.speedSlider) {
        this.speedSlider.addEventListener('input', (e) => {
          this.setSpeed(parseFloat(e.target.value));
        });
      }
      if (this.codeSyncCheckbox) {
        this.codeSyncCheckbox.checked = this.codeSyncEnabled;
        this.codeSyncCheckbox.addEventListener('change', (e) => {
          this.codeSyncEnabled = e.target.checked;
          if (window.DSAHighlight) {
            window.DSAHighlight.setSyncEnabled(this.codeSyncEnabled);
          }
          if (!this.codeSyncEnabled) {
            if (this.miniCodeEl) this.miniCodeEl.style.display = 'none';
          } else {
            this.renderCurrentFrame();
          }
        });
      }

      this.updateControlsUI();
    }

    setFrames(frames, startAtBeginning = true) {
      this.pause();
      this.frames = frames || [];
      if (startAtBeginning) {
        this.currentFrame = 0;
      } else {
        this.currentFrame = Math.min(this.currentFrame, Math.max(0, this.frames.length - 1));
      }
      this.renderCurrentFrame();
    }

    renderCurrentFrame() {
      if (this.frames.length === 0) {
        if (this.captionEl) this.captionEl.textContent = 'Ready. Select an operation above.';
        if (this.miniCodeEl) this.miniCodeEl.style.display = 'none';
        if (window.DSAHighlight && this.codeBlockId) {
          window.DSAHighlight.clearHighlight(this.codeBlockId);
        }
        this.updateControlsUI();
        return;
      }

      const frame = this.frames[this.currentFrame];
      if (!frame) return;

      // 1. Update caption
      if (this.captionEl && frame.caption !== undefined) {
        this.captionEl.textContent = frame.caption;
      }

      // 2. Call custom frame render function (renders directly into stageEl)
      if (typeof frame.render === 'function') {
        frame.render(this.stageEl, frame);
      }

      // 3. Highlight corresponding C++ code line & mini-pill
      if (this.codeSyncEnabled && window.DSAHighlight && this.codeBlockId) {
        if (frame.codeLine) {
          window.DSAHighlight.highlightLine(this.codeBlockId, frame.codeLine);
          
          // Update in-visualizer mini code badge
          if (this.miniCodeEl) {
            const lineText = window.DSAHighlight.getLineText(this.codeBlockId, frame.codeLine);
            if (lineText) {
              this.miniCodeEl.style.display = 'inline-flex';
              this.miniCodeEl.innerHTML = `<span class="viz-mini-code-tag">C++ Line ${frame.codeLine}:</span> <code>${lineText}</code>`;
            } else {
              this.miniCodeEl.style.display = 'none';
            }
          }
        } else {
          window.DSAHighlight.clearHighlight(this.codeBlockId);
          if (this.miniCodeEl) this.miniCodeEl.style.display = 'none';
        }
      } else {
        if (this.miniCodeEl) this.miniCodeEl.style.display = 'none';
      }

      // 4. Hook callback if provided
      if (this.onFrameChange) {
        this.onFrameChange(this.currentFrame, frame);
      }

      this.updateControlsUI();
    }

    stepForward() {
      if (this.currentFrame < this.frames.length - 1) {
        this.currentFrame++;
        this.renderCurrentFrame();
        return true;
      } else {
        this.pause();
        return false;
      }
    }

    stepBackward() {
      if (this.currentFrame > 0) {
        this.currentFrame--;
        this.renderCurrentFrame();
        return true;
      }
      return false;
    }

    play() {
      if (this.frames.length <= 1) return;
      if (this.currentFrame >= this.frames.length - 1) {
        this.currentFrame = 0;
      }
      this.isPlaying = true;
      this.updateControlsUI();
      this.scheduleNextTick();
    }

    pause() {
      this.isPlaying = false;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      this.updateControlsUI();
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    scheduleNextTick() {
      if (!this.isPlaying) return;
      const delay = Math.max(150, this.baseDelay / this.speed);
      this.timerId = setTimeout(() => {
        if (!this.isPlaying) return;
        const advanced = this.stepForward();
        if (advanced && this.currentFrame < this.frames.length - 1) {
          this.scheduleNextTick();
        } else {
          this.pause();
        }
      }, delay);
    }

    reset() {
      this.pause();
      this.currentFrame = 0;
      this.renderCurrentFrame();
    }

    setSpeed(speedVal) {
      this.speed = Math.max(0.2, Math.min(3.0, speedVal));
      const speedLabel = document.getElementById('speed-value-label');
      if (speedLabel) {
        speedLabel.textContent = `${this.speed.toFixed(1)}x`;
      }
    }

    updateControlsUI() {
      const hasFrames = this.frames.length > 0;
      const isAtStart = this.currentFrame <= 0;
      const isAtEnd = this.currentFrame >= this.frames.length - 1;

      if (this.playBtn) {
        this.playBtn.disabled = !hasFrames || (isAtEnd && !this.isPlaying);
        this.playBtn.innerHTML = this.isPlaying
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Pause`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Play`;
        this.playBtn.setAttribute('aria-label', this.isPlaying ? 'Pause animation' : 'Play animation');
      }

      if (this.stepFwdBtn) {
        this.stepFwdBtn.disabled = !hasFrames || isAtEnd || this.isPlaying;
      }

      if (this.stepBackBtn) {
        this.stepBackBtn.disabled = !hasFrames || isAtStart || this.isPlaying;
      }

      if (this.resetBtn) {
        this.resetBtn.disabled = !hasFrames || (isAtStart && !this.isPlaying);
      }
    }
  }

  window.VisualizerEngine = VisualizerEngine;

})();
