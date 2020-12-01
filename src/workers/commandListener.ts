import { readLines } from "../../deps.ts";

const selfWorker = (self as unknown) as Worker;

for await (const commandName of readLines(Deno.stdin)) {
    selfWorker.postMessage(commandName);
}
