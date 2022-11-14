
/* IMPORT */

import type {ProviderStorageOptions} from '../types';
import ProviderStorage from './storage';

/* MAIN */

class ProviderLocalStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderStorage<Options> {

  /* CONSTRUCTOR */

  constructor ( options?: Partial<Options> ) {

    options = { ...options, storage: localStorage } as Partial<Options>; //TSC

    super ( options );

  }

}

/* EXPORT */

export default ProviderLocalStorage;
