
/* IMPORT */

import type {ProviderLocalStorageOptions} from '../types';
import ProviderStorage from './storage';

/* MAIN */

class ProviderLocalStorage<Options extends ProviderLocalStorageOptions = ProviderLocalStorageOptions> extends ProviderStorage<Options & { storage: Storage }> {

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    super ({ ...options, storage: localStorage });

  }

}

/* EXPORT */

export default ProviderLocalStorage;
