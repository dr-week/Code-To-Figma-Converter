<script setup lang="ts">
import type { ConversionResult } from '../types';
defineProps<{ result: ConversionResult }>();
</script>

<template>
  <section class="result" aria-live="polite">
    <div class="success-mark">✓</div>
    <div><p class="eyebrow">Package ready</p><h2>Native .fig generated</h2><p class="path">{{ result.packageDir }}</p></div>
    <dl>
      <div><dt>Layers</dt><dd>{{ result.nodes }}</dd></div>
      <div><dt>Mappings</dt><dd>{{ result.mappings }}</dd></div>
      <div><dt>Images</dt><dd>{{ result.images }}</dd></div>
      <div><dt>Warnings</dt><dd>{{ result.warnings }}</dd></div>
    </dl>
    <a class="download" :href="result.downloadUrl">Download original.fig <span>↓</span></a>
    <p class="note">Open the file in unmodified OpenPencil to verify editing and rendering. Editor persistence is still unverified.</p>
  </section>
</template>
