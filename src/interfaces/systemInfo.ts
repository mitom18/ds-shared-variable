import { JsonObject } from "../../deps.ts";
import Address from "../interfaces/address.ts";

/**
 * Interface to represent info about system, that has every node.
 * Contains addresses of the leader and the next, the previous and the next-next neighbor.
 * Implements JsonObject because of being used in JSON-RPC methods.
 */
export default interface SystemInfo extends JsonObject {
    nextNeighbor: Address;
    nnextNeighbor: Address;
    prevNeighbor: Address;
    leader: Address;
}
