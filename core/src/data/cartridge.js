import log from '../common/log';
import {assert, formatSize} from '../common/utils';
import inesParser from './inesParser';
import sha1 from './sha1';

const parsers = [inesParser];

export function readCartridge(path) {
  log.info(`Reading ROM image from file "${path}"`);
  const data = require('fs').readFileSync(path);
  return createCartridge(new Uint8Array(data));
}

export function createCartridge(data) {
  log.info('Creating cartridge from ROM image');
  assert(data instanceof Uint8Array, 'Invalid data type');

  log.info(`Parsing ${formatSize(data.length)} of data`);
  for (const parser of parsers) {
    if (parser.supports(data)) {
      log.info(`Using "${parser.name}" parser`);
      const cartridge = parser.parse(data);
      computeSHA1(cartridge);
      printInfo(cartridge);
      return cartridge;
    }
  }

  throw new Error('Unsupported data format');
}

function computeSHA1(cartridge) {
  log.info('Computing SHA-1');
  const buffer = new Uint8Array(cartridge.prgROMSize + cartridge.chrROMSize);
  buffer.set(cartridge.prgROM);
  if (cartridge.chrROM) {
    buffer.set(cartridge.chrROM, cartridge.prgROMSize);
  }
  cartridge.sha1 = sha1(buffer);
}

function printInfo(cartridge) {
  log.info('==========[Cartridge Info - Start]==========');
  log.info('SHA-1                 : ' + cartridge.sha1);
  log.info('Mapper                : ' + cartridge.mapper);
  log.info('Submapper             : ' + cartridge.submapper);
  log.info('Region                : ' + cartridge.region);
  log.info('Mirroring             : ' + cartridge.mirroring);
  log.info('PRG ROM size          : ' + formatSize(cartridge.prgROMSize));
  log.info('PRG RAM size          : ' + formatSize(cartridge.prgRAMSize));
  log.info('PRG RAM size (battery): ' + formatSize(cartridge.prgRAMSizeBattery));
  log.info('CHR ROM size          : ' + formatSize(cartridge.chrROMSize));
  log.info('CHR RAM size          : ' + formatSize(cartridge.chrRAMSize));
  log.info('CHR RAM size (battery): ' + formatSize(cartridge.chrRAMSizeBattery));
  log.info('==========[Cartridge Info - End]==========');
}
