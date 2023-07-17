
/* IMPORT */

import type {ProviderSessionStorageOptions} from '../types';
import ProviderStorage from './storage';

/* MAIN */

class ProviderSessionStorage<Options extends ProviderSessionStorageOptions = ProviderSessionStorageOptions> extends ProviderStorage<Options & { storage: Storage }> {

  /* CONSTRUCTOR */

  constructor ( options: Options ) {

    super ({ ...options, storage: sessionStorage });

  }

}

/* EXPORT */

export default ProviderSessionStorage;
