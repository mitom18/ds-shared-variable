import Command from "../interfaces/command.ts";
import { importDirectory } from "../utils/directory.ts";

export default class CommandHandler {
    static commands = [] as Command[];

    static addCommand = (command: Command) => {
        CommandHandler.commands.push(command);
    };

    static async build() {
        await importDirectory(Deno.realPathSync("./src/commands"));
        return new CommandHandler();
    }

    private constructor() {}

    handle = (commandName: string) => {
        const command = CommandHandler.commands.find((c) => {
            return c.name === commandName;
        });

        if (!command) {
            console.error(`Command with name '${commandName}' was not found.`);
            return;
        }

        console.log(`Running command with name '${commandName}'.`);
        command.execute();
    };
}
