import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  inlineCode,
} from "discord.js";

export const debug: SlashCommand = {
  definition: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Debug: action")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test-uncaught-exception")
        .setDescription("Debug: throw uncaught error")
        .addBooleanOption((option) =>
          option
            .setName("silent")
            .setDescription("Whether to silence the reply"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test-unhandled-rejection")
        .setDescription("Debug: reject unhandled error")
        .addBooleanOption((option) =>
          option
            .setName("silent")
            .setDescription("Whether to silence the reply"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test-exception")
        .setDescription("Debug: throw error")
        .addBooleanOption((option) =>
          option
            .setName("silent")
            .setDescription("Whether to silence the reply"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test-rejection")
        .setDescription("Debug: reject error")
        .addBooleanOption((option) =>
          option
            .setName("silent")
            .setDescription("Whether to silence the reply"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("test-interaction-timeout")
        .setDescription("Debug: test interaction timeout")
        .addBooleanOption((option) =>
          option
            .setName("silent")
            .setDescription("Whether to silence the reply"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send-message")
        .setDescription("Debug: send a message")
        .addStringOption((option) =>
          option
            .setName("guild-id")
            .setDescription("The guild ID to send the message to")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("channel-id")
            .setDescription("The channel ID to send the message to")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("content")
            .setDescription("The content of the message")
            .setRequired(true),
        ),
    ),

  async chatInputCommand(interaction) {
    switch (interaction.options.getSubcommand(true)) {
      case "test-uncaught-exception":
        if (!interaction.options.getBoolean("silent", true)) {
          await interaction.reply({
            content: `debug: ${inlineCode("test-uncaught-exception")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setTimeout(() => {
          throw new Error("Debug Test Error");
        });
        return;

      case "test-unhandled-rejection":
        if (!interaction.options.getBoolean("silent", true)) {
          await interaction.reply({
            content: `debug: ${inlineCode("test-unhandled-rejection")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
        setTimeout(() => {
          void Promise.reject(new Error("Debug Test Error"));
        });
        return;

      case "test-exception":
        if (!interaction.options.getBoolean("silent", true)) {
          await interaction.reply({
            content: `debug: ${inlineCode("test-exception")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
        throw new Error("Debug Test Error");

      case "test-rejection":
        if (!interaction.options.getBoolean("silent", true)) {
          await interaction.reply({
            content: `debug: ${inlineCode("test-rejection")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
        await Promise.reject(new Error("Debug Test Error"));
        return;

      case "test-interaction-timeout":
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!interaction.options.getBoolean("silent", true)) {
          await interaction.reply({
            content: `debug: ${inlineCode("test-interaction-timeout")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
        return;

      case "send-message": {
        const guildId = interaction.options.getString("guild-id", true);
        const channelId = interaction.options.getString("channel-id", true);
        const content = interaction.options.getString("content", true);

        const guild = interaction.client.guilds.resolve(guildId);
        if (!guild) {
          await interaction.reply({
            content: `debug: ${inlineCode("send-message")} > ${inlineCode("guild not found")}`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const channel = guild.channels.resolve(channelId);
        if (channel?.isTextBased()) {
          await channel.send(content);
          await interaction.reply({
            content: `debug: ${inlineCode("send-message")} > ${inlineCode("success")}`,
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: `debug: ${inlineCode("send-message")} > ${inlineCode("channel not found or not text based")}`,
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }
  },
};
