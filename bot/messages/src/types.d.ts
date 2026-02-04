import type { Awaitable, Message } from "discord.js";

interface ChatCommand<InGuild extends boolean = boolean> {
  pattern: RegExp;
  name: string;
  callback: (message: Message<InGuild>) => Awaitable<void>;
}
