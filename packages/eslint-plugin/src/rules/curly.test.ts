import { unindent as $ } from "eslint-vitest-rule-tester";
import { run } from "./_test";
import { RULE_NAME, rule } from "./curly";

run({
	invalid: [
		{
			code: $`
        if (true)
          console.log({
            foo
          })
      `,
			description: "multi",
			output: $`
        if (true) {
          console.log({
            foo
          })
        }
      `,
		},
		{
			code: $`
        if (true)
          if (false) console.log('bar')
      `,
			description: "nested",
			output: $`
        if (true) {
          if (false) console.log('bar')
        }
      `,
		},
		{
			code: $`
        if (true)
          console.log('bar')
        else
          console.log({
            foo
          })
      `,
			description: "consistent",
			output: $`
        if (true) {
          console.log('bar')
        }
        else {
          console.log({
            foo
          })
        }
      `,
		},
		{
			code: $`
        while (true)
          console.log({
            foo
          })
      `,
			description: "while",
			output: $`
        while (true) {
          console.log({
            foo
          })
        }
      `,
		},
		{
			code: $`
        if (true)
          console.log('foo')
        else if (false)
          console.log('bar')
        else if (true)
          console.log('baz')
        else {
          console.log('qux')
        }
      `,
			description: "if-else-if",
			output: $`
        if (true) {
          console.log('foo')
        }
        else if (false) {
          console.log('bar')
        }
        else if (true) {
          console.log('baz')
        }
        else {
          console.log('qux')
        }
      `,
		},
		{
			code: $`
        if (
          foo
          || bar
        )
          return true
      `,
			description: "multiline-test",
			output: $`
        if (
          foo
          || bar
        ) {
          return true
        }
      `,
		},
	],
	name: RULE_NAME,
	rule,
	valid: [
		$`
      if (true)
        console.log('hello')
    `,
		$`
      if (true) {
        console.log('hello')
      }
    `,
		$`
      while (true)
        console.log('bar')
    `,
		$`
      if (true)
        console.log('foo')
      else if (false)
        console.log('bar')
    `,
		$`
      if (true) {
        console.log('foo')
      } else if (false) {
        console.log('bar')
      } else if (true) {
        console.log('baz')
      }
    `,
		$`
      function identity(x) {
        if (foo)
          console.log('bar')
      }
    `,
		$`
      function identity(x) {
        if (foo)
          console.log('bar')
        ;console.log('baz')
      }
    `,
		$`
      function identity(x) {
        if (foo)
          return x;
      }
    `,
	],
});
