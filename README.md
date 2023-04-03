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
