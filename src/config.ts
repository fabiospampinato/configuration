
/* CONFIG */

const DEFAULTS = {
  id: 'confId',
  scope: 'provider',
  indentation: 2,
  dataRaw: '{\n  \n}',
  get data () {
    return {};
  }
};

const SCOPE_ALL = '*';

const SCOPE_DEFAULTS = 'defaults';

/* EXPORT */

export {DEFAULTS, SCOPE_ALL, SCOPE_DEFAULTS};
