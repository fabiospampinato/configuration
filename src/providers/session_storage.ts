
/* IMPORT */

import {ProviderStorageOptions} from '../types';
import ProviderStorage from './storage';

/* SESSION STORAGE */

class ProviderSessionStorage<Options extends ProviderStorageOptions = ProviderStorageOptions> extends ProviderStorage<Options> {

  constructor ( options?: Partial<Options> ) {

    options = { storage: sessionStorage, ...options } as Partial<Options>; //TSC

    super ( options );

  }

}

/* EXPORT */

export default ProviderSessionStorage;
