export default interface Command {
    name: string;
    execute(): void;
}
