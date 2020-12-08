import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "read",
    execute: async () => {
        const node = await Node.getInstance();
        const value = await node.readSharedVariable();
        console.info(`Variable equals to '${value}'.`);
    },
});
