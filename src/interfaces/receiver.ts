import SystemInfo from "./systemInfo.ts";
import Address from "./address.ts";

export default interface Receiver {
    join(addr: Address): Promise<SystemInfo>;
    changNNext(addr: Address): void;
    changPrev(addr: Address): Address;
    nodeMissing(addr: Address): Promise<void>;
    election(arg: { id: string }): void;
    elected(arg: { id: string; leaderAddr: Address }): void;
    readVariable(): any;
    writeVariable(arg: { value: any }): void;
}
