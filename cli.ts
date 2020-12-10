import { parse, serve, respond } from "./deps.ts";
import Address from "./src/interfaces/address.ts";
import Node from "./src/model/node.ts";
import "./src/utils/console.ts";

// Read configuration from program's arguments.

const args = parse(Deno.args);

if ((args.ip && !args.port) || (!args.ip && args.port)) {
    console.error("-ip and -port must be both either set or unset");
    Deno.exit(1);
}

if ((args.ipTo && !args.portTo) || (!args.ipTo && args.portTo)) {
    console.error("-ipTo and -portTo must be both either set or unset");
    Deno.exit(1);
}

const config = {
    ip: args.ip,
    port: parseInt(args.port),
    otherIp: args.ipTo,
    otherPort: parseInt(args.portTo),
};

// Initialize the node.

const node = await Node.getInstance(config.ip ? config : undefined);

// Run the node's server to listen for JSON remote procedure calls.

const server = serve({
    hostname: node.address.hostname,
    port: node.address.port,
});
console.info(
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
    writeVariable: (arg: { value: any; isBackup: boolean }) => {
        node.receiver.writeVariable(arg);
        return null;
    },
};

node.connect();

for await (const req of server) {
    respond(req, rpcMethods); // no await, we don't want to block here
}
