import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';
import '@ircam/sc-components/sc-matrix.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-transport.js';
import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components';
import RadarController from './visuel/Radar.js';

async function main($container) {
  try { 
    const config = loadConfig();
    const client = new Client(config);
    launcher.register(client, { initScreensContainer: $container });
    await client.start();
    console.log("Client connected:", client.id); 
    const global = await client.stateManager.attach('global');
    const players = await client.stateManager.getCollection('player'); //récupere les paramètres clients du serveur.

  let satellitePosition = 0 ;
  let lastRenderTime = 0;
  const renderThrottle = 500; // ms (limite les rendus à 2x/seconde)

  global.onUpdate(async (updates) => {
      let shouldRender = false;
      for (let [key, value] of Object.entries(updates)) {
        switch (key) {
          case 'position_01':
            satellitePosition = value * 100;
            shouldRender = true;
            break;
          case 'position_coordonnee_latitude':
            shouldRender = true;
            break;
        }
      }

      // 5. Utilisation de requestAnimationFrame pour les rendus
      if (shouldRender) {
        const now = Date.now();
        if (now - lastRenderTime >= renderThrottle) {
          lastRenderTime = now;
          requestAnimationFrame(() => renderApp());
        }
      }
    }, true);

    // 6. Initialisation des radars (avec délai pour laisser le temps au DOM de se charger)
    setTimeout(() => initRadars(players), 1000);

    // 7. Premier rendu
    renderApp();

  function renderApp() {
    render(html`
    <style>
      
      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${global.get('running') ? '#4ade80' : '#ef4444'};
        box-shadow: 0 0 12px ${global.get('running') ? '#4ade80' : '#ef4444'};
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }

      .progress-fill {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #c9aa4e 0%, #3381f5 100%);
        clip-path: inset(0 ${100 - satellitePosition}% 0 0);
        transition: clip-path 0.3s ease;
      }

      .satellite-marker {
        position: absolute;
        left: ${satellitePosition}%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
        background: radial-gradient(circle, #ca5b98 0%, #8b3a6a 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 16px rgba(202, 91, 152, 0.8);
        border: 2px solid #fff;
      }

      
    </style>

    <!------------------------------------ Section Players ------------------------------------->
    <div class="player-section">
      ${players.map( (player) => html`
        <div class="player-card">
          <div class="player-header">
            <div class="player-id">Player ${player.get('id_modulo')}</div>
          </div>
        <div class="parameters-grid">

        <!-----------------------------PERIOD------------------------->

<div class="parameter-group Period">
  <div class="parameter-title">Period</div>

  <div class="period-grid">
    ${[1, 2].map(i => {
      const value = player.get(`period_${i}`);

      // Déterminer la couleur en fonction de la valeur
      let colorClass = 'green';
      if (value >= 0.66 && value < 1.33) {
        colorClass = 'blue';
      } else if (value >= 1.33) {
        colorClass = 'red';
      }

      return html`
        <div class="period-cell ${colorClass}">
          <!-- En-tête cliquable pour cycle rapide -->
          <div class="cell-header"
               @click=${e => {
                 const currentVal = player.get(`period_${i}`);
                 let newVal;

                 // Cycle : 0.0 → 1.0 → 2.0 → 0.0
                 if (currentVal < 0.66) {
                   newVal = 1.0;
                 } else if (currentVal < 1.33) {
                   newVal = 2.0;
                 } else {
                   newVal = 0.0;
                 }

                 player.set(`period_${i}`, newVal);
               }}>
            <span class="cell-value">${value.toFixed(2)}</span>
          </div>
            <span class="cell-number">${i}</span>

          <!-- Slider tactile pour ajustement fin -->
          <input
            type="range"
            class="period-slider"
            min="0"
            max="200"
            step="1"
            value="${Math.round(value * 100)}"
            @input=${e => {
              const newVal = parseFloat(e.target.value) / 100;
              player.set(`period_${i}`, newVal);
            }}
            @touchstart=${e => e.stopPropagation()}
          />

          <!-- Boutons +/- pour ajustement précis -->
          <div class="fine-controls">
            <button class="fine-btn"
                    @click=${e => {
                      e.stopPropagation();
                      const currentVal = player.get(`period_${i}`);
                      const newVal = Math.max(0, currentVal - 0.1);
                      player.set(`period_${i}`, newVal);
                    }}>
              −
            </button>

            <button class="fine-btn"
                    @click=${e => {
                      e.stopPropagation();
                      const currentVal = player.get(`period_${i}`);
                      const newVal = Math.min(2, currentVal + 0.1);
                      player.set(`period_${i}`, newVal);
                    }}>
              +
            </button>
          </div>
        </div>
      `;
    })}
  </div>
</div>


<!------------------------------- Position ---------------------------------------->

<div class="parameter-group" style="grid-column: span 2;">
  <div class="parameter-title"> Position</div>
  <div style="display: flex; justify-content: center; padding: 20px;">
    <canvas
      id="radar-${player.get('id_modulo')}"
      width="450"
      height="450"
      style="display: block; cursor: crosshair; border-radius: 12px; background: #0a0a14; border: 2px solid rgba(100, 255, 218, 0.3);"
    ></canvas>
  </div>
</div>

<!----------------------------------- Duration & Spray Column ------------------------------------>

<div class="parameter-group shared-column">

        <!-- Duration 1 Section -->
    <div class="sub-section">
      <div class="parameter-title">Duration</div>
      <div class="progress-list">
        ${players.map( (player) => {
          const desc = player.getDescription(`duration_1`);
          const value = player.get(`duration_1`);
          const percentage = ((value - desc.min) / (desc.max - desc.min)) * 100;

          return html`
            <div class="progress-item">
              <div class="progress-info">
                <span class="progress-label"></span>
                <span class="progress-value">${value.toFixed(2)}</span>
              </div>
              <div class="progress-bar-container">
                <div
                  class="progress-bar-fill"
                  style="width: ${percentage}%"
                ></div>
                <input
                  type="range"
                  class="progress-input"
                  value=${value}
                  @input=${e => player.set(`duration_1`, parseFloat(e.target.value))}
                  min=${desc.min}
                  max=${desc.max}
                  step="0.001"
                />
              </div>
            </div>
          `;
        })}
      </div>
    </div>

              <!-- Spray Section -->
                <div class="sub-section">
                  <div class="parameter-title">Spread</div>
                  <div class="spray-grid">
                    ${[1, 2].map(i => html`
                      <div class="spray-dial-wrapper">
                        <sc-dial
                          value=${player.get(`Spray_${i}`)}
                          @input=${e => player.set(`Spray_${i}`, e.detail.value)}
                          min=${player.getDescription(`Spray_${i}`).min}
                          max=${player.getDescription(`Spray_${i}`).max}
                          number-box
                          size="small"
                        ></sc-dial>
                        <span class="spray-label">${i}</span>
                      </div>
                    `)}
                  </div>
                </div>

              </div>
            </div>
          </div>
        `)}
      </div>
    </div>
    `, $container);
  }

 function initRadars(players) {
      players.forEach( (player) => {
        const canvas = document.getElementById(`radar-${player.get('id_modulo')}`);
        if (canvas && !canvas.radarController) {
          try {
            canvas.radarController = new RadarController(canvas, player); // là on veut un radar pour les 8 raspberrys !

            // Écouteur optimisé pour les mises à jour de position
            player.onUpdate( (updates) => {
              const positionKeys = Object.keys(updates).filter(key => key.startsWith('position_'));
              if (positionKeys.length > 0 && canvas.radarController) {
                requestAnimationFrame(() => {
                  if (canvas.radarController) {
                    canvas.radarController.draw();
                  }
                });
              }
            });
          } catch (error) {
            console.error(`Erreur lors de l'initialisation du radar pour le player ${player.get('id')}:`, error);
          }
        }
      });
    }

  } catch (error) {
    console.error("Erreur lors de l'initialisation du client:", error);
  }
}

// 10. Exécution avec le launcher
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate') || '') || 1,
});