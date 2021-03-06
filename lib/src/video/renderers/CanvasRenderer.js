import {VIDEO_WIDTH, VIDEO_HEIGHT} from '../../../../core/src/video/constants';
import {BLACK_COLOR} from '../../../../core/src/video/colors';
import log from '../../../../core/src/common/log';
import {LINEAR} from '../filters';

//=========================================================
// Context
//=========================================================

let auxContext;

function getAuxContext() {
  if (auxContext == null) {
    log.info('Creating auxiliary canvas');
    const canvas = document.createElement('canvas');
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    auxContext = getContext(canvas);
  }
  return auxContext;
}

function getContext(canvas) {
  log.info('Getting 2d canvas context');
  const context = canvas.getContext('2d', {alpha: false});
  if (context == null) {
    throw new Error('Unable to get canvas 2d context');
  }
  return context;
}

//=========================================================
// Renderer
//=========================================================

export default class CanvasRenderer {

  constructor(canvas) {
    this.context = getContext(canvas);
    this.filter = 'pixelated';
    this.scale = 1;
  }

  //=========================================================
  // Frame
  //=========================================================

  createFrame(x, y, width, height) {
    const image = this.context.createImageData(width, height);
    const data = new Uint32Array(image.data.buffer).fill(BLACK_COLOR);
    return {x, y, data, image};
  }

  drawFrame(frame) {
    const context = this.scale !== 1 ? getAuxContext() : this.context;
    context.putImageData(frame.image, frame.x, frame.y);
  }

  //=========================================================
  // Begin / End
  //=========================================================

  begin() {
  }

  end() {
    if (this.scale !== 1) {
      this.applyFilter();
      this.appyScaling();
    }
  }

  //=========================================================
  // Filter
  //=========================================================

  setFilter(filter) {
    this.filter = filter;
  }

  applyFilter() {
    const smoothing = this.filter === LINEAR;
    this.context['imageSmoothingEnabled'] = smoothing;
    this.context['mozImageSmoothingEnabled'] = smoothing;
    this.context['oImageSmoothingEnabled'] = smoothing;
    this.context['msImageSmoothingEnabled'] = smoothing;
  }

  //=========================================================
  // Scaling
  //=========================================================

  setScale(scale) {
    this.scale = scale;
  }

  appyScaling() {
    const src = getAuxContext().canvas;
    const dst = this.context.canvas;
    this.context.drawImage(src, 0, 0, src.width, src.height, 0, 0, dst.width, dst.height);
  }

}
