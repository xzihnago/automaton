export {};
declare module "discord.js" {
  interface Client {
    commands: Record<string, SlashCommand>;
  }
}
