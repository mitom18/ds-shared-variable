import { parse, serve, respond } from "./deps.ts";
import Node from "./src/model/node.ts";

// https://deno.land/std@0.79.0/flags/README.md
console.dir(parse(Deno.args));

// TODO node config from Deno.args
const node = await Node.getInstance();

const server = serve({
    hostname: node.address.hostname,
    port: node.address.port,
});
console.log(
    `Node accessible through address ${node.address.hostname}:${node.address.port}`
);

// TODO rpcMethods from receiver
const rpcMethods = {
    sayHello: (w: [string]) => `Hello ${w}`,
};

for await (const req of server) {
    await respond(req, rpcMethods);
}
