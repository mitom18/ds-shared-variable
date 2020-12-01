import { uuidV4 } from "../../deps.ts";
import Address from "../interfaces/address.ts";
import NodeConfig from "../interfaces/nodeConfig.ts";
import SystemInfo from "../interfaces/systemInfo.ts";
import IReceiver from "../interfaces/receiver.ts";
import Receiver from "../services/receiver.ts";
import CommunicationService from "../services/communication.ts";
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
    systemInfo: SystemInfo;
    receiver: IReceiver;
    communicationService: CommunicationService;
    commandHandler?: CommandHandler;
    voting: boolean;

    private constructor(config: NodeConfig) {
        this.voting = false;
        this.id = uuidV4.generate();
        this.address = {
            hostname: config.ip,
            port: config.port,
        };
        this.systemInfo = {
            nextNeighbor: this.address,
            nnextNeighbor: this.address,
            prevNeighbor: this.address,
            leader: this.address,
        };
        let connectToAddress = this.address;
        if (config.otherIp && config.otherPort) {
            connectToAddress = {
                hostname: config.otherIp,
                port: config.otherPort,
            };
        }
        this.receiver = new Receiver(this);
        this.communicationService = new CommunicationService(this);
        this.printStatus();
        // TODO join
    }

    /**
     * Runs command handler worker (other thread) for serving the command line.
     */
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
            `Node status: ${this.id}, ${this.address}, ${this.systemInfo}`
        );
    }
}
