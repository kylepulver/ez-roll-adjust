import { ChatAdjustApplication } from "./app.js";

console.log("EZ Roll Adjust | Loaded");

const getMessage = (html) => {
    return game.messages.get($(html).data("messageId"))
}

Hooks.on("getChatLogEntryContext", (application, entryOptions) => {
    entryOptions.push({
        name: "Adjust Roll",
        condition: li => {
            const message = getMessage(li);
            return message.isOwner || game.user.isGM;
        },
        icon: `<i class="fas fa-pen"></i>`,
        callback: async li => {
            const message = getMessage(li);
            new ChatAdjustApplication(message).render(true)
        }
    })
})