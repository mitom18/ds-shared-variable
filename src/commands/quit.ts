import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "quit",
    execute: () => {
        console.log("Closing the application...");
        Deno.exit();
    },
});
