import { JsonObject } from "../../deps.ts";

export default interface Address extends JsonObject {
    hostname: string;
    port: number;
}
