import { Message } from "discord.js";

declare module "discord.js" {
  interface Message {
    getColor(): ColorResolvable;
  }
}

Message.prototype.getColor = function () {
  return this.member?.displayColor ?? this.author.accentColor ?? 0;
};
