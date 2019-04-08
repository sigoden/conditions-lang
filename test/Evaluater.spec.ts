import Evaluater, { Vars, Funcs } from "../src/Evaluater";
import Parser from "../src/Parser";

const DEFAULT_VARS: Vars = { branch: 'master' };
const DEFAULT_FUNCS: Funcs = {
  env: (args) => {
    const head = args[0];
    return ({
      foo: "foo",
      bar: false,
    })[head];
  },
  concat: (args) => {
    return args.join("");
  },
};



describe("Evaluate", () => {
  function createTest(str: string, b: boolean, vars = DEFAULT_VARS, funcs = DEFAULT_FUNCS) {
    test(str, () => {
      const parser = new Parser(str);
      const evaluater = new Evaluater(vars, funcs);
      const ast = parser.parse();
      expect(evaluater.eval(ast)).toEqual(b);
    });
  }

  createTest("1", true);
  createTest("0", true);
  createTest(`""`, false);
  createTest("true", true);
  createTest("TRUE", true);
  createTest("false", false);
  createTest("FALSE", false);
  createTest("FALSE", false);
  createTest("NOT branch = foo AND (env(foo) = foo OR tag = wat)", true);
  createTest('branch = foo OR env(foo) = foo AND NOT tag = wat', true);
  createTest('branch = foo OR env(foo) = foo AND tag = wat', false);
  createTest('env(bar) = true', false);
  createTest('concat(foo, -, bar) = foo-bar', true);
  createTest('concat(branch, -, env(foo), -, env(bar)) = master-foo-false', true);
  createTest('1 = 1', true);
  createTest('true = true', true);
  createTest('branch = master', true);
  createTest('branch = foo', false);
  createTest('env(foo) = foo', true);
  createTest('env(foo) = bar', false);
  createTest('env(foo) != bar', true);
  createTest('not env(foo) = bar', true);
  createTest('branch =~ ^ma.*$', true);
  createTest('branch =~ ^foo.*$', false);
  createTest('env(foo) ~= ^foo.*$', true);
  createTest('env(foo) =~ ^bar.*$', false);
  createTest('env(foo) =~ env(foo)', true);
  createTest('env(foo) =~ concat("^", env(foo), "$")', true);
  createTest('env(foo) !~ ^bar.*$', true);
  createTest('branch in (foo, master, bar)', true);
  createTest('branch IN (foo, master, bar)', true);
  createTest('branch IN (foo, bar)', false);
  createTest('env(foo) IN (foo, bar, baz)', true);
  createTest('env(foo) IN (bar, baz)', false);
  createTest('branch not in (foo, master, bar)', false);
  createTest('branch is present', true);
  createTest('branch IS present', true);
  createTest('branch IS PRESENT', true);
  createTest('env(foo) IS present', true);
  createTest('branch IS BLANK', false);
  createTest('tag is blank', true);
  createTest('env(foo) IS blank', false);
  createTest('branch is not present', false);
  createTest('branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present', true, { branch: 'foo', tag: 'v.1.0.0' });
});
