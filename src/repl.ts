import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { read } from "./reader.ts";

const histfile = join(import.meta.dirname, ".repl_history");

function loadHistory() {
  try {
    const history = readFileSync(histfile, "utf8");
    return history.split("\n");
  } catch {
    console.warn("Failed to load history");
    return [];
  }
}

function dumpHistory(history: Array<string>) {
  try {
    writeFileSync(histfile, history.join("\n"));
  } catch {
    console.warn("Failed to save history");
  }
}

const history = loadHistory();

const repl = createInterface({ input, output, history });

repl.on("history", dumpHistory);

while (true) {
  const line = await repl.question("repl:> ");
  const expr = read(line, false);
  console.log(JSON.stringify(expr));

  // if (/^\s*(\s*quit\s*)\s*$/.test(line)) {
  //   break;
  // };
  // const expr = read(line);
  //console.log(expr);
}

repl.close();
