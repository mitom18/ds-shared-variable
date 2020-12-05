import { parse, serve, respond } from "./deps.ts";
import Address from "./src/interfaces/address.ts";
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

const rpcMethods = {
    join: (addr: Address) => {
        return node.receiver.join(addr);
    },
    changNNext: (addr: Address) => {
        node.receiver.changNNext(addr);
        return null;
    },
    changPrev: (addr: Address) => {
        return node.receiver.changPrev(addr);
    },
    nodeMissing: (addr: Address) => {
        node.receiver.nodeMissing(addr);
        return null;
    },
    election: (arg: { id: string }) => {
        node.receiver.election(arg);
        return null;
    },
    elected: (arg: { id: string; leaderAddr: Address }) => {
        node.receiver.elected(arg);
        return null;
    },
    readVariable: () => {
        return node.receiver.readVariable();
    },
    writeVariable: (arg: { value: any }) => {
        node.receiver.writeVariable(arg);
        return null;
    },
};

for await (const req of server) {
    await respond(req, rpcMethods);
}
