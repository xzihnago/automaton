import type { LogMeta } from "./types";
import { prisma } from "@automaton/database";
import { LogLevel } from "./enums";

export class Logger {
  private debugLog(level: number, message: string) {
    enum AnsiColor {
      RESET = "\x1b[0m", // Reset
      TIME = "\x1b[2m", // Faint
      DEBUG = "\x1b[34m", // Blue
      INFO = "\x1b[32m", // Green
      WARN = "\x1b[33m", // Yellow
      ERROR = "\x1b[31m", // Red
    }

    if (process.env.DEBUG) {
      const logLevel = LogLevel[level] as keyof typeof AnsiColor;
      const coloredTime = `${AnsiColor.TIME}${new Date().toISOString()}${AnsiColor.RESET}`;
      const coloredLevel = `${AnsiColor[logLevel]}${logLevel.padEnd(5)}${AnsiColor.RESET}`;

      console.log(coloredTime, coloredLevel, message);
    }
  }

  async log(level: number, message: string, meta?: LogMeta) {
    this.debugLog(level, message);

    await prisma.log
      .create({
        data: {
          level,
          message,
          ...meta,
        },
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }

  debug(message: string, meta?: LogMeta) {
    void this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: LogMeta) {
    void this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: LogMeta) {
    void this.log(LogLevel.WARN, message, meta);
  }

  error(message: string | Error, meta?: LogMeta) {
    if (message instanceof Error) {
      void this.log(LogLevel.ERROR, message.stack ?? message.message, meta);
    } else {
      void this.log(LogLevel.ERROR, message, meta);
    }
  }
}
