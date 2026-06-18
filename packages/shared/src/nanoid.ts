import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const length = 10;
export const nano = customAlphabet(alphabet, length);
