
/* IMPORT */

import {Ajv, ValidateFunction} from 'ajv';
import {JSONSchema7} from 'json-schema';

/* AJV */

const AJV = {

  instance: undefined as Ajv | undefined, // Caching instance

  getInstance (): Ajv {

    if ( AJV.instance ) return AJV.instance;

    const Ajv = require ( 'ajv' ), // Lazy import for performance
          Filter = require ( 'ajv-filter' ); // Lazy import for performance

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

  },

  getSchema ( schema: JSONSchema7 ): JSONSchema7 {

    const Filter = require ( 'ajv-filter' ); // Lazy import for performance

    return Filter.patchSchema ( schema );

  },

  validateSchema ( schema: JSONSchema7 ): boolean {

    const ajv = AJV.getInstance ();

    return ajv.validateSchema ( schema );

  },

  getValidator ( schema: JSONSchema7 ): ValidateFunction {

    const ajv = AJV.getInstance ();

    return ajv.compile ( schema );

  }

};

/* EXPORT */

export default AJV;
