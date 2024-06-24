import {
  DEFAULT_ITEM_PER_PAGE,
  DEFAULT_PAGE_NUMBER,
} from '../constants/query-preset.constant';

export function itemAndPageToLimitAndOffSet(
  max_items: number = DEFAULT_ITEM_PER_PAGE,
  page: number = DEFAULT_PAGE_NUMBER,
) {
  if (page <= 0) {
    page = DEFAULT_PAGE_NUMBER;
  }

  if (max_items <= 0) {
    max_items = DEFAULT_ITEM_PER_PAGE;
  }

  return {
    limit: max_items,
    offSet: (page - 1) * max_items,
  };
}

export function limitAndOffSetToMaxItemsAndPage(
  limit: number = DEFAULT_ITEM_PER_PAGE,
  offSet: number = 0,
) {
  if (limit <= 0) {
    limit = DEFAULT_ITEM_PER_PAGE;
  }

  if (offSet < 0) {
    offSet = 0;
  }

  return {
    max_items: limit,
    page: Math.ceil(offSet / limit) + 1,
  };
}

import { BinaryLike, createHash } from 'node:crypto';

export function createSHA256(data: BinaryLike) {
  return createHash('sha256').update(data).digest('hex');
}
