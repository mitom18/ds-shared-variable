import SystemInfo from "./systemInfo.ts";
import Address from "./address.ts";

/**
 * Describes methods of the receiver.
 * Parameters of the methods must be JSON objects, because methods are used as JSON-RPC methods.
 */
export default interface Receiver {
    join(addr: Address): Promise<SystemInfo>;
    changNNext(addr: Address): void;
    changPrev(addr: Address): Address;
    nodeMissing(addr: Address): Promise<void>;
    election(arg: { id: string }): Promise<void>;
    elected(arg: { id: string; leaderAddr: Address }): void;
    readVariable(): any;
    writeVariable(arg: { value: any; isBackup: boolean }): Promise<void>;
}

/**
 * Used in election functionality as value to start the election process.
 */
export const UNKNOWN_ELECTION_ID = "unknown";
