import Neighbors from "./neighbors.ts";
import Address from "./address.ts";

export default interface Receiver {
    join(addr: Address): Neighbors;
    changNNext(addr: Address): void;
    changPrev(addr: Address): Address;
    nodeMissing(addr: Address): void;
    election(id: number): void;
    elected(id: number, leaderAddr: Address): void;
}
