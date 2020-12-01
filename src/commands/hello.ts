import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "hello",
    execute: async () => {
        const node = await Node.getInstance();
        const remote = node.communicationService.getNextNeighborRemote();
        try {
            const hello = await remote.sayHello(["heo"]);
            console.log(hello);
        } catch (error) {
            console.error(error);
        }
    },
});
