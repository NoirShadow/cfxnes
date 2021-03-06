import log from '../../../core/src/common/log';
import {ports} from './common';

export default class InputRouter {

  constructor(map, devices, video) {
    log.info('Initializing input router');
    this.map = map;
    this.devices = devices;
    this.video = video;
  }

  routeInput(srcInput, value) {
    if (srcInput.source === 'mouse') {
      if (this.video.getOutput() == null) {
        return false; // Ignore mouse inputs when there is no canvas
      }
      if (srcInput.name === 'cursor') {
        this.mouseCursor = value;
        value = this.video.getOutputCoordinates(value[0], value[1]);
        for (const port of ports) {
          this.devices.setRawInput(port, 'zapper', 'beam', value);
        }
        return true;
      }
      if (this.mouseCursor && value) {
        const [x, y] = this.mouseCursor;
        const {top, bottom, left, right} = this.video.getOutputRect();
        if (x < left || x > right || y < top || y > bottom) {
          return false; // Ignore mouse clicks outside canvas
        }
      }
    }
    let processed = false;
    this.map.forEach(srcInput, devInput => {
      const {port, device, name} = devInput;
      this.devices.setRawInput(port, device, name, value);
      processed = true;
    });
    return processed;
  }

}
