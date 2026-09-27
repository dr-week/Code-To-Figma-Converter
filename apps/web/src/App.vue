<script setup lang="ts">
import { ref } from 'vue';
import ConversionFormPanel from './components/ConversionForm.vue';
import ConversionResultPanel from './components/ConversionResult.vue';
import ProjectPicker from './components/ProjectPicker.vue';
import type { ConversionForm, ConversionResult, ProjectDetection } from './types';

const form = ref<ConversionForm>({
  url: 'http://127.0.0.1:4174', selector: '[data-figma-root]', projectId: 'vue-project', width: 960, height: 900,
  sourceFileRelative: 'tests/fixtures/vue/src/App.vue', sourceFileAbsolute: '', styleCssAbsolute: '', imageAbsolute: '',
});
const busy = ref(false);
const detecting = ref(false);
const projectRoot = ref('C:\\Users\\disha\\Documents\\CODES\\studio\\CODEtoFIGMA\\tests\\fixtures\\vue');
const detection = ref<ProjectDetection | null>(null);
const error = ref('');
const result = ref<ConversionResult | null>(null);

async function detect(): Promise<void> {
  detecting.value = true; error.value = '';
  try {
    const response = await fetch('/api/projects/detect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rootPath: projectRoot.value }) });
    const body = await response.json() as ProjectDetection | { error: string };
    if (!response.ok) throw new Error('error' in body ? body.error : 'Project detection failed.');
    detection.value = body as ProjectDetection;
    form.value.projectId = detection.value.projectName;
    const entry = detection.value.entryFiles[0];
    if (entry) { form.value.sourceFileRelative = entry.relative; form.value.sourceFileAbsolute = entry.absolute; }
    const style = detection.value.styleFiles[0];
    if (style) form.value.styleCssAbsolute = style.absolute;
  } catch (reason) { error.value = reason instanceof Error ? reason.message : 'Project detection failed.'; }
  finally { detecting.value = false; }
}

async function convert(): Promise<void> {
  busy.value = true; error.value = ''; result.value = null;
  try {
    const response = await fetch('/api/conversions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form.value) });
    const body = await response.json() as ConversionResult | { error: string };
    if (!response.ok) throw new Error('error' in body ? body.error : 'Conversion failed.');
    result.value = body as ConversionResult;
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Conversion failed.';
  } finally { busy.value = false; }
}
</script>

<template>
  <main>
    <nav><a class="brand" href="/"><span>CTD</span> Code to Design</a><div class="status"><i></i> Local workspace</div></nav>
    <header><p class="kicker">Nuxt · Vue · React → OpenPencil</p><h1>Turn running interfaces<br /><em>into editable layers.</em></h1><p class="intro">Detect a local project, capture its running interface, preserve names and source mappings, and export a native design package.</p></header>
    <ProjectPicker v-model:root-path="projectRoot" :detection="detection" :busy="detecting" @detect="detect" />
    <section class="workspace">
      <ConversionFormPanel v-model="form" :busy="busy" @submit="convert" />
      <aside>
        <ConversionResultPanel v-if="result" :result="result" />
        <div v-else class="empty"><div class="diagram"><span>CODE</span><b>→</b><span>.FIG</span></div><h2>Ready for conversion</h2><p>The output includes the original design, source map, source backup and validation evidence.</p></div>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
      </aside>
    </section>
    <footer><span>Local-first · No database · No cloud upload</span><span>OpenPencil adapter</span></footer>
  </main>
</template>
