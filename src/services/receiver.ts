import IReceiver from "../interfaces/receiver.ts";
import Address from "../interfaces/address.ts";
import Neighbors from "../interfaces/neighbors.ts";

export default class Receiver implements IReceiver {
    join(addr: Address): Neighbors {
        throw new Error("Not implemented yet");
    }
    changNNext(addr: Address) {
        throw new Error("Not implemented yet");
    }
    changPrev(addr: Address): Address {
        throw new Error("Not implemented yet");
    }
    nodeMissing(addr: Address) {
        throw new Error("Not implemented yet");
    }
    election(id: number) {
        throw new Error("Not implemented yet");
    }
    elected(id: number, leaderAddr: Address) {
        throw new Error("Not implemented yet");
    }
}
