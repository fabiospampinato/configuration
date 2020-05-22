
/* IMPORT */

import * as JSON5 from 'json5';
import {Data, DataRaw} from '../types';
import {DEFAULTS} from '../config';
import Type from './type';

/* PARSER */

class Parser {

  indentation: string | number;

  constructor ( indentation: string | number = DEFAULTS.indentation ) {

    this.indentation = indentation;

  }

  parse ( raw: DataRaw ): Data {

    try {

      const data = JSON5.parse ( raw );

      return Type.isObject ( data ) ? data : DEFAULTS.data;

    } catch {

      return DEFAULTS.data;

    }

  }

  stringify ( data: Data ): DataRaw {

    try {

      return JSON.stringify ( data, undefined, this.indentation );

    } catch {

      return DEFAULTS.dataRaw;

    }

  }

};

/* EXPORT */

export default Parser;
