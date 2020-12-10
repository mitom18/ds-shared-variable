import IReceiver, { UNKNOWN_ELECTION_ID } from "../interfaces/receiver.ts";
import Address, { isEqual } from "../interfaces/address.ts";
import Node from "../model/node.ts";
import SystemInfo from "../interfaces/systemInfo.ts";

export default class Receiver implements IReceiver {
    constructor(private node: Node) {}

    async join(addr: Address) {
        console.info(
            `Join was called with addr ${addr.hostname}:${addr.port}.`
        );
        if (isEqual(addr, this.node.address)) {
            console.info("Joining myself...");
            return this.node.systemInfo;
        } else {
            console.info("Someone else is joining...");
            const systemInfo = this.node.systemInfo;
            const initialNext: Address = {
                hostname: systemInfo.nextNeighbor.hostname,
                port: systemInfo.nextNeighbor.port,
            };
            const initialPrev: Address = {
                hostname: systemInfo.prevNeighbor.hostname,
                port: systemInfo.prevNeighbor.port,
            };
            const tmpSystemInfo: SystemInfo = {
                nextNeighbor: systemInfo.nextNeighbor,
                nnextNeighbor: systemInfo.nnextNeighbor,
                prevNeighbor: this.node.address,
                leader: systemInfo.leader,
            };
            // send change previous to my next
            await this.node.communicationService
                .getNextNeighborRemote()
                .changPrev(addr);
            // send change nnext to my prev
            await this.node.communicationService
                .getRemote(initialPrev)
                .changNNext(addr);
            tmpSystemInfo.nnextNeighbor = systemInfo.nnextNeighbor;
            // handle myself
            systemInfo.nnextNeighbor = initialNext;
            systemInfo.nextNeighbor = addr;

            return tmpSystemInfo;
        }
    }
    changNNext(addr: Address) {
        console.info("Change nnext was called...");
        this.node.systemInfo.nnextNeighbor = addr;
    }
    changPrev(addr: Address): Address {
        console.info("Change previous was called...");
        this.node.systemInfo.prevNeighbor = addr;
        return this.node.systemInfo.nextNeighbor;
    }
    async nodeMissing(addr: Address) {
        console.info(
            `Node missing was called with address ${addr.hostname}:${addr.port}...`
        );
        if (!isEqual(addr, this.node.systemInfo.nextNeighbor)) {
            // not for me, forward message to my next
            await this.node.communicationService
                .getNextNeighborRemote()
                .nodeMissing(addr);
            return;
        }
        // my next is missing
        this.node.systemInfo.nextNeighbor = this.node.systemInfo.nnextNeighbor;
        this.node.systemInfo.nnextNeighbor = (await this.node.communicationService
            .getNNextNeighborRemote()
            .changPrev(this.node.address)) as Address;
        await this.node.communicationService
            .getPrevNeighborRemote()
            .changNNext(this.node.systemInfo.nextNeighbor);
        console.info("Node missing done.");
    }
    async election(arg: { id: string }) {
        console.info(`Election was called with id ${arg.id}...`);
        if (this.node.id === arg.id) {
            // I am the leader
            await this.node.communicationService
                .getNextNeighborRemote()
                .elected({ id: arg.id, leaderAddr: this.node.address });
            return;
        }
        let voteFor: string;
        if (
            arg.id === UNKNOWN_ELECTION_ID ||
            (this.node.sharedVariable !== null && this.node.voting === false)
        ) {
            voteFor = this.node.id;
        } else {
            voteFor = arg.id;
        }
        this.node.voting = true;
        await this.node.communicationService
            .getNextNeighborRemote()
            .election({ id: voteFor });
    }
    elected(arg: { id: string; leaderAddr: Address }) {
        console.info(`Elected was called with id ${arg.id}...`);
        this.node.systemInfo.leader = arg.leaderAddr;
        if (this.node.id !== arg.id) {
            this.node.communicationService.getNextNeighborRemote().elected(arg);
        }
    }
    readVariable() {
        if (isEqual(this.node.systemInfo.leader, this.node.address)) {
            return this.node.sharedVariable;
        }
    }
    async writeVariable(arg: { value: any; isBackup: boolean }) {
        if (
            arg.isBackup ||
            isEqual(this.node.systemInfo.leader, this.node.address)
        ) {
            this.node.sharedVariable = arg.value;
            if (!arg.isBackup) {
                await this.node.communicationService
                    .getNextNeighborRemote()
                    .writeVariable({ value: arg.value, isBackup: true });
            }
        }
    }
}
