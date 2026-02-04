import { Platform, Types } from "youtubei.js";

Platform.shim.eval = async (
  data: Types.BuildScriptResult,
  env: Record<string, Types.VMPrimative>,
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n.toString()}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig.toString()}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(", ")} }`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  return new Function(code)();
};
