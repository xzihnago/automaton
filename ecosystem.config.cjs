module.exports = {
  apps: [
    {
      name: "automaton",
      script: "bot/client/src/index.ts",
      interpreter: "node",
      interpreterArgs: "--import tsx",
    },
  ],
};
