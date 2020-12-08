/**
 * Interface to represent a command that can be executed via command line interface.
 * Contains unique name of the command and method with the actual functionality.
 */
export default interface Command {
    name: string;
    execute(...args: any): Promise<void>;
}
