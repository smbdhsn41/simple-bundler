import { resolve } from "path";
import SimpleHtmlWebpackPlugin from "./plugins/SimpleHtmlWebpackPlugin";
const config = {
  entry: resolve(__dirname, "src/index.js"),
  output: {
    filename: "bundle.js",
    path: resolve(__dirname, "dist"),
  },
  // @ts-ignore
  plugins: [new SimpleHtmlWebpackPlugin()],
};

export default config;
