import core from "./configs/core";
import esnext from "./configs/esnext";
import { definePlugin } from "./utils";

const plugin = definePlugin({
  rules: {},
  configs: {
    core,
    esnext,
  },
});

const { rules, configs } = plugin;

export { rules, configs };
