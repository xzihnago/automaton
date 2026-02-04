export type {};
declare global {
  interface String {
    parseSeconds(): number;
  }
}

String.prototype.parseSeconds = function () {
  const timeScale = [1, 60, 3600, 86400] as const;

  if (!/^(\d{1,2}:){0,3}\d{1,2}$/.test(this as string)) {
    throw new TypeError(
      `Invalid time format: "${this as string}" not satisfied [[[day:]hour:]minute:]second`,
    );
  }

  return this.split(":").reduceRight(
    (acc, cur, i) => acc + Number(cur) * timeScale[i],
    0,
  );
};
