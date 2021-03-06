
/* IMPORT */

import {ProviderStorageOptions} from '../types';
import ProviderStorage from './storage';

/* LOCAL STORAGE */

class ProviderLocalStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderStorage<Options> {

  constructor ( options?: Partial<Options> ) {

    options = { ...options, storage: localStorage } as Partial<Options>; //TSC

    super ( options );

  }

}

/* EXPORT */

export default ProviderLocalStorage;
