import { JsonObject } from "../../deps.ts";
import Address from "../interfaces/address.ts";

export default interface SystemInfo extends JsonObject {
    nextNeighbor: Address;
    nnextNeighbor: Address;
    prevNeighbor: Address;
    leader: Address;
}
