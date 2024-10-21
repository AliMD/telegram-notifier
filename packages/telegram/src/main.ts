// common imports
// import {notifyDebug, onStart} from './lib/admin.js';
// bot imports
import './bot/start-command.js';
import './bot/unsubscribe-callback.js'
import {bot} from './lib/bot.js';
import {logger} from './lib/config.js';
import {initializeNitrobase} from './lib/initialize-nitrobase.js';
import './route/home.js'
import './route/notify.js'

logger.banner('@alwatr/telegram-notifier');

// bot.start({onStart, drop_pending_updates: config.bot.dropPendingUpdates});

bot.catch(async (err: { message: unknown; }) => {
  logger.error('catch', 'catch_error', err);
  // await notifyDebug(`❗️ [#catch_error]: ${err.message}`);
});

initializeNitrobase();
