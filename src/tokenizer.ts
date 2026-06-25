import { exhaust } from "./exhaust.ts";
import { createCharset } from "./charset.ts";

type Token =
  | {
      kind: "delimiter";
      value: "(" | ")";
    }
  | {
      kind: "string" | "symbol";
      value: string;
    }
  | {
      kind: "number";
      value: number;
    }
  | {
      kind: "error";
      value: string;
    };

const TAB = 9;
const LF = 10;
const CR = 13;
const SPACE = 32;
const DQUOTE = 34;
const LPAREN = 40;
const RPAREN = 41;
const PLUS = 43;
const HYPHEN_MINUS = 45;
const PERIOD = 46;
const BACKSLASH = 92;

const NON_DELIMITERS = createCharset(`!$%&*+-./:<?=>@^_`); // Borrowed from the Janet language

const space = (c: number) => c === TAB || c === LF || c === CR || c === SPACE;
const delim = (c: number) => space(c) || c === RPAREN || c === LPAREN;

const alpha = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
const digit = (c: number) => c >= 48 && c <= 57;
const nominal = (c: number) => alpha(c) || digit(c) || NON_DELIMITERS.has(c);

const sign = (c: number) => c === PLUS || c === HYPHEN_MINUS;
const radix = (c: number) => c === PERIOD;
const exp = (c: number) => c === 69 || c === 101;
///

function showPos(str: string, pos: number) {
  console.log(str);
  console.log(" ".repeat(pos) + "^");
}

const LIST_BEGIN: Token = {
  kind: "delimiter",
  value: "(",
} as const;

const LIST_END: Token = {
  kind: "delimiter",
  value: ")",
};

type ScanSuccess<T> = {
  nextPos: number;
  value: T;
  error: null;
  ok: true;
};

type ScanError = {
  nextPos: number;
  value: null;
  error: string;
  ok: false;
};

type ScanResult<T> = ScanSuccess<T> | ScanError;
type ScannerState = "start" | "end" | "error";

type State<S extends string> = S | ScannerState;

interface ScannerDef<S extends string, T> {
  next(state: State<S>, char: number): State<S>;
  error(str: string, pos: number): ScanError;
  finish(
    str: string,
    state: State<S>,
    start: number,
    pos: number,
  ): ScanResult<T>;
}

type Scanner<T> = (str: string, start: number) => ScanResult<T>;

function defineScanner<S extends string, T>({
  next,
  error,
  finish,
}: ScannerDef<S, T>): Scanner<T> {
  return function scanner(str: string, start: number) {
    const { length } = str;
    let pos = start;
    let state: State<S> = "start";

    for (; pos < length; pos += 1) {
      const c = str.codePointAt(pos)!;
      state = next(state, c);

      if (state === "error") {
        return error(str, pos);
      }

      if (state === "end") {
        break;
      }
    }

    return finish(str, state, start, pos);
  };
}

const scanNumber = defineScanner({
  next(
    s: "start" | "int" | "dec" | "sci" | "exp" | "end" | "error",
    c: number,
  ) {
    switch (s) {
      case "start":
        if (sign(c) || digit(c)) {
          return "int";
        } else if (radix(c)) {
          return "dec";
        } else if (delim(c)) {
          return "end";
        } else {
          return "error";
        }

      case "int":
        if (digit(c)) {
          return "int";
        } else if (radix(c)) {
          return "dec";
        } else if (delim(c)) {
          return "end";
        } else if (exp(c)) {
          return "sci";
        } else {
          return "error";
        }

      case "dec":
        if (digit(c)) {
          return "dec";
        } else if (delim(c)) {
          return "end";
        } else if (exp(c)) {
          return "sci";
        } else {
          return "error";
        }

      case "sci":
        if (sign(c) || digit(c)) {
          return "exp";
        } else {
          return "error";
        }

      case "exp":
        if (digit(c)) {
          return "exp";
        } else if (delim(c)) {
          return "end";
        } else {
          return "error";
        }
        break;

      case "error":
      case "end":
        return s;

      default:
        exhaust(s);
    }
  },
  error(_, pos) {
    return {
      nextPos: pos,
      value: null,
      error: "No number recognized",
      ok: false,
    };
  },
  finish(str, state, start, pos) {
    const numstr = str.substring(start, pos);
    const value = parseFloat(numstr);

    if (isFinite(value)) {
      return {
        value,
        nextPos: pos,
        ok: true,
        error: null,
      };
    } else {
      return {
        value: null,
        error: `Error parsing numeric value ${value}`,
        ok: false,
        nextPos: pos,
      };
    }
  },
});

const scanString = defineScanner({
  next(s: "start" | "continue" | "escape" | "end" | "error", c) {
    switch (s) {
      case "start":
        if (c === DQUOTE) {
          return "continue";
        } else {
          return "error";
        }

      case "continue":
        if (c === BACKSLASH) {
          return "escape";
        } else if (c === DQUOTE) {
          return "end";
        } else {
          return "continue";
        }

      case "escape":
        return "continue";

      case "end":
      case "error":
        return s;

      default:
        exhaust(s);
    }
  },
  error(_, pos) {
    return {
      nextPos: pos,
      value: null,
      error: "No string recognized",
      ok: false,
    };
  },
  finish(s, state, start, pos) {
    if (state === "end") {
      const value = s.substring(start + 1, pos);

      return {
        nextPos: pos + 1,
        value,
        error: null,
        ok: true,
      };
    } else {
      return {
        nextPos: pos,
        value: null,
        error: "Unexpected end of input",
        ok: false,
      };
    }
  },
});

const scanName = defineScanner({
  next(state: "start" | "continue" | "end" | "error", c) {
    switch (state) {
      case "start":
        // Name can't start with a number
        if (!digit(c) && nominal(c)) {
          return "continue";
        } else {
          return "error";
        }

      case "continue":
        if (nominal(c)) {
          return "continue";
        } else if (delim(c)) {
          return "end";
        } else {
          return "error";
        }

      case "end":
      case "error":
        return state;

      default:
        exhaust(state);
    }
  },
  error(_, pos) {
    return {
      nextPos: pos,
      value: null,
      error: "Invalid character",
      ok: false,
    };
  },
  finish(s, state, start, pos) {
    if (state === "end" || state === "continue") {
      const value = s.substring(start, pos);
      return {
        nextPos: pos,
        value,
        error: null,
        ok: true,
      };
    } else {
      return {
        nextPos: pos,
        value: null,
        error: "Unexpected end of input",
        ok: false,
      };
    }
  },
});

function* tokenize(s: string): Generator<Token> {
  const len = s.length;
  let pos = 0;

  while (pos < len) {
    const c = s.codePointAt(pos)!;

    switch (c) {
      case SPACE:
      case TAB:
      case CR:
      case LF:
        pos += 1;
        break;

      case LPAREN:
        yield LIST_BEGIN;
        pos += 1;
        break;

      case RPAREN:
        yield LIST_END;
        pos += 1;
        break;

      case DQUOTE:
        {
          const { value, nextPos, ok, error } = scanString(s, pos);
          if (ok) {
            yield {
              kind: "string",
              value,
            };
          } else {
            yield {
              kind: "error",
              value: error,
            };
          }
          pos = nextPos;
        }
        break;

      default: {
        {
          const { value, nextPos, ok } = scanNumber(s, pos);
          if (ok) {
            yield {
              kind: "number",
              value,
            };
            pos = nextPos;
          } else {
            const { value, nextPos, ok } = scanName(s, pos);
            if (ok) {
              yield {
                kind: "symbol",
                value,
              };
              pos = nextPos;
            } else {
              yield {
                kind: "error",
                value: "Error",
              };
            }
          }
        }
        break;
      }
    }
  }
}

export { scanNumber, scanString, tokenize };
export type { Token };
