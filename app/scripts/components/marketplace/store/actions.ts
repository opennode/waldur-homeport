import { Action } from '@waldur/core/reducerActions';
import { Product } from '@waldur/marketplace/types';

import * as constants from './constants';

export const addComparisonItem = (item: Product): Action<{item}> => ({
  type: constants.COMPARISON_ITEM_ADD,
  payload: {
    item,
  },
});

export const removeComparisonItem = (item: Product): Action<{item}> => ({
  type: constants.COMPARISON_ITEM_REMOVE,
  payload: {
    item,
  },
});