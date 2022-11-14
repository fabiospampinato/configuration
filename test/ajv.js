
/* IMPORT */

import _ from 'lodash';
import Ajv from 'ajv';
import Filter from 'ajv-filter';

/* MAIN */

const AJV = {

  getInstance: _.memoize (() => {

    const options = { // Optimized for performance
      sourceCode: false,
      unicode: false,
      validateSchema: false,
      serialize: false,
      cache: {
        put: () => {},
        get: () => {},
        del: () => {},
        clear: () => {}
      }
    };

    const ajv = Filter.patchInstance ( new Ajv ( options ), true );

    return AJV.instance = ajv;

  }),

  getSchema ( schema ) {

    return Filter.patchSchema ( schema );

  },

  validateSchema ( schema ) {

    const ajv = AJV.getInstance ();

    return ajv.validateSchema ( schema );

  },

  getValidator ( schema ) {

    const ajv = AJV.getInstance ();

    return ajv.compile ( schema );

  },

  filterer ( data, schema ) {

    const clone = _.cloneDeep ( data );

    if ( !schema ) return clone;

    const validator = AJV.getValidator ( AJV.getSchema ( schema ) );

    validator ( clone );

    if ( Array.isArray ( clone ) ) return clone.filter ( x => x !== undefined );

    return clone;

  }

};

/* EXPORT */

export default AJV;
