<script setup lang="ts">
import type { ConversionForm } from '../types';

const props = defineProps<{ modelValue: ConversionForm; busy: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: ConversionForm]; submit: [] }>();
function update<K extends keyof ConversionForm>(key: K, value: ConversionForm[K]): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<template>
  <form class="form" @submit.prevent="emit('submit')">
    <div class="section-heading"><span>02</span><div><h2>Capture page</h2><p>The selected project must already be running locally.</p></div></div>
    <label class="field field-wide"><span>Local app URL</span><input :value="modelValue.url" required type="url" @input="update('url', ($event.target as HTMLInputElement).value)" /></label>
    <div class="row">
      <label class="field"><span>Root selector</span><input :value="modelValue.selector" required @input="update('selector', ($event.target as HTMLInputElement).value)" /></label>
      <label class="field"><span>Project name</span><input :value="modelValue.projectId" required @input="update('projectId', ($event.target as HTMLInputElement).value)" /></label>
    </div>
    <div class="row compact">
      <label class="field"><span>Width</span><input :value="modelValue.width" min="100" max="4096" type="number" @input="update('width', Number(($event.target as HTMLInputElement).value))" /></label>
      <label class="field"><span>Height</span><input :value="modelValue.height" min="100" max="4096" type="number" @input="update('height', Number(($event.target as HTMLInputElement).value))" /></label>
    </div>
    <details>
      <summary>Source mapping and backup paths</summary>
      <div class="details-body">
        <label class="field"><span>Project-relative source file</span><input :value="modelValue.sourceFileRelative" placeholder="src/App.vue" @input="update('sourceFileRelative', ($event.target as HTMLInputElement).value)" /></label>
        <label class="field"><span>Absolute source file</span><input :value="modelValue.sourceFileAbsolute" placeholder="C:\project\src\App.vue" @input="update('sourceFileAbsolute', ($event.target as HTMLInputElement).value)" /></label>
        <label class="field"><span>Absolute CSS file</span><input :value="modelValue.styleCssAbsolute" placeholder="C:\project\src\style.css" @input="update('styleCssAbsolute', ($event.target as HTMLInputElement).value)" /></label>
        <label class="field"><span>Absolute image file</span><input :value="modelValue.imageAbsolute" placeholder="C:\project\public\image.png" @input="update('imageAbsolute', ($event.target as HTMLInputElement).value)" /></label>
      </div>
    </details>
    <button class="primary" :disabled="busy" type="submit"><span>{{ busy ? 'Converting…' : 'Generate design file' }}</span><b aria-hidden="true">↗</b></button>
  </form>
</template>
