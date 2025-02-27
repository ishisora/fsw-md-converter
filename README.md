# fsw-md-converter

A CLI tool for bidirectional conversion between FreeStyleWiki and Markdown.

## Requirements

- Node.js

## Installation

```sh
npm install
```

## Usage

1. Prepare a FreeStyleWiki (.fsw, .fswiki) or Markdown (.md) file.

2. Run the conversion command:

For example, to convert from FreeStyleWiki to Markdown:

```sh
npm start sample/input.fsw sample/output.md
```

Or to convert from Markdown to FreeStyleWiki:

```sh
npm start sample/input.md sample/output.fsw
```

## Running Tests

```sh
npm test
```

## Reference

- https://github.com/FreeStyleWiki/fswiki/blob/master/lib/Wiki/Parser.pm
- https://daringfireball.net/projects/markdown/syntax
- https://github.com/isso-719/freestylewiki-live-viewer-vscode
