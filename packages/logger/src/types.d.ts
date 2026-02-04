import type { LogCategory } from "./enums";

interface LogMeta {
  category?: LogCategory;
  guildId?: string | null;
  channelId?: string | null;
  userId?: string | null;
}
