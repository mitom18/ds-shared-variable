import IReceiver from "../interfaces/receiver.ts";
import Address, { isEqual } from "../interfaces/address.ts";
import Node from "../model/node.ts";
import SystemInfo from "../interfaces/systemInfo.ts";

export default class Receiver implements IReceiver {
    constructor(private node: Node) {}

    async join(addr: Address) {
        console.log(`Join was called with addr ${addr.hostname}:${addr.port}.`);
        if (isEqual(addr, this.node.address)) {
            console.log("Joining myself...");
            return this.node.systemInfo;
        } else {
            console.log("Someone else is joining...");
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
        console.log("Change nnext was called...");
        this.node.systemInfo.nnextNeighbor = addr;
    }
    changPrev(addr: Address): Address {
        console.log("Change previous was called...");
        this.node.systemInfo.prevNeighbor = addr;
        return this.node.systemInfo.nextNeighbor;
    }
    async nodeMissing(addr: Address) {
        console.log(`Node missing was called with address ${addr}...`);
        if (!isEqual(addr, this.node.systemInfo.nextNeighbor)) {
            // not for me, forward message to my next
            this.node.communicationService
                .getNextNeighborRemote()
                .nodeMissing(addr);
            return;
        }
        // my next is missing
        this.node.systemInfo.nnextNeighbor = (await this.node.communicationService
            .getNNextNeighborRemote()
            .changPrev(this.node.address)) as Address;
        this.node.systemInfo.nextNeighbor = this.node.systemInfo.nnextNeighbor;
        this.node.communicationService
            .getPrevNeighborRemote()
            .changeNNext(this.node.systemInfo.nextNeighbor);
        console.log("Node missing done.");
    }
    election(arg: { id: string }) {
        console.log(`Election was called with id ${arg.id}...`);
        if (this.node.id === arg.id) {
            // I am the leader
            this.node.communicationService
                .getNextNeighborRemote()
                .elected({ id: arg.id, leaderAddr: this.node.address });
            return;
        }
        let voteFor: string;
        if (this.node.id > arg.id && this.node.voting === false) {
            voteFor = this.node.id;
        } else {
            voteFor = arg.id;
        }
        this.node.voting = true;
        this.node.communicationService
            .getNextNeighborRemote()
            .election({ id: voteFor });
    }
    elected(arg: { id: string; leaderAddr: Address }) {
        console.log(`Elected was called with id ${arg.id}...`);
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
    writeVariable(arg: { value: any }) {
        if (isEqual(this.node.systemInfo.leader, this.node.address)) {
            this.node.sharedVariable = arg.value;
        }
    }
}
