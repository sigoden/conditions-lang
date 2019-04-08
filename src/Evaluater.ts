import { Ast, Binary, List } from "./ast";

export interface Vars {
  [k: string]: string;
}

export interface Funcs {
  [k: string]: Function;
}

class Evaluater {
  private vars: Vars;
  private funcs: Funcs;
  constructor(vars: Vars, funcs: Funcs) {
    this.vars = vars;
    this.funcs = funcs;
  }
  eval(ast: Ast) {
    return !!this.evalUtil(ast);
  }
  private evalUtil(ast: Ast, strict = false) {
    switch (ast.type) {
      case "bool":
      case "present":
      case "str":
        return ast.value;
      case "call":
        const fn = this.funcs[ast.func];
        if (typeof fn !== "function") {
          throw new Error(`Not found func ${ast.func}`);
        }
        const args = this.evalUtil(ast.args);
        return fn(args);
      case "unary":
        if (ast.operator === "not") {
          return !this.evalUtil(ast.value);
        }
      case "var":
        const v = this.vars[ast.value];
        if (typeof v === "undefined") {
          if (strict) {
            return v;
          }
          return String(ast.value);
        }
        return v;
      case "binary":
        return this.evalBinary(ast);
      case "list":
        return ast.value.map(v => this.evalUtil(v))
    }
  }
  private evalBinary(ast: Binary): boolean {
    switch (ast.operator) {
      case "and":
        return this.evalUtil(ast.left) && this.evalUtil(ast.right);
      case "or":
        return this.evalUtil(ast.left) || this.evalUtil(ast.right);
      case "eq":
        return this.evalUtil(ast.left) == this.evalUtil(ast.right);
      case "noteq":
        return this.evalUtil(ast.left) != this.evalUtil(ast.right);
      case "in":
        const v1 = this.evalUtil(ast.left);
        return (ast.right as List).value.some(v => this.evalUtil(v) == v1);
      case "notin":
        const v2 = this.evalUtil(ast.left);
        return (ast.right as List).value.every(v => this.evalUtil(v) != v2);
      case "match":
        const v3 = this.evalUtil(ast.left);
        const re1 = normalizeRegex(String(this.evalUtil(ast.right)));
        return re1.test(String(v3));
      case "notmatch":
        const v4 = this.evalUtil(ast.left);
        const re4 = normalizeRegex(String(this.evalUtil(ast.right)));
        return !re4.test(String(v4));
      case "is":
        const v5 = typeof this.evalUtil(ast.left, true) === "undefined";
        return this.evalUtil(ast.right) ? !v5 : v5;
      case "isnot":
        const v6 = typeof this.evalUtil(ast.left, true) === "undefined";
        return this.evalUtil(ast.right) ? v6 : !v6;
    }
  }
}

function normalizeRegex(x: string): RegExp {
  if (x.startsWith("/") && x.endsWith("/")) {
    console.log(x.slice(1, -1))
    return new RegExp(x.slice(1, -1));
  }
  return new RegExp(x);
}

export default Evaluater;