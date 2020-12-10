import { uuidV4 } from "../../deps.ts";
import Address, { isEqual } from "../interfaces/address.ts";
import NodeConfig from "../interfaces/nodeConfig.ts";
import SystemInfo from "../interfaces/systemInfo.ts";
import IReceiver, { UNKNOWN_ELECTION_ID } from "../interfaces/receiver.ts";
import Receiver from "../services/receiver.ts";
import CommunicationService from "../services/communication.ts";
import CommandHandler from "../services/commandHandler.ts";

/**
 * Base element of the system, nodes are forming a ring for Chang-Roberts algorithm.
 */
export default class Node {
    private static instance: Node;

    /**
     * Node is a singleton, thus static getInstance() method and a private constructor.
     * @param config configuration for the first initialization of Node instance, should be omitted when instance already exists
     */
    public static async getInstance(config?: NodeConfig) {
        if (!Node.instance) {
            // create new Node instance
            if (!config) {
                console.error("Missing node configuration, using defaults...");
                config = {
                    ip: "127.0.0.1",
                    port: 2010,
                };
            }
            Node.instance = new Node(config);

            // run command listener in new worker thread
            Node.instance.commandHandler = await CommandHandler.build();
            Node.instance.runCommandHandlerWorker();
        }
        return Node.instance;
    }

    id: string;
    address: Address;
    connectToAddress: Address;
    systemInfo: SystemInfo;
    receiver: IReceiver;
    communicationService: CommunicationService;
    commandHandler?: CommandHandler;
    voting: boolean;
    repairRunning: boolean;
    sharedVariable: any;

    private constructor(config: NodeConfig) {
        this.voting = false;
        this.repairRunning = false;
        this.sharedVariable = null;
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
        this.connectToAddress = this.address;
        if (config.otherIp && config.otherPort) {
            this.connectToAddress = {
                hostname: config.otherIp,
                port: config.otherPort,
            };
        }
        this.receiver = new Receiver(this);
        this.communicationService = new CommunicationService(this);
        this.printStatus();
    }

    /**
     * Connects node to the system.
     */
    public connect() {
        // join the system
        const nodeToConnect = this.communicationService.getRemote(
            this.connectToAddress
        );
        nodeToConnect
            .join(this.address)
            .then((response) => {
                this.systemInfo = response as SystemInfo;
                this.printStatus();
            })
            .catch((error) => {
                console.error(
                    `Could not connect to ${JSON.stringify(
                        this.connectToAddress
                    )}`
                );
                console.error(error);
                Deno.exit(1);
            });
    }

    /**
     * Prints node's status to console as: ID, address, system info.
     */
    public printStatus() {
        console.info(
            `Node status: ${this.id}, ${this.address.hostname}:${
                this.address.port
            }, ${JSON.stringify(this.systemInfo)}`
        );
    }

    /**
     * Reads the value of shared variable from the leader.
     */
    public async readSharedVariable() {
        let isError = false;
        const initialLeader: Address = {
            hostname: this.systemInfo.leader.hostname,
            port: this.systemInfo.leader.port,
        };
        let value = undefined;
        do {
            try {
                value = await this.communicationService
                    .getLeaderRemote()
                    .readVariable();
                isError = false;
            } catch (error) {
                if (isEqual(initialLeader, this.systemInfo.leader)) {
                    isError = true;
                    await this.repairTopology(initialLeader);
                }
            }
        } while (isError === true);

        return value;
    }

    /**
     * Writes given value to the shared variable in the leader.
     * @param {any} value - Value to write to the shared variable.
     */
    public async writeSharedVariable(value: any) {
        let isError = false;
        const initialLeader: Address = {
            hostname: this.systemInfo.leader.hostname,
            port: this.systemInfo.leader.port,
        };
        do {
            try {
                await this.communicationService
                    .getLeaderRemote()
                    .writeVariable({ value, isBackup: false });
                isError = false;
            } catch (error) {
                if (isEqual(initialLeader, this.systemInfo.leader)) {
                    isError = true;
                    await this.repairTopology(initialLeader);
                }
            }
        } while (isError === true);
    }

    /**
     * Informs system, that node is going to shut down and than shuts the node down.
     * Updates info in node's next and previous neighbor, starts leader election and exits.
     */
    public async logout() {
        console.info("Logging out...");
        await this.communicationService
            .getPrevNeighborRemote()
            .nodeMissing(this.address);
        await this.communicationService
            .getNextNeighborRemote()
            .election({ id: UNKNOWN_ELECTION_ID });
        console.info("Logged out, exiting...");
        Deno.exit();
    }

    /**
     * Repairs topology when one of the node dies.
     * Rebuilds the ring and start election of a new leader if the old one died.
     * Expects that only one node dies and other can die after topology is repaired.
     */
    private async repairTopology(missingNode: Address) {
        if (this.repairRunning === false) {
            this.repairRunning = true;
            await this.receiver.nodeMissing(missingNode);
            console.info(
                `Topology was repaired - ${JSON.stringify(this.systemInfo)}`
            );
            this.repairRunning = false;
            if (isEqual(missingNode, this.systemInfo.leader)) {
                // leader is dead => start election
                await this.receiver.election({ id: UNKNOWN_ELECTION_ID });
            }
        }
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
            let commandLineData = e.data as string;
            // sanitize the given string
            commandLineData = commandLineData.replace("\r", "");
            if (!this.commandHandler) {
                throw new Error(
                    "Command handler has not been initialized yet."
                );
            }
            this.commandHandler.handle(commandLineData);
        };
    }
}
