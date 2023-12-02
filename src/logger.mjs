import { writeFile } from "node:fs/promises";

const LOG_FILE_NAME = 'log.txt';
const SAVE_MS = 2000;

let data = '';
let isDirty = false;

const timer = setInterval(async () => {
    if (!isDirty) return;
    await writeFile(LOG_FILE_NAME, data);
    isDirty = false;
}, SAVE_MS);

export function inbound(msg) {
    data += `>> ${msg}\n`;
    isDirty = true;
}

export function outbound(msg) {
    data += `<< ${msg}\n`;
    isDirty = true;
}

export function loggingDone() {
    clearInterval(timer);
}
