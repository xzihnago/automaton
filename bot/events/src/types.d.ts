import type { Awaitable, ClientEvents } from "discord.js";

interface BotEvents<K extends keyof ClientEvents> {
  once: boolean;
  event: K;
  callback: (...args: ClientEvents[K]) => Awaitable<void>;
}
