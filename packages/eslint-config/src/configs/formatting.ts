import { GLOB_PACKAGEJSON, GLOB_TESTS, GLOB_TSCONFIG } from "../globs";
import { pluginStylistic } from "../plugins";
import type { ConfigItem, Options } from "../types";

export const formatting = (options: Options): ConfigItem[] =>
	(
		[
			{
				plugins: {
					style: pluginStylistic,
				},
			},
			{
				rules: {
					"curly": ["error", "all"],
					"re-taro/no-useless-template-string": "error",
					"re-taro/no-negated-comparison": "error",
					"re-taro/no-import-promises-as": "error",
					"re-taro/pad-after-last-import": "error",
					"re-taro/function-style": "error",
					"style/quote-props": ["error", "consistent-as-needed"],
					"style/padding-line-between-statements": [
						"error",
						{ blankLine: "always", prev: "*", next: "return" },
					],
				},
			},
			(options.jsonc ?? true) && [
				{
					files: [GLOB_PACKAGEJSON],
					rules: {
						"jsonc/sort-keys": [
							"error",
							{
								pathPattern: "^exports$",
								order: { type: "asc" },
							},
							{
								pathPattern: "^exports.*$",
								order: ["types", "require", "import", "default"],
							},
						],
					},
				},
				{
					files: GLOB_TSCONFIG,
					rules: {
						"jsonc/sort-keys": [
							"error",
							{
								order: [
									"extends",
									"compilerOptions",
									"references",
									"files",
									"include",
									"exclude",
								],
								pathPattern: "^$",
							},
							{
								order: [
									/* Projects */
									"incremental",
									"composite",
									"tsBuildInfoFile",
									"disableSourceOfProjectReferenceRedirect",
									"disableSolutionSearching",
									"disableReferencedProjectLoad",
									/* Language and Environment */
									"target",
									"jsx",
									"jsxFactory",
									"jsxFragmentFactory",
									"jsxImportSource",
									"lib",
									"moduleDetection",
									"noLib",
									"reactNamespace",
									"useDefineForClassFields",
									"emitDecoratorMetadata",
									"experimentalDecorators",
									/* Modules */
									"baseUrl",
									"rootDir",
									"rootDirs",
									"customConditions",
									"module",
									"moduleResolution",
									"moduleSuffixes",
									"noResolve",
									"resolveJsonModule",
									"resolvePackageJsonExports",
									"resolvePackageJsonImports",
									"typeRoots",
									"types",
									"allowArbitraryExtensions",
									"allowImportingTsExtensions",
									"allowUmdGlobalAccess",
									/* JavaScript Support */
									"allowJs",
									"checkJs",
									"maxNodeModuleJsDepth",
									/* Type Checking */
									"strict",
									"strictBindCallApply",
									"strictFunctionTypes",
									"strictNullChecks",
									"strictPropertyInitialization",
									"allowUnreachableCode",
									"allowUnusedLabels",
									"alwaysStrict",
									"exactOptionalPropertyTypes",
									"noFallthroughCasesInSwitch",
									"noImplicitAny",
									"noImplicitOverride",
									"noImplicitReturns",
									"noImplicitThis",
									"noPropertyAccessFromIndexSignature",
									"noUncheckedIndexedAccess",
									"noUnusedLocals",
									"noUnusedParameters",
									"useUnknownInCatchVariables",
									/* Emit */
									"declaration",
									"declarationDir",
									"declarationMap",
									"downlevelIteration",
									"emitBOM",
									"emitDeclarationOnly",
									"importHelpers",
									"importsNotUsedAsValues",
									"inlineSourceMap",
									"inlineSources",
									"mapRoot",
									"newLine",
									"noEmit",
									"noEmitHelpers",
									"noEmitOnError",
									"outDir",
									"outFile",
									"preserveConstEnums",
									"preserveValueImports",
									"removeComments",
									"sourceMap",
									"sourceRoot",
									"stripInternal",
									/* Interop Constraints */
									"allowSyntheticDefaultImports",
									"esModuleInterop",
									"forceConsistentCasingInFileNames",
									"isolatedModules",
									"preserveSymlinks",
									"verbatimModuleSyntax",
									/* Completeness */
									"skipDefaultLibCheck",
									"skipLibCheck",
									/* Alias */
									"paths",
								],
								pathPattern: "^compilerOptions$",
							},
						],
					},
				},
			],
			(options.test ?? true) && {
				files: GLOB_TESTS,
				rules: {
					"jest-formatting/padding-around-all": "error",
				},
			},
		] satisfies (ConfigItem | ConfigItem[] | boolean)[]
	)
		.flat()
		.filter(Boolean) as any;
