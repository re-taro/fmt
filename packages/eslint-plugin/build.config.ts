import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
	clean: true,
	declaration: true,
	entries: [
		"src/index",
	],
	externals: [
		"@typescript-eslint/utils",
		"@typescript-eslint/types",
	],
	rollup: {
		emitCJS: true,
	},
});
