/** Single declared OpenPencil integration version. Update only after compatibility verification. */
export const OPENPENCIL_ADAPTER_VERSION = '0.14.0' as const;

export const OPENPENCIL_ADAPTER_INFO = {
  version: OPENPENCIL_ADAPTER_VERSION,
  format: 'fig',
  extension: '.fig',
} as const;

export type OpenPencilAdapterInfo = typeof OPENPENCIL_ADAPTER_INFO;
