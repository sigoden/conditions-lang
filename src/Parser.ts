import TokenStream, { Tok } from "./TokenStream";
import { Ast, Operator } from "./ast";

class Parser {
  private input: TokenStream;
  constructor(input: string) {
    this.input = new TokenStream(input);
  }

  private isPunc(ch?: string): Tok | false {
    const tok = this.input.peek();
    return tok && tok.type === "punc" && (!ch || tok.value === ch) && tok;
  }

  private isKw(kw?: string): Tok | false {
    const tok = this.input.peek();
    return tok && tok.type === "kw" && (!kw || tok.value === kw) && tok;
  }

  private isOp(op?: string): Tok | false {
    const tok = this.input.peek();
    return tok && tok.type === "op" && (!op || tok.value === op) && tok;
  }

  private skipPunc(ch?: string) {
    if (this.isPunc(ch)) this.input.next();
    this.input.croak("Expecting punctuation: \"" + ch + "\"");
  }

  private unexpected() {
    return this.input.croak("Unexpected token: " + JSON.stringify(this.input.peek()));
  }

  private maybeBinary(left: Ast, myPrec: number): Ast {
    const tok = this.isOp();
    if (tok) {
      const hisPrec = PRECEDENCES[tok.value];
      if (hisPrec > myPrec) {
        this.input.next();
        switch (tok.value) {
          case "is":
          case "isnot":
            const right1 = this.parseAtom();
            if (right1.type !== "present") {
              throw this.input.croak(`Invalid binary op ${tok.value}`);
            }
            return { type: "binary", operator: tok.value as Operator, left, right: right1 };
          case "in":
          case "notin":
            const right2 = this.parseList();
            return { type: "binary", operator: tok.value as Operator, left, right: right2 };
          default:
            return this.maybeBinary({
              type: "binary",
              operator: tok.value as Operator,
              left,
              right: this.maybeBinary(this.parseAtom(), hisPrec),
            }, myPrec);
        }
      }
    }
    return left;
  }

  private delimated(start: string, stop: string, sep: string, parser: () => Ast): Array<Ast> {
    const list = [];
    let first = true;
    this.skipPunc(start);
    while (!this.input.eof()) {
      if (this.isPunc(stop)) break;
      if (first) { first = false; } else { this.skipPunc(sep); }
      if (this.isPunc(stop)) break;
      list.push(parser());
    }
    this.skipPunc(stop);
    return list;
  }

  private parseList(): Ast {
    return {
      type: "list",
      value: this.delimated("(", ")", ",", this.parse.bind(this))
    }
  }

  private parseCall(func: string): Ast {
    return {
      type: "call",
      func: func,
      args: this.parseList(),
    }
  }

  private parseBool(): Ast {
    return {
      type: "bool",
      value: this.input.next().value === "true",
    }
  }

  private parsePresent(): Ast {
    return {
      type: "present",
      value: this.input.next().value === "present",
    }
  }

  private maybeCall(expr: () => Ast): Ast {
    const v = expr()
    if (this.isPunc("(")) {
      if (v.type !== "var") {
        this.input.croak("Expecting function name");
      } else {
        return this.parseCall(v.value);
      }
    }
    return v;
  }

  private parseAtom(): Ast {
    return this.maybeCall(() => {
      if (this.isPunc("(")) {
        this.input.next();
        let expr = this.parse();
        this.skipPunc(")");
        return expr;
      }
      if (this.isKw("true") || this.isKw("false")) return this.parseBool();
      if (this.isKw("present") || this.isKw("blank")) return this.parsePresent();
      const tok = this.input.next();
      if (tok.type == "op" && tok.value == "not") {
        return {
          type: "unary",
          operator: "not",
          value: this.maybeBinary(this.parseAtom(), PRECEDENCES["not"])
        }
      }
      if (["var", "str", "regex"].indexOf(tok.type) > - 1) {
        return { type: tok.type, value: tok.value } as Ast;
      }
      throw this.unexpected();
    })
  }

  parse(): Ast {
    const expr =  this.maybeCall(() => {
      return this.maybeBinary(this.parseAtom(), 0);
    });
    const tok = this.input.peek();
    if (tok.type === "eof") {
      return expr;
    }
    return this.maybeBinary(expr, 0);
  }
}

const PRECEDENCES: { [k in string]: number } = {
  "or": 1,
  "and": 2,
  "not": 3,

  "is": 4,
  "isnot": 4,
  "in": 4,
  "notin": 4,
  "eq": 4,
  "noteq": 4,
  "match": 4,
  "notmatch": 4,
}

export default Parser;