import type { Awaitable, Client } from "discord.js";

interface Task {
  name: string;
  cron: string;
  callback: (client: Client<true>) => Awaitable<void>;
}
