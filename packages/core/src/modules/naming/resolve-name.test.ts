import { expect, it } from 'vitest';
import { resolveName } from './resolve-name';
it('preserves explicit names verbatim', () => expect(resolveName('Checkout / Primary', 'BUTTON', 2)).toEqual({ name: 'Checkout / Primary', nameOrigin: 'explicit' }));
it('labels generated names as inferred', () => expect(resolveName(null, 'BUTTON', 2).nameOrigin).toBe('inferred'));
it('rejects invalid supplied names rather than silently renaming', () => expect(() => resolveName('', 'BUTTON', 2)).toThrow());
