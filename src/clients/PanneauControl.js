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
import RadarMultiPlayer from './visuel/RadarMultiPlayer.js';

async function main($container) {
  try {
    const config = loadConfig();
    const client = new Client(config);
    launcher.register(client, { initScreensContainer: $container });
    await client.start();
    console.log("Client connected:", client.id);

    const global = await client.stateManager.attach('global');
    const players = await client.stateManager.getCollection('player');

    // Player sélectionné pour le radar droit (par défaut le premier)
    let selectedPlayerId = null;
    players.forEach(p => {
      if (selectedPlayerId === null) selectedPlayerId = p.get('id');
    });

    let satellitePosition = 0;
    let lastRenderTime = 0;
    const renderThrottle = 500;

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

      global.onUpdate((updates) => {
        const positionKeys = Object.keys(updates).some(k => k.startsWith('Position_'));
        if (positionKeys) requestAnimationFrame(() => renderApp());
      });

      if (shouldRender) {
        const now = Date.now();
        if (now - lastRenderTime >= renderThrottle) {
          lastRenderTime = now;
          requestAnimationFrame(() => renderApp());
        }
      }
    }, true);

    // Réagir aux connexions/déconnexions de players
    players.onAttach(() => renderApp());
    players.onDetach(() => renderApp());

    renderApp();
    setTimeout(() => { 
      initRadars1();
      initRadars2() ;
    }, 500);


    function getSelectedPlayer() {
      let found = null;
      players.forEach(p => {
        if (p.get('id') === selectedPlayerId) found = p;
      });
      return found;
    }

    function getPlayerList() {
      const list = [];
      players.forEach(p => list.push(p));
      list.sort((a, b) => a.get('id') - b.get('id'));
      return list;
    }

    function renderApp() {
      const playerList = getPlayerList();

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
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #ca5b98 0%, #8b3a6a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 16px rgba(202, 91, 152, 0.8);
          border: 2px solid #fff;
        }
        .period-cell {
          max-height: 120px;
          overflow: hidden;
        }
        .period-cell.green { background: #4ade80; }
        .period-cell.blue  { background: #3381f5; }
        .period-cell.red   { background: #ef4444; }

        /* Menu sélection player */
        .player-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }
        .player-btn {
          padding: 4px 12px;
          border-radius: 20px;
          border: 2px solid rgba(100,255,218,0.4);
          background: transparent;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .player-btn.active {
          background: #64ffda;
          color: #0a0a14;
          border-color: #64ffda;
          font-weight: bold;
        }
        .player-btn:hover:not(.active) {
          border-color: #64ffda;
          color: #64ffda;
        }
      </style>

        </div>
            <!-- ========== LAYOUT 3 COLONNES ========== -->
            <div style="display:flex; flex-direction:row; align-items:flex-start; gap:12px; width:100%;">

              <!-- GAUCHE : Radar multi-player (duration_1 de chaque raspberry) -->
            <div class="parameter-group">
                <div class="parameter-title">Duration_1 — tous les Raspberry</div>
                <canvas
                  id="radar-multi1"
                  width="500" height="500"
                  style="display:block; cursor:crosshair; border-radius:12px; background:#0a0a14; border:2px solid rgba(202,91,152,0.3);"
                ></canvas>
              </div>  

              <!-- CENTRE : Period + Spread + Position -->
              <div style="flex:1; display:flex; flex-direction:column; gap:8px;">

                <!-- Period -->
                <div class="parameter-group Period">
                  <div class="parameter-title">Period</div>
                  <div class="period-grid">
                    ${[1, 2].map(i => {
                      const value = global.get(`period_${i}`);
                      let colorClass = 'green';
                      if (value >= 0.66 && value < 1.33) colorClass = 'blue';
                      else if (value >= 1.33) colorClass = 'red';
                      return html`
                        <div class="period-cell ${colorClass}">
                          <div class="cell-header"
                               @click=${e => {
                                 const currentVal = global.get(`period_${i}`);
                                 let newVal;
                                 if (currentVal < 0.66) newVal = 1.0;
                                 else if (currentVal < 1.33) newVal = 2.0;
                                 else newVal = 0.0;
                                 global.set(`period_${i}`, newVal);
                               }}>
                            <span class="cell-value">${value.toFixed(2)}</span>
                          </div>
                          <span class="cell-number">${i}</span>
                          <input
                            type="range" class="period-slider"
                            min="0" max="200" step="1"
                            value="${Math.round(value * 100)}"
                            @input=${e => { global.set(`period_${i}`, parseFloat(e.target.value) / 100); }}
                            @touchstart=${e => e.stopPropagation()}
                          />
                          <div class="fine-controls">
                            <button class="fine-btn"
                              @click=${e => { e.stopPropagation(); global.set(`period_${i}`, Math.max(0, global.get(`period_${i}`) - 0.1)); }}>−</button>
                            <button class="fine-btn"
                              @click=${e => { e.stopPropagation(); global.set(`period_${i}`, Math.min(2, global.get(`period_${i}`) + 0.1)); }}>+</button>
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                </div>

                <!-- Spread -->
                <div class="sub-section">
                  <div class="parameter-title">Spread</div>
                  <div class="spray-grid">
                    ${[1, 2].map(i => html`
                      <div class="spray-dial-wrapper">
                        <sc-dial
                          value=${global.get(`Spray_${i}`)}
                          @input=${e => global.set(`Spray_${i}`, e.detail.value)}
                          min=${global.getDescription(`Spray_${i}`).min}
                          max=${global.getDescription(`Spray_${i}`).max}
                          number-box size="small"
                        ></sc-dial>
                        <span class="spray-label">${i}</span>
                      </div>
                    `)}
                  </div>
                </div>

                <!-- Position -->
                <div class="sub-section">
                  <div class="parameter-title">Position</div>
                  <div class="progress-list">
                    ${[1, 2].map(i => {
                      const desc = global.getDescription(`position_${i}`);
                      const value = global.get(`position_${i}`);
                      const percentage = ((value - desc.min) / (desc.max - desc.min)) * 100;
                      return html`
                        <div class="progress-item">
                          <div class="progress-info">
                            <span class="progress-label"></span>
                            <span class="progress-value">${value.toFixed(2)}</span>
                          </div>
                          <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                            <input
                              type="range" class="progress-input"
                              value=${value}
                              @input=${e => global.set(`position_${i}`, parseFloat(e.target.value))}
                              min=${desc.min} max=${desc.max} step="0.001"
                            />
                          </div>
                        </div>
                      `;
                    })}
                  </div>
                </div>

              </div>
              <!-- fin centre -->

              <!-- DROITE : Radar player unique sélectionnable -->
              <div class="parameter-group">
                <div class="parameter-title">Duration_2 — tous les Raspberry</div>
                <canvas
                  id="radar-multi2"
                  width="500" height="500"
                  style="display:block; cursor:crosshair; border-radius:12px; background:#0a0a14; border:2px solid rgba(100,255,218,0.3);"
                ></canvas>
              </div>

            </div>
            <!-- fin layout 3 colonnes -->
          </div>
      `, $container);
    }

    function initRadars1() {
      // Radar GAUCHE : RadarMultiPlayer avec toute la collection
      const canvasMulti1 = document.getElementById('radar-multi1');
      
      if (canvasMulti1 && !canvasMulti1.radarController) {
        canvasMulti1.radarController = new RadarMultiPlayer(canvasMulti1, players, 'duration_1');
        players.forEach(p => {
          p.onUpdate((updates) => {
            if ('duration_1' in updates) { // redraw radar de gauche 
            requestAnimationFrame(() => canvasMulti1.radarController?.draw());
            }
          });
        });
      }
    }

    function initRadars2() {
      //Radar DROITE : RadarMultiPlayer
      const canvasMulti2 = document.getElementById('radar-multi2');

      if (canvasMulti2 && !canvasMulti2.radarController) {
        canvasMulti2.radarController = new RadarMultiPlayer(canvasMulti2, players, 'duration_2');
        players.forEach(p => {
          p.onUpdate((updates) => {
            if ('duration_2' in updates) { // redraw radar de droite 
              requestAnimationFrame(() => canvasMulti2.radarController?.draw());
            }
          });
        });
      }
    }


  } catch (error) {
    console.error("Erreur lors de l'initialisation du client:", error);
  }
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate') || '') || 1,
});
