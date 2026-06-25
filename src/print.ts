import type { Expr } from "./parser.ts";

function print(e: Expr) {
    console.log(
    JSON.stringify(e, (_, value) => {
      // For now we just print symbols according to their description
      // and double-quote strings
      if (typeof value === "symbol") {
        return value.description ? value.description : "#symbol";
      }
      if (typeof value === "string") {
        return JSON.stringify(value);
      }
      return value;
    }),
  );

}

export { print }
