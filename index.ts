// function parseForm(s: string) {
//     const len = s.length;
//     const pos = 0;

//     while (pos < len) {

//     }
// }

// Modes needed:
// base
// parsing string
// parsing atom

type Interval = [number, number];

const LF = 10;
const CR = 13;
const SPACE = 32;
const TAB = 9;
const DQUOTE = 34;
const LPAREN = 40;
const RPAREN = 41;
const BACKSLASH = 92;

const space = (c: number) => c === 9 || c === 10 || c === 13 || c === 32;
const alpha = (c: number) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
const digit = (c: number) => c >= 48 && c <= 57;

// Token
const LIST_BEGIN = Symbol();
const LIST_END = Symbol();
const ERR = Symbol();

type Token =
    | typeof LIST_BEGIN
    | typeof LIST_END
    | typeof ERR
    | symbol
    | string
    | number;

function delimit(s: string, start: number, delim: number = DQUOTE): number {
    const len = s.length;
    let pos = start;
    let esc = false;

    for (; pos < len; pos += 1){
        const c = s.codePointAt(pos);

        if (c === DQUOTE && !esc) break;
        if (c === BACKSLASH) {
            esc = true;
        } else if (esc) {
            esc = false;
        }
    }

    return pos;
}


function* tokens(s: string) {
  const len = s.length;

  let run = -1;

  for (let pos = 0; pos < len; pos += 1) {
    const c = s.codePointAt(pos)!;

    if (space(c)) {
        continue;
    }

    if (c === LPAREN) {
      yield LIST_BEGIN;
      continue;
    }

    if (c === RPAREN) {
        yield LIST_END;
        continue;
    }

    if (c === DQUOTE) {
        const end = delimit(s, pos, DQUOTE);
        yield s.substring(pos + 1, end);
        pos = end;
        continue;
    }

    if (alpha(c)) {
        const end = delimit(s, pos, /* whitespace */);

    }
  }
}
