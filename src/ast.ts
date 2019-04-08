export type Ast =
  Str
  | Bool
  | Present
  | Var
  | Call
  | Unary
  | List
  | Binary

export interface Str {
  type: "str";
  value: string;
}

export interface Bool {
  type: "bool";
  value: true | false
}

export interface Present {
  type: "present";
  value: true | false
}

export interface Var {
  type: "var";
  value: string;
}

export interface Call {
  type: "call";
  func: string;
  args: Ast;
}

export interface Binary {
  type: "binary";
  operator: Operator;
  left: Ast;
  right: Ast;
}

export interface Unary {
  type: "unary";
  operator: "not";
  value: Ast;
}

export interface List {
  type: "list";
  value: Array<Ast>;
}

export type Operator = "is"
  | "isnot"
  | "or"
  | "and"
  | "in"
  | "notin"
  | "eq"
  | "noteq"
  | "match"
  | "notmatch";


export function dump(ast: Ast) {
  return dumpUtil(ast, 0);
}

function dumpUtil(ast: Ast, indent: number) {
  const indentStr = " ".repeat(indent);
  switch (ast.type) {
    case "str":
      return `${indentStr}[:str ${ast.value}]`
    case "bool":
      return `${indentStr}[:bool ${ast.value}]`
    case "present":
      return `${indentStr}[:present ${ast.value}]`
    case "var":
      return `${indentStr}[:var ${ast.value}]`
    case "call":
      return `${indentStr}[:call :${ast.func}${dumpUtil(ast.args, indent + 1)}]`
    case "list":
      return dumpList(ast.value, indent)
    case "unary":
      if (isSimpleAst(ast.value)) {
        return `${indentStr}[:${ast.operator} ${dumpUtil(ast.value, 0)}]`
      }
      return `${indentStr}[:not\n${dumpUtil(ast.value, indent + 1)}]`
    case "binary":
      if (isSimpleAst(ast)) {
        return `${indentStr}[:${ast.operator} ${dumpUtil(ast.left, 0)} ${dumpUtil(ast.right, 0)}]`
      }
      return `${indentStr}[:${ast.operator}\n${dumpUtil(ast.left, indent + 1)}\n${dumpUtil(ast.right, indent + 1)}]`
  }
}

function dumpList(asts: Ast[], indent: number) {
  const indentStr = " ".repeat(indent);
  const list = [];
  if (isSimpleAsts(asts)) {
    for (const ast of asts) {
      list.push(dumpUtil(ast, 0));
    }
    return `${indentStr}[${list.join(" ")}]`
  }
  for (const ast of asts) {
    list.push(dumpUtil(ast, indent+1));
  }
  return `${indentStr}[\n${list.join("\n")}]`
}

function isSimpleAst(ast: Ast, nested = false) {
  switch (ast.type) {
    case "str":
    case "bool":
    case "present":
    case "var":
      return true;
    case "call":
      if (nested) return false;
      return isSimpleAsts((ast.args as List).value);
    case "list":
      if (nested) return false;
      return isSimpleAsts(ast.value);
    case "unary":
      if (nested) return false;
      return isSimpleAst(ast.value, true) ;
    case "binary":
      if (nested) return false;
      return isSimpleAst(ast.left, true) && isSimpleAst(ast.right, true)
  }
}

function isSimpleAsts(asts: Ast[]) {
  return asts.every(v => isSimpleAst(v, true));
}