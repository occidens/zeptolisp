import { scanNumber } from "../src/tokenizer.ts";

const testValues = [
    `.75`,
    `1.25`,
    `42`,
    `+34`,
    `6.02e-23`,
    `5e5`,
    `6e+3`,
    `lorem`,
    `ipsum`
];

const result = testValues.map((s) => scanNumber(s, 0));

console.log(result);
