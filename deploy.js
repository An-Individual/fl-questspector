import * as fs from "fs";

fs.cpSync("./dev", "./docs", {recursive: true});