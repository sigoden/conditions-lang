# Conditons 

**Bool 语言 - 适用于条件控制构建，任务**

## 模块

``` js
const { parse } = require("conditions-lang");
const str = 'branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present'
const data = { branch: 'foo', env: { baz: 'baz-1' }, tag: 'v.1.0.0' }
parse(str, data) // true
```

## 命令行

- 解析

打印 AST 以检查语法是否正确

```sh
$ conditions "branch = foo"
[:eq, [:var, :branch], [:val, "foo"]]
```

- 执行

判断条件是否满足

```sh
$ conditions "branch = foo" '{"branch": "foo"}'
true

$ conditions "env(foo) = bar" '{"env": {"foo": "bar"}}'
true
```

## 许可证

MIT @sigoden 2019