import core from './configs/core'
import esnext from './configs/esnext'
import react from './configs/react'
import typescript from './configs/typescript'
import typescriptTypeChecking from './configs/typescript-type-checking'
import { definePlugin } from './utils'

const plugin = definePlugin({
  rules: {},
  configs: {
    core,
    esnext,
    react,
    typescript,
    typescriptTypeChecking,
  },
})

const { rules, configs } = plugin

export { rules, configs }
