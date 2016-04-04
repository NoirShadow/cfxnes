// jscs:disable disallowQuotedKeysInObjects, requireCapitalizedConstructors

import CanvasRenderer from '../renderers/CanvasRenderer';
import WebGLRenderer from '../renderers/WebGLRenderer';
import logger from '../../../core/src/utils/logger';

const FALLBACK = 'canvas';

const renderers = {
  'canvas': CanvasRenderer,
  'webgl': WebGLRenderer,
};

//=========================================================
// Factory for renderer creation
//=========================================================

export default class RendererFactory {

  isRendererSupported(id) {
    var clazz = renderers[id];
    return clazz && clazz['isSupported'](); // jscs:ignore requireDotNotation
  }

  createRenderer(id, canvas) {
    var clazz = renderers[id];
    if (clazz) {
      try {
        return new clazz(canvas);
      } catch (error) {
        logger.error(`Error during creation of renderer "${id}"`, error);
      }
    } else {
      logger.warn(`Unsupported renderer "${id}"`);
    }
    logger.info(`Creating "${FALLBACK}" renderer as fallback`);
    return new renderers[FALLBACK](canvas);
  }

}