import {HttpStatusCodes, parseBodyAsJson, requireAccessToken, type NanotronClientRequest} from 'alwatr/nanotron';

import {config, logger} from '../config.js';
import {bot} from '../lib/bot.js';
import {openCategoryCollection} from '../lib/nitrobase.js';
import {nanotronApiServer} from '../lib/server.js';

import type { Category } from '../type.js';

export type NewCategoryOption = {
  id: string;
  title: string;
  channel: boolean,
  group: boolean,
};

nanotronApiServer.defineRoute<{body: NewCategoryOption}>({
  method: 'POST',
  url: '/new-category',
  preHandlers: [requireAccessToken(config.accessToken), parseBodyAsJson, newCategoryValidation],
  async handler() {
    logger.logMethod?.('newCategoryRoute');

    const {id, title, channel, group} = this.sharedMeta.body;

    const categoryCollection = await openCategoryCollection();

    const members: Category['members'] = [];
    if (channel === true) {
      members.push({
        id,
        type: 'channel'
      });
    }
    else if (group === true) {
      members.push({
        id,
        type: 'group'
      });
    }

    categoryCollection.addItem(id, {title, members});

    const botInfo = bot.botInfo;

    this.serverResponse.replyJson({
      ok: true,
      data: {
        subscribe: `https://t.me/${botInfo.username}?start=${id}`,
      },
    });
  },
});

export async function newCategoryValidation(this: NanotronClientRequest<{body: JsonObject}>): Promise<void> {
  const {id, title, channel, group} = this.sharedMeta.body;
  logger.logMethodArgs?.('newCategoryValidation', {id, title, channel, group});

  if (title === undefined || typeof title !== 'string') {
    this.serverResponse.statusCode = HttpStatusCodes.Error_Client_400_Bad_Request;
    this.serverResponse.replyErrorResponse({
      ok: false,
      errorCode: 'title_required',
      errorMessage: 'Title is required.',
    });
    return;
  }

  if (id === undefined || typeof id !== 'string') {
    this.serverResponse.statusCode = HttpStatusCodes.Error_Client_400_Bad_Request;
    this.serverResponse.replyErrorResponse({
      ok: false,
      errorCode: 'id_required',
      errorMessage: 'Id is required.',
    });
    return;
  }

  const categoryCollection = await openCategoryCollection();

  if (categoryCollection.hasItem(id)) {
    this.serverResponse.statusCode = HttpStatusCodes.Error_Client_400_Bad_Request;
    this.serverResponse.replyErrorResponse({
      ok: false,
      errorCode: 'category_exist',
      errorMessage: `Category ${id} already exist.`,
    });
    return;
  }

  // just for type validation and cleanup extra
  (this.sharedMeta.body as NewCategoryOption) = {
    id,
    title,
    channel: channel === true,
    group: group === true
  };
}
