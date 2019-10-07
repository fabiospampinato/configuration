
/* IMPORT */

import * as isPrimitive from 'is-primitive';
import {ValueObject} from '../types';

/* TYPE */

const Type = {

  isNull ( x: any ): x is null {

    return x === null;

  },

  isObject ( x: any ): x is ValueObject {

    return !isPrimitive ( x );

  },

  isString ( x: any ): x is string {

    return typeof x === 'string';

  },

  isUndefined ( x: any ): x is undefined {

    return typeof x === 'undefined';

  }

};

/* EXPORT */

export default Type;
