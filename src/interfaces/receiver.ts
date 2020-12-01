import SystemInfo from "./systemInfo.ts";
import Address from "./address.ts";

export default interface Receiver {
    join(addr: Address): SystemInfo;
    changNNext(addr: Address): void;
    changPrev(addr: Address): Address;
    nodeMissing(addr: Address): void;
    election(arg: { id: string }): void;
    elected(arg: { id: string; leaderAddr: Address }): void;
}
