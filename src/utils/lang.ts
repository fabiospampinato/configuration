
/* IMPORT */

import isEqual from 'are-deeply-equal';
import {cloneDeep} from 'duper';
import merge from 'plain-object-merge';
import type {ValueArray, ValueObject} from '../types';

/* MAIN */

const Lang = {

  /* API */

  cloneDeep,
  isEqual,
  merge,

  identity: <T> ( value: T ): T => {

    return value;

  },

  isArray: ( value: unknown ): value is unknown[] => {

    return Array.isArray ( value );

  },

  isNull: ( value: unknown ): value is null => {

    return value === null;

  },

  isNullary: ( value: unknown ): value is (() => unknown) => {

    return typeof value === 'function' && value.length === 0;

  },

  isObject: ( value: unknown ): value is ValueArray | ValueObject => {

    return !Lang.isPrimitive ( value );

  },

  isPrimitive: ( value: unknown ): value is bigint | symbol | string | number | boolean | null | undefined => {

    if ( value === null ) return true;

    const type = typeof value;

    return type !== 'object' && type !== 'function';

  },

  isString: ( value: unknown ): value is string => {

    return typeof value === 'string';

  },

  isUndefined: ( value: unknown ): value is undefined => {

    return value === undefined;

  }

};

/* EXPORT */

export default Lang;
