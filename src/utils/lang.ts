
/* IMPORT */

import cloneDeep from 'plain-object-clone';
import isEqual from 'plain-object-is-equal';
import merge from 'plain-object-merge';
import type {ValueArray, ValueObject} from '../types';

/* MAIN */

const Lang = {

  /* API */

  merge,

  cloneDeep: <T> ( value: T ): T => {

    return Lang.isObject ( value ) ? cloneDeep ( value ) : value;

  },

  identity: <T> ( value: T ): T => {

    return value;

  },

  isArray: ( value: unknown ): value is unknown[] => {

    return Array.isArray ( value );

  },

  isEqual ( a: unknown, b: unknown ): boolean {

    return Object.is ( a, b ) || ( Lang.isObject ( a ) && Lang.isObject ( b ) && isEqual ( a, b ) );

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
