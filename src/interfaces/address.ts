import { JsonObject } from "../../deps.ts";

export default interface Address extends JsonObject {
    hostname: string;
    port: number;
}

export const isEqual = (a: Address, b: Address) => {
    return a.hostname === b.hostname && a.port === b.port;
};
