
/* IMPORT */

import type {ProviderStorageOptions} from '../types';
import ProviderStorage from './storage';

/* MAIN */

class ProviderSessionStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderStorage<Options> {

  /* CONSTRUCTOR */

  constructor ( options?: Partial<Options> ) {

    options = { ...options, storage: sessionStorage } as Partial<Options>; //TSC

    super ( options );

  }

}

/* EXPORT */

export default ProviderSessionStorage;
