# Configuration

Performant and feature rich library for managing configurations/settings.

## Features

This library has been modeled after VSCode's settings system, and it can be used for implementing a similarly powerful settings system in your app.

- **Performant**: it's designed to be extremely fast, and the more heavy dependencies are only loaded if/when necessary.
- **Providers**: a provider reads and writes the actual data, many are built-in (memory, json, local storage etc.) and others can be written easily.
- **Universal**: it works in the browser too, just use a suitable provider.
- **Scopes**: a single configuration instance can have multiple providers, so for example a `global + local` setup can be implemented easily.
- **Schema**: an optional [JSON schema](https://json-schema.org) can be used, and individual entries will get ignored automatically if they don't match the schema.
- **Path props**: path props (`foo.bar`) are supported for retrieving/setting/deleting entries.
- **Flat objects**: flat objects (`{ 'foo.bar': true, 'foo.baz': false }`) are supported transparently too.

## Install

```sh
npm install --save configuration
```

## Usage

For now you'll have to browse the [test suite](https://github.com/fabiospampinato/configuration/test) to check out exactly how to use this library.

//TODO: Write some actual usage instructions

## License

MIT © Fabio Spampinato
