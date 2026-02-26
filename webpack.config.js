import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/initialize.js",
  output: {
    filename: "questspector.js",
    path: path.resolve(__dirname, "docs"),
  },
  mode: "production",
  devtool: [
    { type: "javascript", use: "source-map" }
  ]
};