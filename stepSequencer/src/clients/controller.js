import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/browser.js';
import { html, render } from 'lit';
import pluginSync from '@soundworks/plugin-sync/client.js';
import '@ircam/sc-components';
import { Scheduler } from '@ircam/sc-scheduling';
import '@ircam/sc-components/sc-matrix.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-transport.js';
import '@ircam/sc-components/sc-number.js';
import player from '../server/schemas/player';

/* ça c'est en pose c'est pour le temps réel
let data ;
let trackingInterval;

async function trackingPosition(){
  data = await fetchISSPosition() ;
};*/

async function main($container) {
  const config = loadConfig();
  const client = new Client(config);

  launcher.register(client, {
    initScreensContainer: $container,
    reloadOnVisibilityChange: false,
  });

  client.pluginManager.register('sync', pluginSync);

  await client.start();

  const global = await client.stateManager.attach('global');
  const sync = await client.pluginManager.get('sync');

  const players = await client.stateManager.getCollection('player'); 

  const scheduler = new Scheduler(() => sync.getSyncTime(), {
     currentTimeToProcessorTimeFunction: syncTime => sync.getLocalTime(syncTime),
  });

  const processor = (currentTime, processorTime, event) => {
    const newPosition = global.get('position_01') + 1/595;
    const normalized = newPosition > 0.999 ? 0 : newPosition;
    
    global.set({ 
      position_01: normalized,
      timer_position_csv: Math.floor(normalized * 595)
    });

    return currentTime + 1/global.get('vitesse') * 10;
  };

  const startTime = global.get('startTime');
  let satellitePosition = 0 ;
  global.onUpdate(async updates => {
    for (let [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'running' : {
          console.log('running changed:', value) ;
          if (value === true) {
            const startTime = updates.startTime
            scheduler.add(processor, startTime);
            console.log('added processor to scheduler');
          }
          else if (scheduler.has(processor)){
            scheduler.remove(processor, startTime);
            console.log('removed processor from scheduler');
          }
          break ;
        }
        case 'position_01' : {
          const position = global.get('position_01');
          satellitePosition = position * 100;
          renderApp() ;
          break ;
        }
        case 'position_coordonnee_latitude' : {
          renderApp() ;
          break ;
        }
      }
    }
  }, true);


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

    </style>

    <div class="controller-layout">
      <header>
        <h1>🛰️ ISSHARE </h1>
        <sw-audit .client="${client}"></sw-audit>
      </header>

      <div class="mission-control">
        <div class="control-panel">
          <div class="panel-title">⚡ Mission Control</div>

          <div class="transport-control">
            <span class="status-indicator"></span>
            <sc-transport
              .buttons=${['play', 'stop']}
              value=${global.get('running') ? 'play' : 'stop'}
              @change=${e => {
                if (e.detail.value === 'stop') {
                  global.set({ running: false });
                } else {
                  const syncTime = sync.getSyncTime();
                  const startTime = syncTime + 0.5;
                  global.set({ running: true, startTime });
                }
              }}
            ></sc-transport>
          </div>

          <div class="control-group">
            <span class="control-label"> Position</span>
            <sc-dial
              min="0"
              max="1"
              value=${global.get('position_01')}
              @change=${e => global.set({ position_01: e.detail.value })}
              number-box
            ></sc-dial>
          </div>

          <div class="control-group">
            <span class="control-label"> Vitesse</span>
            <sc-dial
              min=${global.getDescription('vitesse').min}
              max=${global.getDescription('vitesse').max}
              value=${global.get('vitesse')}
              @change=${e => global.set({ vitesse: e.detail.value })}
              number-box
            ></sc-dial>
          </div>

          <div class="control-group">
            <span class="control-label"> Mute nappe</span>
            <sc-toggle
              ?active=${global.get('mute')}
              @change=${e => global.set('mute', e.detail.value)}
            ></sc-toggle>
            <span class="control-label"> Mute ISS</span>
            <sc-toggle
              ?active=${global.get('mute_ISS')}
              @change=${e => global.set('mute_ISS', e.detail.value)}
            ></sc-toggle>
          </div>

          <div style="margin-top: 16px;">
            <div class="progress-label">📡 ISS Position</div>
            <div class="coordinates-display">
              LAT: ${global.get('position_coordonnee_latitude')}° |
              LON: ${global.get('position_coordonnee_longitude')}°
            </div>
          </div>        
      </div>
    </div>
  </div>
</div>

        <!-- ── VOLUME FADERS ───────────────────────── -->
        <div class="faders-section">
          <div class="panel-title">🎚️ Volume Faders</div>
          <div class="faders-groups-row">

            <div class="faders-group">
              <span class="faders-group-label iss">🛰 ISS 1 – 8</span>
              <div class="faders-row">
                 ${players.map( (player) => html`
                  <div class="fader-channel">
                    <div class="fader-val iss">
                      ${Math.round(player.get('VolumeISS') )}
                    </div>
                    <div class="fader-track">
                      <input type="range" class="v-fader iss"
                        min=${player.getDescription('VolumeISS').min}
                        max=${player.getDescription('VolumeISS').max}
                        step="0.01"
                        .value=${String(player.get('VolumeISS') ?? 0.75)}
                        style="--pct: ${((player.get('VolumeISS') ?? 0.75) * 100).toFixed(1)}%"
                        @input=${e => {
                          const val = parseFloat(e.target.value);
                          e.target.style.setProperty('--pct', (val * 100).toFixed(1) + '%');
                          e.target.closest('.fader-channel').querySelector('.fader-val').textContent = Math.round(val * 100);
                          player.set({ 'VolumeISS': val });
                        }}
                      />
                    </div>
                    <div class="fader-num">ISS ${player.get('id')}</div>
                  </div>
                `)}
              </div>
            </div>

            <div class="faders-divider"></div>

            <div class="faders-group">
              <span class="faders-group-label fonts">🎵 Fonts 1 – 8</span>
              <div class="faders-row">
                 ${players.map( (players) => html`
                  <div class="fader-channel">
                    <div class="fader-val fonts">
                      ${Math.round(players.get('volumeAllFond') )}
                    </div>
                    <div class="fader-track">
                      <input type="range" class="v-fader fonts"
                        min=${players.getDescription('volumeAllFond').min}
                        max=${players.getDescription('volumeAllFond').max}
                        step="0.01"
                        .value=${String(players.get('volumeAllFond') ?? 0.75)}
                        style="--pct: ${((players.get('volumeAllFond') ?? 0.75) * 100).toFixed(1)}%"
                        @input=${e => {
                          const val = parseFloat(e.target.value);
                          e.target.style.setProperty('--pct', (val * 100).toFixed(1) + '%');
                          e.target.closest('.fader-channel').querySelector('.fader-val').textContent = Math.round(val * 100);
                          players.set({ 'volumeAllFond': val });
                        }}
                      />
                    </div>
                    <div class="fader-num">FNT ${players.get('id')}</div>
                  </div>
                `)}
              </div>
            </div>

          </div>
        </div>
  `, $container);
}

renderApp();
}

launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate') || '') || 1,
  width: '50%',
});
