export default interface Command {
    name: string;
    execute(...args: any): Promise<void>;
}
