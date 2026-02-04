import type {
  Awaitable,
  Snowflake,
  Collection,
  CacheType,
  Client,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  CollectedInteraction,
  SharedNameAndDescription,
} from "discord.js";

type TInitialize = (client: Client<true>) => Awaitable<void>;

type Autocomplete<Cached extends CacheType = CacheType> = (
  interaction: AutocompleteInteraction<Cached>,
) => Awaitable<void>;

type ChatInputCommand<Cached extends CacheType = CacheType> = (
  interaction: ChatInputCommandInteraction<Cached>,
) => Awaitable<void>;

type MessageComponent<Cached extends CacheType = CacheType> = (
  interaction: MessageComponentInteraction<Cached>,
) => Awaitable<void>;

type TCollectorEnd<Interaction extends CollectedInteraction> = (
  collected: Collection<Snowflake, Interaction>,
  reason: string,
) => Awaitable<void>;

declare global {
  interface SlashCommand<Cached extends CacheType = CacheType> {
    definition: SharedNameAndDescription;
    chatInputCommand: ChatInputCommand<Cached>;
    initialize?: TInitialize;
    autocomplete?: Autocomplete<Cached>;
    messageComponent?: MessageComponent<Cached>;
  }
}
