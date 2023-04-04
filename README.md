# file-comments-webpack-plugin

A Webpack plugin that  **checks**  whether the specified **comment headers**  are included in the  **source files**  of a project and fixes it automatically.

- It can  **insert the comment headers**  to a file in case it does not exist.
- It can  **replace the comment headers**  of a file in case it is slightly different than the target, after matching pattern.
-  It can **prepend the specified comment headers** if a different comment is detected in a file.
-  **Only the selected file extensions**  will be  **processed**.
-  Specific  **folders, files and paths can be ignored**.
-  Comments can be specified in a **file or as a template string**.
- It can **automatically fix the comments** or warn users about it.

## Installation
```bash
npm i -D file-comments-webpack-plugin
```


## Configuration
```js
const  FileCommentsPlugin = require('file-comments-webpack-plugin');

const  config = {
	plugins: [
		new FileCommentsPlugin({
			templateText: `/**
			* Copyright © {{year}} {{author}}. All rights reserved.
			*/`,
			fix: true,
			templateVariables: {
				year: new Date().getFullYear(),
				author: 'Saurabh Sharma'
			},
			onFileCommentMismatch: "replace", //'prepend' or 'replace'
			commentRegex: /\/\*\*[\s\S]*?Copyright[\s\S]*?All rights[\s\S]*?\*\//
		});
	]
}
module.exports = config;
```

#### With source directory and ignore patterns
```js
const  FileCommentsPlugin = require('file-comments-webpack-plugin');

const  config = {
	plugins: [
		new FileCommentsPlugin({
			srcDir: './src',
			ignorePatterns: ['**/package.json', '**/*.test.{js,jsx}'],
			templateText: `/**
			* Copyright © {{year}} {{author}}. All rights reserved.
			*/`,
			fix: true,
			templateVariables: {
				year: new Date().getFullYear(),
				author: 'Saurabh Sharma'
			},
			onFileCommentMismatch: "replace", //'prepend' or 'replace'
			commentRegex: /\/\*\*[\s\S]*?Copyright[\s\S]*?All rights[\s\S]*?\*\//
		});
	]
}
module.exports = config;
```

#### With template file
```js
const  FileCommentsPlugin = require('file-comments-webpack-plugin');

const  config = {
	plugins: [
		new FileCommentsPlugin({
			templateFile: './config/copyright-template.txt', //templateFile has more precedence over templateText
			fix: true,
			templateVariables: {
				year: new Date().getFullYear(),
				author: 'Saurabh Sharma'
			},
			onFileCommentMismatch: "replace", //'prepend' or 'replace'
			commentRegex: /\/\*\*[\s\S]*?Copyright[\s\S]*?All rights[\s\S]*?\*\//
		});
	]
}
module.exports = config;
```


## Options

|Option|Value|Default value|Description
|--|--|--|--|
|`srcDir`|`<source dir>`|[`webpack context`](https://webpack.js.org/configuration/entry-context/#context)| The source directory to process files in.
|`fix`|`Boolean`|`false`| Whether to automatically fix missing or mismatched comments.
|`extensions`|`Array<string>`|`['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss']`|   The file extensions to include.
|`ignorePatterns`|`Array<string>`|`[]`| The source directory to process files in.
|`templateFile`|`<file path>`| | The template file path to use.
|`templateText`|`String`| | The template text to use.
|`templateVariables`|`Object`| `{}` | The template variables to use.
|`onFileCommentMismatch`|`"prepend"\|"replace"`| `"prepend"` | How to handle mismatched comment.
|`commentRegex`|`RegExp`| `//` | The regular expression for matching comments to perform the action on comment mismatch (onFileCommentMismatch).
