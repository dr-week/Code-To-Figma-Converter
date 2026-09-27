// Stable library and command entrypoint.
export { buildMilestone1Package } from "./milestone/build-package";
export type { BuildMilestonePackageOptions } from "./milestone/types";

if (process.argv[1]?.endsWith("milestone1.ts")) {
  const { runMilestoneFixture } = await import("./milestone/run-fixture");
  await runMilestoneFixture();
}
