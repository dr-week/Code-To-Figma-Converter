# Naming and source traceability

Prototype status, 2026-09-12: explicit names and generated tag/ordinal names exist. Full source-file/component metadata and persistent project linkage remain unimplemented. The rules below describe the target contract, not all current capabilities.

## Resolution order

1. Explicit `data-figma-name`: exact supplied name, preserved verbatim.
2. Verified development-build instrumentation: source component or element metadata, labeled with its origin.
3. Configured DOM ID/test ID mapping: exact DOM identifier, not claimed to be a source symbol.
4. Semantic fallback such as `Button / Save`: generated and labeled inferred.
5. Tag plus stable capture-local ordinal: generated fallback only.

Example input:

```tsx
<button data-figma-id="checkout-submit" data-figma-name="Checkout/SubmitButton">
  Pay now
</button>
```

The same attributes can be used on a Vue template's native element. A React custom component must forward annotations to the intended DOM element. Vue fragments and attribute inheritance also need explicit handling; putting an attribute on a component does not guarantee a unique rendered target.

## Identity contract

Store `sourceId`, `instanceId`, `name`, `nameOrigin` and optional project-relative source location separately. Repeated source components need stable instance keys supplied by annotations or fixture data. Array indexes and AST source offsets are not stable across arbitrary edits; label their stability scope honestly.

Duplicate explicit instance IDs are an error, not a reason to append a hidden random suffix. Duplicate layer names are allowed. Exact names must not be normalized, translated or inferred by an LLM. Validate control characters/size limits and surface unsupported values rather than silently changing them.

## Instrumentation stages

First use annotations on native elements in a Vue template to prove the contract. Consider a Vue compiler adapter only if the selected source-traceability task requires it. A React-specific transform is not in the active roadmap. Record source file, symbol and element location only when known; never infer exact provenance from DOM appearance.

Source maps alone do not map every rendered element to its owning component. Handle fragments, repeated roots, portals/teleports, slots, higher-order wrappers and third-party components through explicit support cases. Unsupported associations remain unknown. Do not depend on private React or Vue runtime internals.

## Acceptance

All explicit valid names in supported fixtures survive import unchanged. Every imported node has an origin category. Repeated instances stay distinct; source offsets changing do not masquerade as durable identity. Report exact, inferred and unknown naming coverage separately.
