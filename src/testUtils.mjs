/* import { createWriteStream } from 'fs';

const tty = createWriteStream('/dev/tty');

export const log = (...args) => {
  const args2 = args.map(o => {
    if (typeof o === 'string') return o;
    try {
      return JSON.stringify(o);
    } catch (_) {
      return o.toString();
    }
  });
  return tty.write(args2.join(' ') + '\n');
  //return tty.write(args2.join(',\n...') + '\n');
}
 */

export const log = (...args) => {
    console.log(...args);
}
