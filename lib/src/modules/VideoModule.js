import logger from '../../../core/src/utils/logger';
import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../core/src/common/constants';
import {copyProperties} from '../../../core/src/utils/objects';

var fullscreenStyle = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  left: '0',
  margin: 'auto',
  width: 'auto',
  height: 'auto',
};

//=========================================================
// Video module
//=========================================================

export default class VideoModule {

  constructor() {
    this.dependencies = ['nes', 'rendererFactory', 'paletteFactory', 'screenfull'];
  }

  inject(nes, rendererFactory, paletteFactory, screenfull) {
    logger.info('Initializing video module');
    this.nes = nes;
    this.rendererFactory = rendererFactory;
    this.paletteFactory = paletteFactory;
    this.screenfull = screenfull;
    this.initListeners();
    this.initOptions();
  }

  initListeners() {
    if (this.screenfull) {
      document.addEventListener(this.screenfull.raw.fullscreenchange, () => this.onFullscreenChange());
    }
    window.addEventListener('deviceorientation',  () => this.onResolutionChange());
    window.addEventListener('resize',  () => this.onResolutionChange());
  }

  initOptions() {
    this.options = [
      {name: 'videoRenderer',  get: this.getRenderer,       set: this.setRenderer,       def: 'webgl'},
      {name: 'videoPalette',   get: this.getPalette,        set: this.setPalette,        def: 'fceux'},
      {name: 'videoScale',     get: this.getScale,          set: this.setScale,          def: 1},
      {name: 'videoSmoothing', get: this.isSmoothing,       set: this.setSmoothing,      def: false},
      {name: 'videoDebugging', get: this.isDebugging,       set: this.setDebugging,      def: false},
      {name: 'fullscreenType', get: this.getFullscreenType, set: this.setFullscreenType, def: 'maximized'},
    ];
  }

  //=========================================================
  // Canvas
  //=========================================================

  setCanvas(canvas) {
    logger.info(`Setting video output to ${canvas}`);
    this.canvas = canvas;
    if (this.canvas) {
      this.createRenderer();
      this.updateRenderer();
      this.updateCanvasSize();
      this.updateCanvasStyle();
      this.drawFrame();
    }
  }

  getCanvas() {
    return this.canvas;
  }

  updateCanvasSize() {
    this.canvas.width = this.getTargetScale() * VIDEO_WIDTH * this.getWidthMultiplier();
    this.canvas.height = this.getTargetScale() * VIDEO_HEIGHT;
  }

  updateCanvasStyle() {
    var style = this.canvas.style;
    if (this.isFullscreen()) {
      copyProperties(fullscreenStyle, style);
      if (this.fullscreenType != 'normalized') {
        style.width = '100%';
        style.height = '100%';
        if (this.fullscreenType != 'stretched') {
          var ratio = this.canvas.width / this.canvas.height;
          if (screen.height * ratio > screen.width) {
            style.height = 'auto';
          } else {
            style.width = 'auto';
          }
        }
      }
    } else {
      for (var property of Object.keys(fullscreenStyle)) {
        style.removeProperty(property);
      }
    }
  }

  getOutputRect() {
    if (this.canvas) {
      var rect = this.getCanvasRect();
      if (this.debugging) {
        rect.right -= (rect.right - rect.left) / 2; // Without debugging output
      }
      return rect;
    } else {
      return this.getEmptyRect();
    }
  }

  getCanvasRect() {
    var rect = this.canvas.getBoundingClientRect(); // Read-only, we need a writable copy
    return {top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left};
  }

  getEmptyRect() {
    return {top: -1, right: -1, bottom: -1, left: -1};
  }

  onResolutionChange() {
    if (this.canvas) {
      this.updateRenderer();
      this.updateCanvasSize();
      this.updateCanvasStyle();
      this.drawFrame();
    }
  }

  //=========================================================
  // Renderering
  //=========================================================

  isRendererSupported(id) {
    return this.rendererFactory.isRendererSupported(id);
  }

  setRenderer(id) {
    if (this.rendererId !== id) {
      logger.info(`Using "${id}" video renderer`);
      this.rendererId = id;
      if (this.canvas) {
        this.createRenderer();
        this.updateRenderer();
      }
    }
  }

  getRenderer() {
    return this.rendererId;
  }

  createRenderer() {
    this.renderer = this.rendererFactory.createRenderer(this.rendererId, this.canvas);
    this.frame = this.renderer.createFrame(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    this.debugFrame = this.renderer.createFrame(VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  }

  updateRenderer() {
    this.renderer.setSmoothing(this.smoothing);
    this.renderer.setScale(this.getTargetScale());
  }

  renderFrame() {
    this.nes.renderFrame(this.frame.data);
    if (this.debugging) {
      this.nes.renderDebugFrame(this.debugFrame.data);
    }
  }

  drawFrame() {
    this.renderer.begin();
    this.renderer.drawFrame(this.frame);
    if (this.debugging) {
      this.renderer.drawFrame(this.debugFrame);
    }
    this.renderer.end();
  }

  //=========================================================
  // Palette
  //=========================================================

  setPalette(id) {
    if (this.paletteId !== id) {
      logger.info(`Setting video palette to "${id}"`);
      this.paletteId = id;
      this.nes.setPalette(this.paletteFactory.createPalette(id));
      if (this.canvas) {
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  getPalette() {
    return this.paletteId;
  }

 //=========================================================
  // Scale
  //=========================================================

  setScale(scale) {
    if (this.scale !== scale) {
      logger.info(`Setting video scale to ${scale}`);
      this.scale = scale;
      if (this.canvas) {
        this.updateRenderer();
        this.updateCanvasSize();
        this.updateCanvasStyle();
        this.drawFrame();
      }
    }
  }

  getScale() {
    return this.scale;
  }

  getTargetScale() {
    if (this.isFullscreen()) {
      var maxScale = this.getMaxScale();
      return maxScale > 1 ? ~~maxScale : maxScale;
    }
    return this.scale;
  }

  getMaxScale() {
    var maxHorizontalScale = screen.width / (VIDEO_WIDTH * this.getWidthMultiplier());
    var maxVerticalScale = screen.height / VIDEO_HEIGHT;
    return Math.min(maxHorizontalScale, maxVerticalScale);
  }

  //=========================================================
  // Smoothing
  //=========================================================

  setSmoothing(enabled) {
    if (this.smoothing !== enabled) {
      logger.info(`Setting video smoothing to ${enabled ? 'on' : 'off'}`);
      this.smoothing = enabled;
      if (this.canvas) {
        this.updateRenderer();
        this.drawFrame();
      }
    }
  }

  isSmoothing() {
    return this.smoothing;
  }

  //=========================================================
  // Debugging output
  //=========================================================

  setDebugging(enabled) {
    if (this.debugging !== enabled) {
      logger.info(`Setting video debugging to ${enabled ? 'on' : 'off'}`);
      this.debugging = enabled;
      if (this.canvas) {
        this.updateRenderer();
        this.updateCanvasSize();
        this.updateCanvasStyle();
        this.renderFrame();
        this.drawFrame();
      }
    }
  }

  isDebugging() {
    return this.debugging;
  }

  getWidthMultiplier() {
    return this.debugging ? 2 : 1;
  }

  //=========================================================
  // Full screen mode
  //=========================================================

  setFullscreen(fullscreen) {
    if (fullscreen) {
      this.enterFullscreen();
    } else {
      this.leaveFullscreen();
    }
  }

  enterFullscreen() {
    this.checkScreenfullAvailable();
    if (this.screenfull.enabled && !this.isFullscreen()) {
      logger.info('Entering fullscreen');
      this.screenfull.request(this.canvas.parentElement);
    }
  }

  leaveFullscreen() {
    this.checkScreenfullAvailable();
    if (this.screenfull.enabled && this.isFullscreen()) {
      logger.info('Leaving fullscreen');
      this.screenfull.exit();
    }
  }

  onFullscreenChange() {
    logger.info(`Fullscreen ${this.isFullscreen() ? 'enabled' : 'disabled'}`);
    this.updateRenderer();
    this.updateCanvasSize();
    this.updateCanvasStyle();
    this.drawFrame();
  }

  isFullscreen() {
    return this.screenfull && this.screenfull.isFullscreen;
  }

  setFullscreenType(type) {
    if (this.fullscreenType !== type) {
      logger.info(`Setting fullsreen type to "${type}"`);
      this.fullscreenType = type;
      if (this.canvas) {
        this.updateCanvasStyle();
      }
    }
  }

  getFullscreenType() {
    return this.fullscreenType;
  }

  checkScreenfullAvailable() {
    if (this.screenfull == null) {
      throw new Error('Unable to switch fullscreen: screenfull library is not available.');
    }
  }

}