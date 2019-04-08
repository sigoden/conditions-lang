# Conditons 

**Boolean language for conditional builds, stages, jobs**

## Use module

``` js
const { evaluate } = require("conditions-lang");
const str = 'branch IN (foo, bar) AND env(baz) =~ ^baz- OR tag IS present'
const data = { branch: 'foo', env: { baz: 'baz-1' }, tag: 'v.1.0.0' }
evaluate(str, data) // true
```

## Use cli

- parse

Check the syntax of a condition by inspecting the resulting abstract syntax tree.

```sh
$ conditions "branch = foo"
[:eq, [:var, :branch], [:val, "foo"]]
```

- eval

Check conditions against a given data hash.

```sh
$ conditions "branch = foo" '{"branch": "foo"}'
true

$ conditions "env(foo) = bar" '{"env": {"foo": "bar"}}'
true
```

## License

MIT @sigoden 2019
