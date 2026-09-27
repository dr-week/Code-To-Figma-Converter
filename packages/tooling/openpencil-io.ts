// Stable entrypoint: keep editor-specific implementation inside openpencil/.
export { computeAssetHash } from "./openpencil/asset-hash";
export {
  OPENPENCIL_ADAPTER_INFO,
  OPENPENCIL_ADAPTER_VERSION,
  type OpenPencilAdapterInfo,
} from "./openpencil/compatibility";
export { convertSceneToOpenPencilGraph } from "./openpencil/scene-adapter";
export {
  exportSceneToOpenPencilFig,
  exportGraphToOpenPencilFig,
  parseOpenPencilFig,
} from "./openpencil/native-io";
