// Exhaustiveness check for switch statements
function exhaust(val: never): never;
function exhaust(val: any) {
  throw new Error(`Unexpected value ${val}`);
}

export { exhaust };
