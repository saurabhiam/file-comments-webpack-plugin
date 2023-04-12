const fs = require('fs');
const path = require('path');
const glob = require('glob');
const minimatch = require('minimatch');

function normalizeText(text) {
    return text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
}

const PLUGIN_NAME = "File Comments Plugin";

class FileCommentsPlugin {
    static defaultOptions = {
        srcDir: './',
        extensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'scss'],
        fix: false,
        ignorePatterns: '',
        templateFile: '',
        templateText: '',
        templateVariables: {},
        onFileCommentMismatch: 'prepend',
        commentRegex: '',
    }
    constructor(options) {
        if (!options.templateFile && !options.templateText) {
            throw new Error('Either templateFile or templateText must be provided.');
        }
        if (!options.commentRegex) {
            throw new Error('commentRegex option missing. Required for matching the comment text in files.');
        }
        this.options = { ...FileCommentsPlugin.defaultOptions, ...options };
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync(FileCommentsPlugin.name, (compilation, callback) => {
            const warningLog = [], errorLog = [];

            const { srcDir, extensions, fix, ignorePatterns, templateFile, templateText, templateVariables, commentRegex, onFileCommentMismatch } = this.options

            const sourceDir = !!srcDir ? srcDir : compiler.context;
            const exts = extensions.join(',');
            let files = glob.sync(`${sourceDir}/**/*.{${exts}}`);
            if (this.options.srcDir) {
                files = files.map((file) => path.join(compiler.context, file));
            }
            if (ignorePatterns) {
                files = files.filter(file => !ignorePatterns.some(pattern => minimatch(file, pattern)));
            }
            let commentText;
            if (templateFile) {
                commentText = fs.readFileSync(templateFile, 'utf8');
            } else {
                commentText = templateText;
            }
            if (templateVariables) {
                Object.entries(templateVariables).forEach(([key, value]) => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    commentText = commentText.replace(regex, value);
                });
            }
            commentText = normalizeText(commentText);
            let hasError = false, hasWarning = false;
            files.forEach(file => {
                let content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');

                // DETECT COMMENT BEFORE NON-COMMENT CONTENT IN FILES
                const firstNonCommentIndex = lines.findIndex(line => line.trim() !== '' && !line.trim().startsWith('/**'));
                if (firstNonCommentIndex > 0 && lines[firstNonCommentIndex - 1].trim().startsWith('/**')) {
                    // COMMENT DETECTED BEFORE CONTENT
                    const firstCommentIndex = lines.findIndex(line => line.startsWith('/**'));
                    if (firstCommentIndex !== -1) {
                        // CASE: IF COMMENT IS FOUND
                        const firstCommentEndIndex = lines.slice(firstCommentIndex).findIndex(line => line.endsWith('*/'));
                        if (firstCommentEndIndex !== -1) {
                            const firstCommentLines = lines.slice(firstCommentIndex, firstCommentIndex + firstCommentEndIndex + 1);
                            let firstCommentText = firstCommentLines.join('\n');
                            firstCommentText = normalizeText(firstCommentText);
                            if (commentRegex) {
                                const regex = new RegExp(commentRegex);
                                if (regex.test(firstCommentText)) {
                                    // IF COMMENT REGEX IS MATCHED BUT COMMENT DIFFERS
                                    if (firstCommentText !== commentText) {
                                        switch (onFileCommentMismatch) {
                                            case 'prepend':
                                                content = commentText + '\n\n' + content;
                                                break;
                                            case 'replace':
                                                lines.splice(firstCommentIndex, firstCommentEndIndex + 1);
                                                content = [...lines.slice(0, firstCommentIndex), commentText, ...lines.slice(firstCommentIndex)].join('\n');
                                                break;
                                        }
                                        if (fix) {
                                            fs.writeFileSync(file, content);
                                        } else {
                                            warningLog.push(`\x1B[4m${file}\x1B[0m\n\x1b[33mPartial mismatched comment text found. Use 'replace' option in plugin options to replace it.\x1b[0m`)
                                            hasWarning = true;
                                        }
                                    }
                                } else {
                                    // IF COMMENT REGEX IS NOT MATCHED AT ALL
                                    // PREPEND THE COMMENT MESSAGE
                                    content = commentText + '\n\n' + content;
                                    if (fix) {
                                        fs.writeFileSync(file, content);
                                    } else {
                                        warningLog.push(`\x1B[4m${file}\x1B[0m\n\x1b[33mPartial mismatched comment text found. Use 'replace' option in plugin options to replace it.\x1b[0m`)
                                        hasWarning = true;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // CASE: IF COMMENT IS NOT FOUND OR FOUND AFTER FILE CONTENT
                    if (fix) {
                        fs.writeFileSync(file, commentText + '\n' + content);
                    } else {
                        errorLog.push(`\x1B[4m${file}\x1B[0m\n\x1b[31mFile Comment Missing.\x1b[0m\n`)
                        hasError = true;
                    }
                }
            });

            if (hasError) {
                compilation.errors.push(`[${PLUGIN_NAME}]:\n${errorLog.join('\n')}`);
            }
            if (hasWarning) {
                compilation.warnings.push(`[${PLUGIN_NAME}]:\n${warningLog.join('\n')}`);
            }
            callback();
        });
    }
}

module.exports = FileCommentsPlugin;