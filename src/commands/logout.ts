import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "logout",
    execute: async () => {
        const node = await Node.getInstance();
        await node.logout();
    },
});
