// https://raw.githubusercontent.com/jorgebucaran/colorette/main/index.js

// reordered colors so they're easy to use
// expose hasColors in interface

import * as tty from "tty"

const {
    env = {},
    argv = [],
    platform = "",
} = typeof process === "undefined" ? {} : process;

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color")
const isForced = "FORCE_COLOR" in env || argv.includes("--color")
const isWindows = platform === "win32"
const isDumbTerminal = env.TERM === "dumb"

const isCompatibleTerminal =
    tty && tty.isatty && tty.isatty(1) && env.TERM && !isDumbTerminal

const isCI =
    "CI" in env &&
    ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env || "NODE_TEST_CONTEXT" in env) // TODO last is new

export const isColorSupported =
    !isDisabled &&
    (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI)

const replaceClose = (
    index,
    string,
    close,
    replace,
    head = string.substring(0, index) + replace,
    tail = string.substring(index + close.length),
    next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace))

const clearBleed = (index, string, open, close, replace) =>
    index < 0
        ? open + string + close
        : open + replaceClose(index, string, close, replace) + close

const filterEmpty =
    (open, close, replace = open, at = open.length + 1) =>
        (string) =>
            string || !(string === "" || string === undefined)
                ? clearBleed(
                    ("" + string).indexOf(close, at),
                    string,
                    open,
                    close,
                    replace
                )
                : ""

const init = (open, close, replace) =>
    filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace)

const colors = {
    hasColors: true, // TODO NEW
    reset: init(0, 0),
    bold: init(1, 22, "\x1b[22m\x1b[1m"),
    dim: init(2, 22, "\x1b[22m\x1b[2m"),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49),
    blackBright: init(90, 39),
    redBright: init(91, 39),
    greenBright: init(92, 39),
    yellowBright: init(93, 39),
    blueBright: init(94, 39),
    magentaBright: init(95, 39),
    cyanBright: init(96, 39),
    whiteBright: init(97, 39),
    bgBlackBright: init(100, 49),
    bgRedBright: init(101, 49),
    bgGreenBright: init(102, 49),
    bgYellowBright: init(103, 49),
    bgBlueBright: init(104, 49),
    bgMagentaBright: init(105, 49),
    bgCyanBright: init(106, 49),
    bgWhiteBright: init(107, 49),
}

const nonColors = Object.keys(colors).reduce(
    (colors, key) => ({ ...colors, [key]: String }),
    {}
);
nonColors.hasColors = false;

export const createColors = ({ useColor = isColorSupported } = {}) =>
    useColor ? colors : nonColors;

// TODO NEW
export const pc = createColors({
    useColor: isColorSupported
});

export const {
    reset,
    bold,
    dim,
    italic,
    underline,
    inverse,
    hidden,
    strikethrough,

    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    gray,

    blackBright,
    redBright,
    greenBright,
    yellowBright,
    blueBright,
    magentaBright,
    cyanBright,
    whiteBright,

    bgBlack,
    bgRed,
    bgGreen,
    bgYellow,
    bgBlue,
    bgMagenta,
    bgCyan,
    bgWhite,

    bgBlackBright,
    bgRedBright,
    bgGreenBright,
    bgYellowBright,
    bgBlueBright,
    bgMagentaBright,
    bgCyanBright,
    bgWhiteBright,
} = createColors();
