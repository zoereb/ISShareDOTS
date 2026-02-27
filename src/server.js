import '@soundworks/helpers/polyfills.js';
import '@soundworks/helpers/catch-unhandled-errors.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig, configureHttpRouter } from '@soundworks/helpers/server.js';
import pluginSync from '@soundworks/plugin-sync/server.js'; 
import pluginCheckin from '@soundworks/plugin-checkin/server.js'; 

import globalSchema from './server/schemas/global.js'; 
import playerSchema from './server/schemas/player.js'; 


const config = loadConfig(process.env.ENV, import.meta.url);

config.roles = ['planet', 'audience'];

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

const server = new Server(config);
configureHttpRouter(server);

server.pluginManager.register('sync', pluginSync); 
server.pluginManager.register('checkin', pluginCheckin);

server.stateManager.defineClass('global', globalSchema); 

await server.start();

server.stateManager.defineClass('player', playerSchema);
const global = await server.stateManager.create('global');

const checkin = server.pluginManager.get('checkin');
console.log('checkin', checkin);
