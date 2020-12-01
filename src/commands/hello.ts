import Node from "../model/node.ts";
import CommandHandler from "../services/commandHandler.ts";
import { createRemote } from "../../deps.ts";

CommandHandler.addCommand({
    name: "hello",
    execute: async () => {
        const node = await Node.getInstance();
        const remote = createRemote(
            `http://${node.address.hostname}:${node.address.port}`
        );
        const hello = await remote.sayHello(["heo"]);
        console.log(hello);
    },
});
