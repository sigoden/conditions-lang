class InputStream {
  private input: string;
  private pos: number;
  private line: number;
  private column: number;
  constructor(input: string) {
    this.input = input;
    this.pos = 0;
    this.line = 0;
    this.column = 0;
  }
  peek() {
    return this.input.charAt(this.pos);
  }
  next() {
    const ch = this.input.charAt(this.pos++);
    if (ch === "\n") {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }
    return ch;
  }
  eof() {
    return this.peek() === "";
  }
  peekWhile(predicate: (v: string) => boolean) {
    let pos = this.pos;
    let str = "";
    while (!this.eof() && predicate(this.peek())) {
      str += this.next();
    }
    this.pos = pos;
    return str;
  }
  croak(msg: string) {
    return new Error(`${msg} (${this.line}:${this.column})`);
  }
}

export default InputStream;