import { logger, LogCategory } from "@automaton/logger";
import { interactionCreate } from "./interaction-create";
import { messageCreate } from "./message-create";
import { ready } from "./ready";

export default [ready, messageCreate, interactionCreate].map((event) => {
  const callback = event.callback;

  event.callback = async (...args: Parameters<typeof callback>) => {
    logger.info(`Event<${event.event}>`, { category: LogCategory.Client });

    try {
      await callback(...(args as unknown as never[]));
    } catch (error) {
      logger.error(error as Error, { category: LogCategory.Client });
    }
  };

  return event;
});
