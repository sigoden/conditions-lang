import { printAst, run, parse } from "../src";

test("run", () => {
  const str = 'branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present'
  const vars = { branch: 'foo', tag: 'v.1.0.0' };
  const funs = {
      env: k => {
          const envs = { baz: 'baz-1' };
          return envs[k];
      }
  };
  const result = run(str, vars, funs);
  expect(result).toEqual(true);
});

test("parse", () => {
  const str = 'branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present'
  const ast = parse(str);
  expect(printAst(ast)).toEqual(`[:or
 [:and
  [:in
   [:var branch]
   [[:var foo] [:var bar]]]
  [:match
   [:call :env    [[:var baz]]]
   [:str ^baz-]]]
 [:is [:var tag] [:present true]]]`);
})
