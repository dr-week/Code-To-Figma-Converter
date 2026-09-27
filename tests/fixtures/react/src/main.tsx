import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import './style.css';

function App() {
  return <main data-figma-root data-figma-id="canvas" data-figma-name="Portfolio/Overview">
    <header data-figma-id="header" data-figma-name="Header">
      <span className="wordmark" data-figma-name="Brand/Wordmark">FORM / CODE</span>
      <span className="edition" data-figma-name="Header/Edition">ENGINEERING STUDY — 001</span>
    </header>
    <section className="intro" data-figma-name="Introduction">
      <p className="eyebrow" data-figma-name="Introduction/Category">FROM IMPLEMENTATION TO INTENTION</p>
      <h1 data-figma-name="Introduction/Title">Good structure.<br />Clear outcomes.</h1>
      <p className="description" data-figma-name="Introduction/Description">An editable record of the interface you built.</p>
    </section>
    <section className="project" data-figma-name="Project/Card">
      <img src="/study.png" width="288" height="176" alt="Abstract red and cream geometric study" data-figma-name="Project/Image" />
      <div className="project-copy" data-figma-name="Project/Details">
        <p className="eyebrow" data-figma-name="Project/Index">01 / INTERFACE SYSTEMS</p>
        <h2 data-figma-name="Project/Title">Every element has a name.</h2>
        <p className="summary" data-figma-name="Project/Summary">Measured positions. Native layers. Traceable results.</p>
        <button type="button" data-figma-id="inspect-button" data-figma-name="Project/InspectButton" onClick={() => { document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' }); }}>Inspect the structure →</button>
      </div>
    </section>
    <footer data-figma-name="Footer">REACT + TYPESCRIPT / FIXED VIEWPORT / LOCAL CAPTURE</footer>
  </main>;
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
