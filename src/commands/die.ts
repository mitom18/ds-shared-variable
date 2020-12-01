import CommandHandler from "../services/commandHandler.ts";

CommandHandler.addCommand({
    name: "die",
    execute: () => {
        console.warn("Warning! Application will be terminated.");
        Deno.exit();
    },
});
