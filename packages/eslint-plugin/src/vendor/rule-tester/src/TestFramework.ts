/**
 * @param text A string describing the rule
 * @param callback The test callback
 */
export type RuleTesterTestFrameworkFunctionBase = (
	text: string,
	callback: () => void,
) => void;
export type RuleTesterTestFrameworkFunction =
	RuleTesterTestFrameworkFunctionBase & {
		/**
		 * Skips running the tests inside this `describe` for the current file
		 */
		skip?: RuleTesterTestFrameworkFunctionBase;
	};
export type RuleTesterTestFrameworkItFunction =
	RuleTesterTestFrameworkFunctionBase & {
		/**
		 * Only runs this test in the current file.
		 */
		only?: RuleTesterTestFrameworkFunctionBase;
		/**
		 * Skips running this test in the current file.
		 */
		skip?: RuleTesterTestFrameworkFunctionBase;
	};

type Maybe<T> = T | null | undefined;

/**
 * @param fn A callback called after all the tests are done
 */
type AfterAll = (fn: () => void) => void;

/*
 * NOTE - If people use `mocha test.js --watch` command, the test function
 * instances are different for each execution.
 * This is why the getters get fresh instance always.
 */

/**
 * Defines a test framework used by the rule tester This class defaults to using
 * functions defined on the global scope, but also allows the user to manually
 * supply functions in case they want to roll their own tooling
 */
export abstract class TestFramework {
	static OVERRIDE_AFTER_ALL: Maybe<AfterAll> = null;
	static OVERRIDE_DESCRIBE: Maybe<RuleTesterTestFrameworkFunction> = null;
	static OVERRIDE_DESCRIBE_SKIP: Maybe<RuleTesterTestFrameworkFunctionBase>
		= null;

	static OVERRIDE_IT: Maybe<RuleTesterTestFrameworkItFunction> = null;
	static OVERRIDE_IT_ONLY: Maybe<RuleTesterTestFrameworkFunctionBase> = null;
	static OVERRIDE_IT_SKIP: Maybe<RuleTesterTestFrameworkFunctionBase> = null;

	/**
	 * Runs a function after all the tests in this file have completed.
	 */
	static get afterAll(): AfterAll {
		if (this.OVERRIDE_AFTER_ALL != null)
			return this.OVERRIDE_AFTER_ALL;

		throw new Error(
			"Missing definition for `afterAll` - you must set one using `RuleTester.afterAll` or there must be one defined globally as `afterAll`.",
		);
	}

	static set afterAll(value: Maybe<AfterAll>) {
		this.OVERRIDE_AFTER_ALL = value;
	}

	/**
	 * Creates a test grouping
	 */
	static get describe(): RuleTesterTestFrameworkFunction {
		if (this.OVERRIDE_DESCRIBE != null)
			return this.OVERRIDE_DESCRIBE;

		throw new Error(
			"Missing definition for `describe` - you must set one using `RuleTester.describe` or there must be one defined globally as `describe`.",
		);
	}

	static set describe(value: Maybe<RuleTesterTestFrameworkFunction>) {
		this.OVERRIDE_DESCRIBE = value;
	}

	/**
	 * Skips running the tests inside this `describe` for the current file
	 */
	static get describeSkip(): RuleTesterTestFrameworkFunctionBase {
		if (this.OVERRIDE_DESCRIBE_SKIP != null)
			return this.OVERRIDE_DESCRIBE_SKIP;

		if (
			typeof this.OVERRIDE_DESCRIBE === "function"
			&& typeof this.OVERRIDE_DESCRIBE.skip === "function"
		)
			return this.OVERRIDE_DESCRIBE.skip.bind(this.OVERRIDE_DESCRIBE);

		if (
			typeof this.describe === "function"
			&& typeof this.describe.skip === "function"
		)
			return this.describe.skip.bind(this.describe);

		if (
			typeof this.OVERRIDE_DESCRIBE === "function"
			|| typeof this.OVERRIDE_IT === "function"
		) {
			throw new TypeError(
				"Set `RuleTester.describeSkip` to use `dependencyConstraints` with a custom test framework.",
			);
		}
		if (typeof this.describe === "function") {
			throw new TypeError(
				"The current test framework does not support skipping tests tests with `dependencyConstraints`.",
			);
		}
		throw new Error(
			"Missing definition for `describeSkip` - you must set one using `RuleTester.describeSkip` or there must be one defined globally as `describe.skip`.",
		);
	}

	static set describeSkip(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
		this.OVERRIDE_DESCRIBE_SKIP = value;
	}

	/**
	 * Creates a test closure
	 */
	static get it(): RuleTesterTestFrameworkItFunction {
		if (this.OVERRIDE_IT != null)
			return this.OVERRIDE_IT;

		throw new Error(
			"Missing definition for `it` - you must set one using `RuleTester.it` or there must be one defined globally as `it`.",
		);
	}

	static set it(value: Maybe<RuleTesterTestFrameworkItFunction>) {
		this.OVERRIDE_IT = value;
	}

	/**
	 * Only runs this test in the current file.
	 */
	static get itOnly(): RuleTesterTestFrameworkFunctionBase {
		if (this.OVERRIDE_IT_ONLY != null)
			return this.OVERRIDE_IT_ONLY;

		if (
			typeof this.OVERRIDE_IT === "function"
			&& typeof this.OVERRIDE_IT.only === "function"
		)
			return this.OVERRIDE_IT.only.bind(this.OVERRIDE_IT);

		if (typeof this.it === "function" && typeof this.it.only === "function")
			return this.it.only.bind(this.it);

		if (
			typeof this.OVERRIDE_DESCRIBE === "function"
			|| typeof this.OVERRIDE_IT === "function"
		) {
			throw new TypeError(
				"Set `RuleTester.itOnly` to use `only` with a custom test framework.\n"
				+ "See https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester for more.",
			);
		}
		if (typeof this.it === "function") {
			throw new TypeError(
				"The current test framework does not support exclusive tests with `only`.",
			);
		}
		throw new Error(
			"Missing definition for `itOnly` - you must set one using `RuleTester.itOnly` or there must be one defined globally as `it.only`.",
		);
	}

	static set itOnly(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
		this.OVERRIDE_IT_ONLY = value;
	}

	/**
	 * Skips running this test in the current file.
	 */
	static get itSkip(): RuleTesterTestFrameworkFunctionBase {
		if (this.OVERRIDE_IT_SKIP != null)
			return this.OVERRIDE_IT_SKIP;

		if (
			typeof this.OVERRIDE_IT === "function"
			&& typeof this.OVERRIDE_IT.skip === "function"
		)
			return this.OVERRIDE_IT.skip.bind(this.OVERRIDE_IT);

		if (typeof this.it === "function" && typeof this.it.skip === "function")
			return this.it.skip.bind(this.it);

		if (
			typeof this.OVERRIDE_DESCRIBE === "function"
			|| typeof this.OVERRIDE_IT === "function"
		) {
			throw new TypeError(
				"Set `RuleTester.itSkip` to use `only` with a custom test framework.",
			);
		}
		if (typeof this.it === "function") {
			throw new TypeError(
				"The current test framework does not support exclusive tests with `only`.",
			);
		}
		throw new Error(
			"Missing definition for `itSkip` - you must set one using `RuleTester.itSkip` or there must be one defined globally as `it.only`.",
		);
	}

	static set itSkip(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
		this.OVERRIDE_IT_SKIP = value;
	}
}
