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

    handle = (commandLineData: string) => {
        const parts = commandLineData.split(" ").filter((s) => s !== "");

        if (!parts.length) {
            console.error(`No command name given.`);
            return;
        }

        const commandName = parts[0];
        const command = CommandHandler.commands.find((c) => {
            return c.name === commandName;
        });

        if (!command) {
            console.error(`Command with name '${commandName}' was not found.`);
            return;
        }

        console.log(`Running command with name '${commandName}'.`);
        if (parts.length > 1) {
            command.execute(...parts.slice(1, parts.length));
        } else {
            command.execute();
        }
    };
}
