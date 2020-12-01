import { uuidV4 } from "../../deps.ts";
import Address from "../interfaces/address.ts";
import NodeConfig from "../interfaces/nodeConfig.ts";
import Neighbors from "../interfaces/neighbors.ts";
import CommandHandler from "../services/commandHandler.ts";

export default class Node {
    private static instance: Node;

    public static async getInstance(config?: NodeConfig) {
        if (!Node.instance) {
            if (!config) {
                console.error("Missing node configuration, using defaults...");
                config = {
                    ip: "127.0.0.1",
                    port: 2010,
                };
            }
            Node.instance = new Node(config);
            Node.instance.commandHandler = await CommandHandler.build();
            Node.instance.runCommandHandlerWorker();
        }
        return Node.instance;
    }

    id: string;
    address: Address;
    leader: Address;
    neighbors: Neighbors;
    commandHandler?: CommandHandler;

    private constructor(config: NodeConfig) {
        this.id = uuidV4.generate();
        this.address = {
            hostname: config.ip,
            port: config.port,
        };
        this.leader = this.address;
        this.neighbors = {
            next: this.address,
            nnext: this.address,
            prev: this.address,
        };
    }

    private runCommandHandlerWorker() {
        const worker = new Worker(
            new URL("../workers/commandListener.ts", import.meta.url).href,
            { type: "module", deno: true }
        );

        worker.onmessage = (e) => {
            let commandName = e.data as string;
            commandName = commandName.replace("\r", "");
            if (!this.commandHandler) {
                throw new Error(
                    "Command handler has not been initialized yet."
                );
            }
            this.commandHandler.handle(commandName);
        };
    }

    public printStatus() {
        console.log(
            `Node status: ${this.id}, ${this.address}, ${this.leader}, ${this.neighbors}`
        );
    }
}
