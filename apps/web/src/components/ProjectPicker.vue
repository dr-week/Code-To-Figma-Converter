<script setup lang="ts">
import type { ProjectDetection } from '../types';

defineProps<{ rootPath: string; detection: ProjectDetection | null; busy: boolean }>();
const emit = defineEmits<{ 'update:rootPath': [value: string]; detect: [] }>();
</script>

<template>
  <section class="project-picker">
    <div class="section-heading"><span>01</span><div><h2>Select project</h2><p>Enter a local Nuxt, Vue or React project folder.</p></div></div>
    <div class="project-input">
      <label class="field"><span>Project folder</span><input :value="rootPath" placeholder="C:\projects\portfolio" @input="emit('update:rootPath', ($event.target as HTMLInputElement).value)" /></label>
      <button class="secondary" type="button" :disabled="busy" @click="emit('detect')">{{ busy ? 'Detecting…' : 'Detect' }}</button>
    </div>
    <div v-if="detection" class="detection">
      <strong>{{ detection.framework.toUpperCase() }}</strong>
      <span>{{ detection.projectName }}</span>
      <span>{{ detection.packageManager }}</span>
      <span>{{ detection.devScript ? 'dev script found' : 'no dev script' }}</span>
    </div>
  </section>
</template>
