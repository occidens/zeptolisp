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

const space = (c: number) => c === TAB || c === LF || c === CR || c === SPACE;
const delim = (c: number) => space(c) || c === RPAREN || LPAREN;

const alpha = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
const digit = (c: number) => c >= 48 && c <= 57;
const sign = (c: number) => c === PLUS || c === HYPHEN_MINUS;
const radix = (c: number) => c === PERIOD;
const exp = (c: number) => c === 69 || c === 101;
///

const LIST_BEGIN: Token = {
  kind: "delimiter",
  value: "(",
} as const;

const LIST_END: Token = {
  kind: "delimiter",
  value: ")",
};

// Exhaustiveness check for switch statements
export function exhaust(val: never): never;
export function exhaust(val: any) {
  throw new Error(`Unexpected value ${val}`);
}

type ScanResult = {
  pos: number;
  ok: boolean;
};

function delimit(s: string, start: number, delim: Array<number>): number {
  const len = s.length;
  let pos = start + 1;
  let esc = false;

  const pred = (x: number) => delim.includes(x);

  for (; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;

    if (pred(c) && !esc) break;
    if (c === BACKSLASH) {
      esc = true;
    } else if (esc) {
      esc = false;
    }
  }

  return pos;
}

// type ScanStates = "start" | "end" | "error";

function scanString(s: string, start: number): ScanResult {
  const len = s.length;
  let pos = start;
  let state: "start" | "continue" | "escape" | "end" | "error" = "start";

  scan: for (; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;

    switch (state) {
      case "start":
        if (c === DQUOTE) {
          state = "continue";
        } else {
          state = "error";
        }
        break;

      case "continue":
        if (c === BACKSLASH) {
          state = "escape";
        } else if (c === DQUOTE) {
          state = "end";
        } else {
          state = "error";
        }
        break;

      case "escape":
        state = "continue";
        break;

      case "end":
      case "error":
        break scan;

      default:
        exhaust(state);
    }
  }
  return {
    pos: state === "end" ? pos - 1 : pos,
    ok: state === "end" // not valid unless we parsed closing quote
  }
}

function scanNumber(s: string, start: number): ScanResult {
  const len = s.length;
  let pos = start;
  let state: "start" | "int" | "dec" | "sci" | "exp" | "end" | "error" =
    "start";

  scan: for (; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;

    switch (state) {
      case "start":
        if (sign(c) || digit(c)) {
          state = "int";
        } else if (delim(c)) {
          state = "end";
        } else {
          state = "error";
        }
        break;

      case "int":
        if (digit(c)) {
          state = "int";
        } else if (radix(c)) {
          state = "dec";
        } else if (delim(c)) {
          state = "end";
        } else if (exp(c)) {
          state = "sci";
        } else {
          state = "error";
        }
        break;

      case "dec":
        if (digit(c)) {
          state = "dec";
        } else if (delim(c)) {
          state = "end";
        } else if (exp(c)) {
          state = "sci";
        }
        break;

      case "sci":
        if (sign(c) || digit(c)) {
          state = "exp";
        } else {
          state = "error";
        }
        break;

      case "exp":
        if (digit(c)) {
          state = "exp";
        } else if (delim(c)) {
          state = "end";
        } else {
          state = "error";
        }
        break;

      case "error":
      case "end":
        break scan;

      default:
        exhaust(state);
    }
  }
  return {
    pos: state === "end" ? pos - 1 : pos,
    ok: state !== "error",
  };
}

function scanName(s: string, start: number): ScanResult {
  const len = s.length;
  let pos = start;
  let state: "start" | "continue" | "end" | "error" = "start";

  scan: for (; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;
    switch (state) {
      case "start":
        if (alpha(c)) {
          state = "continue";
        } else {
          state = "error";
        }
        break;

      case "continue":
        if (alpha(c) || digit(c)) {
          state = "continue";
        } else if (delim(c)) {
          state = "end";
        } else {
          state = "error";
        }
        break;

      case "end":
      case "error":
        break scan;
      default:
        exhaust(state);
    }
  }

  return {
    pos: state === "end" ? pos - 1 : pos,
    ok: state !== "error",
  };
}

function* tokenize(s: string): Generator<Token> {
  const len = s.length;

  let run = -1;

  for (let pos = 0; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;

    switch (c) {
      case SPACE:
      case TAB:
      case CR:
      case LF:
        continue;

      case LPAREN:
        yield LIST_BEGIN;
        continue;

      case RPAREN:
        yield LIST_END;
        continue;

      case DQUOTE:
        {
          const end = delimit(s, pos, [DQUOTE]);
          const value = s.substring(pos + 1, end);

          yield {
            kind: "string",
            value,
          };

          pos = end;
        }
        continue;

      default: {
        const name = scanName(s, pos);
        if (name.ok) {
          yield {
            kind: "symbol",
            value: s.substring(pos, name.pos),
          };
        } else {
          const num = scanNumber(s, pos);
          if (num.ok) {
            yield {
              kind: "number",
              value: parseFloat(s.substring(pos, num.pos)),
            };
          } else {
            yield {
              kind: "error",
              value: "Error",
            };
          }
        }
      }
    }

    if (alpha(c)) {
      const end = delimit(s, pos, [SPACE, RPAREN, LPAREN]) - 1;
      const value = s.substring(pos, end);

      yield {
        kind: "atom",
        value,
      };

      pos = end;
      continue;
    }

    yield {
      kind: "error",
      value: "err",
    };
  }
}

export { tokenize };
export type { Token };
