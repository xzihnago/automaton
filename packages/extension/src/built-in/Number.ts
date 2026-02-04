export type {};
declare global {
  interface Number {
    toTimeString(hours?: boolean): string;
  }
}

Number.prototype.toTimeString = function (hours) {
  const seconds = Math.floor(this as number);

  const time = [Math.floor(seconds / 60), seconds % 60];
  if (hours) {
    time[0] %= 60;
    time.unshift(Math.floor(seconds / 3600));
  }

  return time.map((t) => t.toString().padStart(2, "0")).join(":");
};
