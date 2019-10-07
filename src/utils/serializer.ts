
/* IMPORT */

import * as JSON5 from 'json5';
import {Data, DataRaw} from '../types';
import {DEFAULTS} from '../config';
import Type from './type';

/* SERIALIZER */

const Serializer = {

  serialize ( data: Data, indentation: string | number = DEFAULTS.indentation ): DataRaw {

    try {

      return JSON.stringify ( data, undefined, indentation );

    } catch {

      return DEFAULTS.dataRaw;

    }

  },

  deserialize ( raw: DataRaw ): Data {

    try {

      const data = JSON5.parse ( raw );

      return Type.isObject ( data ) ? data : DEFAULTS.data;

    } catch {

      return DEFAULTS.data;

    }

  }

};

/* EXPORT */

export default Serializer;
