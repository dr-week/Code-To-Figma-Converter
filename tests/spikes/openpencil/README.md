# Isolated OpenPencil compatibility probe

This dependency island tests published npm 0.14.0 artifacts without adding editor packages to the converter. Its package-lock.json records tarball URLs and integrity hashes. It does not claim those artifacts were built from the separately inspected upstream commit.

From the repository root:

```sh
npm ci --prefix tests/spikes/openpencil --ignore-scripts --no-audit --no-fund
pnpm exec vitest run tests/spikes/openpencil-probe.test.ts
pnpm typecheck
node --import tsx --input-type=module -e "const {runProbe}=await import('./tests/spikes/openpencil/probe.ts'); console.log(await runProbe())"
```

The probe writes `.artifacts/openpencil-spike/probe.fig` and `result.json`. These are disposable compatibility evidence, not milestone backup packages. The PNG is a full fixture asset, not a PNG header. The probe invokes real upstream export, archive parse and scene parse functions and reads the saved bytes from disk. Metadata uses the upstream pluginData field. Native IDs are measured rather than treated as stable source anchors.

The root TypeScript check includes probe.ts and checks its upstream API calls. Core's broad entrypoint was also imported manually; the repeatable probe uses its public, narrower `@open-pencil/core/io/formats/fig` entrypoint. Browser-specific DOM conversion and editor rendering are not exercised here. All six direct OpenPencil package manifests declare MIT; their transitive dependencies have separate licenses recorded in the lockfile. Install scripts are disabled.
