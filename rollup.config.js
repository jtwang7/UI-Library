// rollup.config.js
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import scss from "rollup-plugin-scss";
import json from "@rollup/plugin-json";
const { babel } = require("@rollup/plugin-babel");
const packageJson = require("./package.json");

const isProd = process.env.NODE_ENV === "production";

const babelOptions = {
  presets: ["@babel/preset-env"],
  extensions: [".js", ".jsx", ".ts", ".tsx", ".less"],
  exclude: "**/node_modules/**",
};

const options = {
  input: "./index.ts",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
    },
    {
      file: packageJson.module,
      format: "es",
    },
  ],
  plugins: [
    peerDepsExternal({ includeDependencies: !isProd }),
    resolve(),
    commonjs({ sourceMap: !isProd }),
    typescript({ useTsconfigDeclarationDir: true }),
    scss(),
    babel(babelOptions),
    json(),
  ],
};

export default options;
