export {};
declare global {
  interface Array<T> {
    awaitAll(): Promise<Awaited<T>[]>;
  }
}

Array.prototype.awaitAll = function () {
  return Promise.all(this);
};
