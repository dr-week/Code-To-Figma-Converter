<template>
  <main
    data-figma-root
    data-figma-id="canvas"
    data-figma-name="Portfolio/Overview"
    data-source-file="tests/fixtures/vue/src/App.vue"
    data-source-component="App"
    data-source-id="canvas"
  >
    <header
      data-figma-id="header"
      data-figma-name="Header"
      data-source-file="tests/fixtures/vue/src/App.vue"
      data-source-component="App"
      data-source-id="header"
    >
      <span
        class="wordmark"
        data-figma-name="Brand/Wordmark"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="wordmark"
      >FORM / CODE</span>
      <span
        class="edition"
        data-figma-name="Header/Edition"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="edition"
      >ENGINEERING STUDY — 001</span>
    </header>
    <section
      class="intro"
      data-figma-name="Introduction"
      data-source-file="tests/fixtures/vue/src/App.vue"
      data-source-component="App"
      data-source-id="intro"
    >
      <p
        class="eyebrow"
        data-figma-name="Introduction/Category"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="intro-category"
      >FROM IMPLEMENTATION TO INTENTION</p>
      <h1
        data-figma-name="Introduction/Title"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="intro-title"
      >Good structure.<br />Clear outcomes.</h1>
      <p
        class="description"
        data-figma-name="Introduction/Description"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="intro-desc"
      >An editable record of the interface you built.</p>
    </section>
    <section
      class="project"
      data-figma-name="Project/Card"
      data-source-file="tests/fixtures/vue/src/App.vue"
      data-source-component="App"
      data-source-id="project-card"
    >
      <img
        src="/study.png"
        width="288"
        height="176"
        alt="Abstract red and cream geometric study"
        data-figma-name="Project/Image"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="project-image"
      />
      <div
        class="project-copy"
        data-figma-name="Project/Details"
        data-source-file="tests/fixtures/vue/src/App.vue"
        data-source-component="App"
        data-source-id="project-details"
      >
        <p
          class="eyebrow"
          data-figma-name="Project/Index"
          data-source-file="tests/fixtures/vue/src/App.vue"
          data-source-component="App"
          data-source-id="project-index"
        >01 / INTERFACE SYSTEMS</p>
        <h2
          data-figma-name="Project/Title"
          data-source-file="tests/fixtures/vue/src/App.vue"
          data-source-component="App"
          data-source-id="project-title"
        >Every element has a name.</h2>
        <p
          class="summary"
          data-figma-name="Project/Summary"
          data-source-file="tests/fixtures/vue/src/App.vue"
          data-source-component="App"
          data-source-id="project-summary"
        >Measured positions. Native layers. Traceable results.</p>
        <button
          type="button"
          data-figma-id="inspect-button"
          data-figma-name="Project/InspectButton"
          data-source-file="tests/fixtures/vue/src/App.vue"
          data-source-component="App"
          data-source-id="inspect-button"
          @click="scrollToFooter"
        >Inspect the structure →</button>
      </div>
    </section>
    <footer
      data-figma-name="Footer"
      data-source-file="tests/fixtures/vue/src/App.vue"
      data-source-component="App"
      data-source-id="footer"
    >VUE 3 + TYPESCRIPT / FIXED VIEWPORT / LOCAL CAPTURE</footer>
  </main>
</template>

<script setup lang="ts">
function scrollToFooter() {
  document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
}
</script>
