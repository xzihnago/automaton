import type { BotEvents } from "./types.js";
import {
  Events,
  InteractionType,
  ComponentType,
  MessageFlags,
} from "discord.js";
import { logger, LogCategory } from "@automaton/logger";
import commands from "@automaton/interactions";

export const interactionCreate: BotEvents<Events.InteractionCreate> = {
  once: false,
  event: Events.InteractionCreate,
  callback: async (interaction) => {
    logger.debug(InteractionType[interaction.type], {
      category: LogCategory.Interaction,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      userId: interaction.user.id,
    });

    try {
      if (interaction.isAutocomplete()) {
        const commandName = interaction.commandName;
        const command = commands[commandName];
        logger.info(
          `${InteractionType[interaction.type]} -> "${commandName}"`,
          {
            category: LogCategory.Interaction,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
          },
        );

        await command.autocomplete?.(interaction as never);
      } else if (interaction.isChatInputCommand()) {
        const commandName = interaction.commandName;
        const command = commands[commandName];
        logger.info(
          `${InteractionType[interaction.type]} -> "${commandName}"`,
          {
            category: LogCategory.Interaction,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
          },
        );

        await command.chatInputCommand(interaction as never);
      } else if (interaction.isMessageComponent()) {
        const commandName = interaction.customId.split(".")[0];
        const command = commands[commandName];
        logger.info(
          `${InteractionType[interaction.type]}<${ComponentType[interaction.componentType]}> -> "${interaction.customId}"`,
          {
            category: LogCategory.Interaction,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
          },
        );

        await command.messageComponent?.(interaction as never);
      }
    } catch (error) {
      logger.error(error as Error, {
        category: LogCategory.Interaction,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        userId: interaction.user.id,
      });

      if (interaction.isAutocomplete()) return;

      const embed = interaction
        .diagnostic()
        .setColor(0xdc3545)
        .setTitle("Error")
        .setDescription(
          `\`${(error as Error).name}: ${(error as Error).message}\``,
        );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
