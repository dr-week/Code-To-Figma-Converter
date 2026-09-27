# Local conversion UI

This Vue 3 + TypeScript application is the presentation layer for the existing converter. It detects a local Nuxt/Vue or React project, accepts one running localhost interface and generates the native `.fig` package through `buildMilestone1Package`.

Run the source app and UI in separate terminals:

```powershell
pnpm dev:vue
pnpm ui
```

Open `http://127.0.0.1:4310`, enter the project folder, choose **Detect**, verify the capture settings and choose **Generate design file**. The result provides the package path and a download for `original.fig`.

The UI does not implement conversion logic and does not import OpenPencil. `server/conversion-api.ts` validates local requests and delegates to the tooling package. Direct OpenPencil dependencies remain inside `packages/tooling/openpencil/`.

Current scope is one running local Vue page and an OpenPencil-compatible native `.fig` output. The generated file still requires verification in the unmodified editor. Figma remains inactive reference code and is not presented as a verified target.
