import { createWriteStream } from 'fs'

const tty = createWriteStream('/dev/tty');

export const log = (...args) => {
  const args2 = args.map(o => {
    try {
      return JSON.stringify(o)
    } catch (_) {
      return o.toString();
    }
  });
  return tty.write(args.join(' ') + '\n');
}
