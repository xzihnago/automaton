import $558806955380965386 from "./558806955380965386";
import general from "./general";
import music from "./music";

const commands = {
  ...$558806955380965386,
  ...music,
  ...general,
} as Record<string, SlashCommand>;

export default commands;
