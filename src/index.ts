import Parser from "./Parser";
import Evaluater, { Funcs, Vars } from "./Evaluater";
import { dump, Ast } from "./ast";

export { Funcs, Vars, Ast };

export function evaluate(input: string, vars: Vars, funcs: Funcs) {
  const ast = parse(input);
  const evaluater = new Evaluater(vars, funcs);
  return evaluater.eval(ast);
}

export function parse(input: string) {
  return new Parser(input).parse();
}

export const printAst = dump;