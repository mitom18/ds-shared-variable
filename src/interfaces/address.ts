import { JsonObject } from "../../deps.ts";

/**
 * Interface to represent IP address. Contains hostname and port.
 * Implements JsonObject because of being used in JSON-RPC methods.
 */
export default interface Address extends JsonObject {
    hostname: string;
    port: number;
}

/**
 * Performs deep comparison of given addresses.
 * @param {Address} a - The first Address to compare.
 * @param {Address} b - The second Address to compare.
 * @returns {boolean} - True when both addresses have equal hostname and port, false otherwise.
 */
export const isEqual = (a: Address, b: Address): boolean => {
    return a.hostname === b.hostname && a.port === b.port;
};
