import Address from "../interfaces/address.ts";

export default interface Neighbors {
    next: Address;
    nnext: Address;
    prev: Address;
}
