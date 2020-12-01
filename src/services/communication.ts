import Address from "../interfaces/address.ts";
import Node from "../model/node.ts";
import { createRemote } from "../../deps.ts";

export default class CommunicationService {
    constructor(private node: Node) {}

    getLeaderRemote() {
        return this.getRemote(this.node.systemInfo.leader);
    }

    getNextNeighborRemote() {
        return this.getRemote(this.node.systemInfo.nextNeighbor);
    }

    getNNextNeighborRemote() {
        return this.getRemote(this.node.systemInfo.nnextNeighbor);
    }

    getPrevNeighborRemote() {
        return this.getRemote(this.node.systemInfo.prevNeighbor);
    }

    getRemote(address: Address) {
        return createRemote(`http://${address.hostname}:${address.port}`);
    }
}
