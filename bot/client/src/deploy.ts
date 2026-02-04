import { inspect } from "util";
import {
  type APIUser,
  type SharedNameAndDescription,
  REST,
  Routes,
} from "discord.js";
import "@automaton/extension";
import { logger, LogCategory } from "@automaton/logger";
import commands from "@automaton/interactions";

const putApplicationCommands = async (
  user: APIUser,
  body: SharedNameAndDescription[],
  guildId?: string,
) => {
  const scope = guildId ?? "global";

  const route = guildId
    ? Routes.applicationGuildCommands(user.id, guildId)
    : Routes.applicationCommands(user.id);

  logger.info(
    `Put application commands (${scope})\n${inspect(body.map((v) => v.name))}`,
    { category: LogCategory.Deploy },
  );

  await rest.put(route, { body });
};

logger.info("Create REST", { category: LogCategory.Deploy });
const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? "");

const user = (await rest.get(Routes.user())) as APIUser;
logger.info(`Get User(${user.id})`, { category: LogCategory.Deploy });

const builders = {
  global: [
    commands.help.definition,
    commands.ping.definition,
    commands.turntable.definition,
    commands.voice.definition,
    commands.player.definition,
    commands.panel.definition,
    commands.play.definition,
  ],
  $558806955380965386: [commands.debug.definition],
};
await Promise.all([
  putApplicationCommands(user, builders.global),
  putApplicationCommands(
    user,
    builders.$558806955380965386,
    "558806955380965386",
  ),
]);

logger.info(`Complete`, {
  category: LogCategory.Deploy,
});
