import { scanString } from "../src/tokenizer.ts";

const testValues = [
    `"lorem ipsum"`,
    `"dolor \\"sit\\" amet"`,
    `"dolor "sit\\" amet"`
];

const result = testValues.map((s) => scanString(s, 0))

console.log(result);