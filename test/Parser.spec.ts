import Parser from "../src/Parser";
import { dump } from "../src/ast";

describe("Parser", () => {
  function createTest(str: string, ep: any) {
    test(str, () => {
      const parser = new Parser(str);
      const re = parser.parse();
      expect(dump(re)).toEqual(ep);
    });
  }

  createTest("1", `[:str 1]`);
  createTest(`""`, `[:str ]`);
  createTest("true", `[:bool true]`);
  createTest("TRUE", `[:bool true]`);
  createTest("false", `[:bool false]`);
  createTest("FALSE", `[:bool false]`);
  createTest("present", `[:present true]`);
  createTest("PRESENT", `[:present true]`);
  createTest("blank", `[:present false]`);
  createTest("BLANK", `[:present false]`);
  createTest("foo", `[:var foo]`);
  createTest("_foo", `[:var _foo]`);
  createTest("FOO", `[:var FOO]`);
  createTest("foo-bar", `[:var foo-bar]`);
  createTest("env(HOME)", `[:call :env [[:var HOME]]]`);
  createTest("concat(foo, -, bar)", `[:call :concat [[:var foo] [:str -] [:var bar]]]`);
  createTest("branch == master", `[:eq [:var branch] [:var master]]`);
  createTest("branch = master", `[:eq [:var branch] [:var master]]`);
  createTest("branch != master", `[:noteq [:var branch] [:var master]]`);
  createTest("branch is present", `[:is [:var branch] [:present true]]`);
  createTest("branch is not present", `[:isnot [:var branch] [:present true]]`);
  createTest("branch IS NOT present", `[:isnot [:var branch] [:present true]]`);
  createTest("branch in (master, release)", `[:in
 [:var branch]
 [[:var master] [:var release]]]`);
  createTest("branch not in (master, release)", `[:notin
 [:var branch]
 [[:var master] [:var release]]]`);
  createTest("branch =~ ^master$", `[:match [:var branch] [:str ^master$]]`);
  createTest("branch ~= /(master|foo)/", `[:match [:var branch] [:str /(master|foo)/]]`);
  createTest("branch !~ /(master|foo)/", `[:notmatch [:var branch] [:str /(master|foo)/]]`);
  createTest("not branch == master", `[:not [:eq [:var branch] [:var master]]]`)
  createTest("branch == master && tag == v1", `[:and
 [:eq [:var branch] [:var master]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("branch == master and tag == v1", `[:and
 [:eq [:var branch] [:var master]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("branch == master AND tag == v1", `[:and
 [:eq [:var branch] [:var master]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("branch == master || tag == v1", `[:or
 [:eq [:var branch] [:var master]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("branch == master or tag == v1", `[:or
 [:eq [:var branch] [:var master]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("not branch == master or tag == v1", `[:or
 [:not [:eq [:var branch] [:var master]]]
 [:eq [:var tag] [:var v1]]]`);
  createTest("branch == master or tag == v1 and sudo == true", `[:or
 [:eq [:var branch] [:var master]]
 [:and
  [:eq [:var tag] [:var v1]]
  [:eq [:var sudo] [:bool true]]]]`);
  createTest("branch == master and tag == v1 or sudo == true", `[:or
 [:and
  [:eq [:var branch] [:var master]]
  [:eq [:var tag] [:var v1]]]
 [:eq [:var sudo] [:bool true]]]`);
  createTest("not branch == master and tag == v1 or sudo == true", `[:or
 [:and
  [:not [:eq [:var branch] [:var master]]]
  [:eq [:var tag] [:var v1]]]
 [:eq [:var sudo] [:bool true]]]`);
  createTest("not branch == master and (tag == v1 or sudo == true)", `[:and
 [:not [:eq [:var branch] [:var master]]]
 [:or
  [:eq [:var tag] [:var v1]]
  [:eq [:var sudo] [:bool true]]]]`);
  createTest('branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present', `[:or
 [:and
  [:in
   [:var branch]
   [[:var foo] [:var bar]]]
  [:match
   [:call :env    [[:var baz]]]
   [:str ^baz-]]]
 [:is [:var tag] [:present true]]]`);
});
