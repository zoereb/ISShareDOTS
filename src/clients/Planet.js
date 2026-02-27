import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';
import '@ircam/sc-components';

let distanceUpdateTimeout = null;

async function main($container) {
  const config = loadConfig();
  const client = new Client(config);

  launcher.register(client, { initScreensContainer: $container });

  await client.start();
  const global = await client.stateManager.attach('global');

  // Variables pour le zoom (0 = très proche, 1 = très loin)
  let startY = 0;
  let currentZoom = 1.0; // Valeur initiale (milieu de l'échelle)
  const minZoom = 0.0; // Très proche
  const maxZoom = 1.0; // Très loin

  // Fonction pour appliquer le zoom
  const applyZoom = (zoom) => {
    currentZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    
    // Mise à jour visuelle immédiate pour que le zoom soit fluide.
    const earthRotation = document.querySelector('.earth-rotation');
    if (earthRotation) {
      const scale = 0.5 + (1.0 - currentZoom) * 2.0;
      earthRotation.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }

    global.set({ distance: currentZoom }) // changement immédiat -> il peut poser problème mais normalement non. 

  };

  // Fonction de rendu très simple elle appelle une image dans le dossier config. 
  function renderApp() {
    render(html`
      <style>
        .simple-layout {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #000;
          color: white;
          font-family: sans-serif;
          padding: 20px;
          box-sizing: border-box;
          touch-action: none;
        }

        .orbital-view {
          position: relative;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(100, 255, 218, 0.3);
          margin: 20px 0;
          touch-action: none;
        }

        .earth-rotation {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%) scale(2.5); /* Valeur initiale */
          transform-origin: center;
        }

        .earth-rotation img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          box-shadow: 0 0 40px rgba(100, 255, 218, 0.4);
        }

      </style>
      <div class="simple-layout">
        <h1>glissez</h1>
        <div
          class="orbital-view"
          @touchstart=${(e) => { startY = e.touches[0].clientY; }}
          @touchmove=${(e) => {
            e.preventDefault();
            const deltaY = e.touches[0].clientY - startY;
            const zoomFactor = 0.005; // Sensibilité du zoom
            const newZoom = currentZoom + (deltaY * zoomFactor);
            applyZoom(newZoom);
            startY = e.touches[0].clientY;
          }}
          @touchend=${() => {}}
        >
        <div class="earth-rotation">
            <img src="/NIght-time-Earth.webp" alt="Vue orbitale de la Terre" />
          </div>
        </div>
      </div>
      
    `, $container);

  }

  renderApp();
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate') || '') || 1,
});
/*<div>
      <sc-dial
        .value=${global.get('distance')}
        @input=${e => global.set('distance', e.detail.value)}
        min='0'
        max='1'
       ></sc-dial>
        </div>*/