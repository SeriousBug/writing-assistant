/** This file contains code taken from the better-comments project, available at: https://github.com/aaron-bond/better-comments
 *
 * Copyright of the original code is owned Aaron Bond and other contributors of the better-comments project.
 * Below is the copyright notice from the original project:
 *
 * MIT License Copyright (c) 2017 Aaron Bond
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * This file includes modification by the Writing Assistant project.
 * Any such modifications are also provided under the MIT license:
 *
 * MIT License Copyright (c) 2021 Kaan Genc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
import * as _ from "lodash";
import { UnknownLanguageError } from "./error";

export type CommentSymbols = {
  singleLine?: string;
  multiLine?: [string, string];
};

/**
 * Escapes a given string for use in a regular expression
 * @param input The input string to be escaped
 * @returns {string} The escaped string
 */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function languageIdToDelimiters(languageId: string): CommentSymbols {
  function match(): CommentSymbols {
    switch (languageId) {
      case "asciidoc":
        return {
          singleLine: "//",
          multiLine: ["////", "////"],
        };
      case "apex":
      case "javascript":
      case "javascriptreact":
      case "typescript":
      case "typescriptreact":
        return {
          singleLine: "//",
          multiLine: ["/*", "*/"],
        };
      case "al":
      case "c":
      case "cpp":
      case "csharp":
      case "dart":
      case "flax":
      case "fsharp":
      case "go":
      case "groovy":
      case "haxe":
      case "java":
      case "jsonc":
      case "kotlin":
      case "less":
      case "pascal":
      case "objectpascal":
      case "php":
      case "rust":
      case "scala":
      case "sass":
      case "scss":
      case "shaderlab":
      case "stylus":
      case "swift":
      case "verilog":
      case "vue":
        return { singleLine: "//", multiLine: ["/*", "*/"] };
      case "css":
        return { multiLine: ["/*", "*/"] };
      case "coffeescript":
      case "dockerfile":
      case "gdscript":
      case "graphql":
      case "julia":
      case "makefile":
      case "perl":
      case "perl6":
      case "puppet":
      case "r":
      case "ruby":
      case "shellscript":
      case "tcl":
      case "yaml":
        return { singleLine: "#" };
      case "elixir":
      case "python":
        return { singleLine: "#", multiLine: ['"""', '"""'] };
      case "nim":
        return { singleLine: "#", multiLine: ["#[", "]#"] };
      case "powershell":
        return { singleLine: "#", multiLine: ["<#", "#>"] };
      case "ada":
      case "hive-sql":
      case "pig":
      case "plsql":
      case "sql":
        return { singleLine: "--" };
      case "lua":
        return { singleLine: "--", multiLine: ["--[[", "]]"] };
      case "elm":
      case "haskell":
        return { singleLine: "--", multiLine: ["{-", "-}"] };
      case "brightscript":
      case "diagram": // ? PlantUML is recognized as Diagram (diagram)
      case "vb":
        return { singleLine: "'" };
      case "bibtex":
      case "erlang":
      case "matlab":
        return { singleLine: "%" };
      case "clojure":
      case "racket":
      case "lisp":
        return { singleLine: ";" };
      case "terraform":
        return { singleLine: "#", multiLine: ["/*", "*/"] };
      case "COBOL":
        return { singleLine: "*>" };
      case "fortran-modern":
        return { singleLine: "c" };
      case "SAS":
      case "stata":
        return { singleLine: "*", multiLine: ["/*", "*/"] };
      case "html":
      case "xml":
        return { singleLine: "<!--", multiLine: ["<!--", "-->"] };
      case "twig":
        return { singleLine: "{#", multiLine: ["{#", "#}"] };
      case "genstat":
        return { singleLine: "\\", multiLine: ['"', '"'] };
      case "cfml":
        return { singleLine: "<!---", multiLine: ["<!---", "--->"] };

      // TODO: Doesn't really make sense to check the comments on a markdown or latex file, you'd ideally want to check the whole file minus any symbols.
      // case "latex":
      // case "markdown":
      // TODO: Need to figure out a way to handle text files well.
      // case "plaintext":

      default:
        throw new UnknownLanguageError(
          `Unsupported language code ${languageId}`
        );
    }
  }
  const comment = match();
  if (!_.isUndefined(comment.singleLine))
    comment.singleLine = escapeRegExp(comment.singleLine);
  if (!_.isUndefined(comment.multiLine)) {
    comment.multiLine[0] = escapeRegExp(comment.multiLine[0]);
    comment.multiLine[1] = escapeRegExp(comment.multiLine[1]);
  }
  return comment;
}
