import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "info",
    execute: async () => {
        const node = await Node.getInstance();
        node.printStatus();
    },
});
