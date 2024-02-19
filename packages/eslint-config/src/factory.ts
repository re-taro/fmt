import fs from "node:fs";

import gitignore from "eslint-config-flat-gitignore";
import { isPackageExists } from "local-pkg";

import {
	comments,
	formatting,
	html,
	ignores,
	imports,
	javascript,
	jsonc,
	mdx,
	next,
	node,
	onlyError,
	promise,
	react,
	solid,
	sortImports,
	storybook,
	svelte,
	test,
	toml,
	typescript,
	unicorn,
	vue,
	yaml,
} from "./configs";
import type { ConfigItem, Options } from "./types";

const flatConfigProps: (keyof ConfigItem)[] = [
	"files",
	"ignores",
	"languageOptions",
	"linterOptions",
	"processor",
	"plugins",
	"rules",
	"settings",
];

const VuePackages = ["vue", "nuxt", "vitepress", "@slidev/cli"];
const SveltePackages = ["svelte", "svelte-check", "@sveltejs/kit"];

/**
 * Construct an array of ESLint flat config items.
 */
export function re_taro(
	options: Options = {},
	...userConfigs: (ConfigItem | ConfigItem[])[]
) {
	const {
		vue: enableVue = VuePackages.some((i) => isPackageExists(i)),
		svelte: enableSvelte = SveltePackages.some((i) => isPackageExists(i)),
		solid: enableSolid = isPackageExists("solid-js"),
		typescript: enableTypeScript = isPackageExists("typescript"),
		react: enableReact = isPackageExists("react"),
		next: enableNext = isPackageExists("next"),
		storybook: enableStorybook = isPackageExists("storybook"),
		gitignore: enableGitignore = true,
		componentExts = [],
		parserOptions = {},
	} = options;

	const configs: ConfigItem[][] = [];

	if (enableGitignore) {
		if (typeof enableGitignore === "boolean") {
			if (fs.existsSync(".gitignore")) {
				configs.push([gitignore()]);
			}
		} else {
			configs.push([gitignore(enableGitignore)]);
		}
	}

	// Base configs
	configs.push(
		ignores(),
		javascript({
			overrides: getOverrides(options, "javascript"),
		}),
		comments(),
		node(),
		onlyError(),
		promise(),
		sortImports(),
		imports(),
		unicorn(),
		html(),
	);

	if (enableVue) {
		componentExts.push("vue");
	}

	if (enableSvelte) {
		componentExts.push("svelte");
	}

	if (enableTypeScript) {
		configs.push(
			typescript({
				componentExts,
				parserOptions,
				overrides: getOverrides(options, "typescript"),
			}),
		);
	}

	if (options.test ?? true) {
		configs.push(
			test({
				overrides: getOverrides(options, "test"),
			}),
		);
	}

	if (enableReact) {
		configs.push(
			react({
				overrides: getOverrides(options, "react"),
			}),
		);
	}

	if (enableNext) {
		configs.push(
			next({
				overrides: getOverrides(options, "next"),
			}),
		);
	}

	if (enableVue) {
		configs.push(
			vue({
				overrides: getOverrides(options, "vue"),
				typescript: !!enableTypeScript,
			}),
		);
	}

	if (enableSvelte) {
		configs.push(
			svelte({
				overrides: getOverrides(options, "svelte"),
				typescript: !!enableTypeScript,
			}),
		);
	}

	if (enableSolid) {
		configs.push(
			solid({
				overrides: getOverrides(options, "solid"),
				typescript: !!enableTypeScript,
			}),
		);
	}

	if (enableStorybook) {
		configs.push(
			storybook({
				overrides: getOverrides(options, "storybook"),
			}),
		);
	}

	if (options.jsonc ?? true) {
		configs.push(jsonc());
	}

	if (options.toml ?? true) {
		configs.push(
			toml({
				overrides: getOverrides(options, "toml"),
			}),
		);
	}

	if (options.yaml ?? true) {
		configs.push(
			yaml({
				overrides: getOverrides(options, "yaml"),
			}),
		);
	}

	if (options.mdx ?? true) {
		configs.push(
			mdx({
				componentExts,
				overrides: getOverrides(options, "mdx"),
			}),
		);
	}

	if (options.formatting ?? true) {
		configs.push(formatting(options));
	}

	const fusedConfig = flatConfigProps.reduce((acc, key) => {
		if (key in options) {
			acc[key] = options[key as keyof Options];
		}

		return acc;
	}, {} as ConfigItem);

	if (Object.keys(fusedConfig).length > 0) {
		configs.push([fusedConfig]);
	}

	const merged = [...configs, ...userConfigs].flat();

	return merged;
}

type ResolvedOptions<T> = T extends boolean ? never : NonNullable<T>;

const resolveSubOptions = <K extends keyof Options>(
	options: Options,
	key: K,
): ResolvedOptions<Options[K]> =>
	typeof options[key] === "boolean" ? ({} as any) : options[key] || {};

function getOverrides<K extends keyof Options>(options: Options, key: K) {
	const sub = resolveSubOptions(options, key);

	return {
		// eslint-disable-next-line etc/no-deprecated
		...(options.overrides as any)?.[key],
		...("overrides" in sub
			? typeof sub.overrides === "object"
				? sub.overrides
				: {}
			: {}),
	};
}
