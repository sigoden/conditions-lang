import InputStream from "./InputSream";

class TokenStream {
  private input: InputStream;
  private current: Tok | null;
  constructor(input: string) {
    this.input = new InputStream(input);
    this.current = null;
  }

  private readWhile(predicate: (v: string) => boolean): string {
    let str = "";
    while (!this.input.eof() && predicate(this.input.peek())) {
      str += this.input.next();
    }
    return str;
  }

  private readString(ch: string): Tok {
    return { type: "str", value: this.readEscape(ch) };
  }

  private readLineBreak(): string {
    let str = "";
    const ch = this.input.peek();
    if (ch === "\n" || ch === "\r\n") {
      this.input.next();
      str += ch + this.readWhile(isWhitespace);
    } else {
      this.input.croak("Invalid line break")
    }
    return str;
  }

  private readEscape(ch_qoute: string): string {
    let escaped = false;
    let str = "";
    this.input.next();
    while (!this.input.eof()) {
      const ch = this.input.next();
      if (escaped) {
        str += ch
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === ch_qoute) {
        break;
      } else {
        str += ch;
      }
    }
    return str;
  }

  private readIdentLike(): Tok {
    const id = this.readWhile(isId);
    const idLw = id.toLowerCase();
    switch (idLw) {
      case "in":
      case "or":
      case "and":
        return { type: "op", value: idLw };
      case "is":
        this.readWhile(isWhitespace);
        const nextId = this.input.peekWhile(isId).toLowerCase();
        if (nextId === "not") {
          this.readWhile(isId);
          return { type: "op", value: "isnot" };
        }
        return { type: "op", value: "is" };
      case "not":
        this.readWhile(isWhitespace);
        const nextId2 = this.input.peekWhile(isId).toLowerCase();
        if (nextId2 === "in") {
          this.readWhile(isId);
          return { type: "op", value: "notin" };
        }
        return { type: "op", value: "not" };
      default:
        if (isKeyworld(id)) {
          return { type: "kw", value: id.toLowerCase() };
        }
        return { type: "var", value: id };
    }
  }

  private readOp(): Tok {
    const op = this.readWhile(isOpChar);
    switch (op) {
      case "&&":
        return { type: "op", value: "and" }
      case "||":
        return { type: "op", value: "or" }
      case "==":
      case "=":
        return { type: "op", value: "eq" }
      case "!=":
        return { type: "op", value: "noteq" }
      case "~=":
      case "=~":
        return { type: "op", value: "match" }
      case "!~":
        return { type: "op", value: "notmatch" }
      default:
        throw this.input.croak(`Invalid op {op}`);
    }
  }


  private readNext(): Tok {
    this.readWhile(isWhitespace);
    if (this.input.eof()) return { type: "eof", value: "" };
    const ch = this.input.peek();
    if (ch === "\\") this.readLineBreak();
    if (ch === '"' || ch === "'") return this.readString(ch);
    if (isIdStart(ch)) return this.readIdentLike();
    if (isPunc(ch)) return { type: "punc", value: this.input.next() };
    if (isOpChar(ch)) return this.readOp();
    if (ch === "/") {
      return { type: "str", value: this.readWhile(ch => !isWhitespace(ch)) }
    }
    return { type: "str", value: this.readWhile(ch => !isWhitespace(ch) && !isPunc(ch)) }
  }

  peek(): Tok {
    return this.current || (this.current = this.readNext());
  }
  next(): Tok {
    let tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }
  eof(): boolean {
    return this.peek() == null;
  }
  croak(msg: string) {
    return this.input.croak(msg)
  }
}

const KEYWORLDS = [
  "true",
  "false",
  "present",
  "blank",
]

function isKeyworld(x: string) {
  return KEYWORLDS.indexOf(x.toLowerCase()) > -1;
}

function isWhitespace(ch: string): boolean {
  return " \t".indexOf(ch) >= 0;
}

function isIdStart(ch: string): boolean {
  return /[a-z_]/i.test(ch);
}

function isId(ch: string): boolean {
  return isIdStart(ch) || "-0123456789".indexOf(ch) > -1;
}

function isPunc(ch: string): boolean {
  return ",()".indexOf(ch) >= 0;
}

function isOpChar(ch: string) {
  return "=~&|!".indexOf(ch) >= 0;
}


export interface Tok {
  type: "kw" | "var" | "str" | "regex" | "op" | "punc" | "eof";
  value: string;
}

export default TokenStream;