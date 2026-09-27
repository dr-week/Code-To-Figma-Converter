export function resolveName(explicit: string | null, tag: string, ordinal: number) {
  if (explicit !== null) {
    if (explicit.length === 0 || explicit.length > 300 || Array.from(explicit).some(character => character.charCodeAt(0) < 32)) throw new Error('Invalid explicit layer name');
    return { name: explicit, nameOrigin: 'explicit' as const };
  }
  return { name: `${tag.toLowerCase()}/${ordinal}`, nameOrigin: 'inferred' as const };
}
