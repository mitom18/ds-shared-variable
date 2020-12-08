/**
 * Configuration of the node. Node must get its hostname (ip) and port.
 * Hostname (ip) and port of other node to connect to are optional.
 * When not specified, node will be the only one in the DS.
 */
export default interface NodeConfig {
    ip: string;
    port: number;
    otherIp?: string;
    otherPort?: number;
}
