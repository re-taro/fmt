import core from "./configs/core";
import esnext from "./configs/esnext";
import react from "./configs/react"
import { definePlugin } from "./utils";

const plugin = definePlugin({
  rules: {},
  configs: {
    core,
    esnext,
    react,
  },
});

const { rules, configs } = plugin;

export { rules, configs };
