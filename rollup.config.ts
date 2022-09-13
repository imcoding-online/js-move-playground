import { defineConfig, RollupOptions }  from "rollup";
import typescript from "@rollup/plugin-typescript";
import wasm from "@rollup/plugin-wasm";
import dts from "rollup-plugin-dts";

const opts : RollupOptions[] = [
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "commonjs",
    },
    plugins: [
      typescript(),
      wasm({
        targetEnv: "auto-inline",
      }),
    ]
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/move-playground.umd.js",
      format: "umd",
      name: "MovePlayground",
    },
    plugins: [
      typescript(),
      wasm({
        targetEnv: "auto-inline",
      }),
    ]
  },
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
    },
    plugins: [
      dts(),
    ]
  }
]

export default defineConfig(opts);