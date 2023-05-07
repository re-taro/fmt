import core from "./configs/core";
import esnext from "./configs/esnext";
import json from "./configs/json";
import markdown from "./configs/markdown";
import next from "./configs/next";
import react from "./configs/react";
import svelte from "./configs/svelte";
import typescript from "./configs/typescript";
import typescriptTypeChecking from "./configs/typescript-type-checking";
import vue from "./configs/vue";
import yaml from "./configs/yaml";
import { definePlugin } from "./utils";

const plugin = definePlugin({
  rules: {},
  configs: {
    core,
    esnext,
    json,
    markdown,
    next,
    react,
    svelte,
    typescript,
    typescriptTypeChecking,
    vue,
    yaml,
  },
});

const { rules, configs } = plugin;

export { rules, configs };
