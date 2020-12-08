import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "write",
    execute: async (valueToWrite: any) => {
        const node = await Node.getInstance();
        await node.writeSharedVariable(valueToWrite);
        console.info(`Written variable '${valueToWrite}'.`);
    },
});
