import * as _ from "lodash";
import * as vscode from "vscode";
import { UnknownLanguageError } from "./error";
import { parse } from "./parser";
import { EXTENSION_NAME, ALEX_WARNING } from "./extension";
import { analyzer } from "./analyzer";
import { Processor } from "unified";
import { VFile } from "vfile";
import { sort as vfileSort, VFileMessage } from "vfile-sort";

export async function analyzeFile(document: vscode.TextDocument) {
  console.log(`${EXTENSION_NAME} is analyzing the file.`);
  try {
    const parsed = parse(document);
    let diagnostics: vscode.Diagnostic[] = [];
    Promise.all(
      parsed.map(async (comment) => {
        const processor: Processor = analyzer();
        const file = new VFile(comment.text);
        const tree = processor.parse(file);
        await processor.run(tree, file);

        vfileSort(file);
        file.messages.forEach((found: VFileMessage) => {
          const { position: location, reason } = found;
          if (_.isNull(location)) {
            console.warn(`Got warning without a location: ${reason}`);
            return;
          }
          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(
              new vscode.Position(
                comment.range.start.line + location.start.line - 1,
                comment.range.start.character + location.start.column,
              ),
              new vscode.Position(
                comment.range.start.line + location.end.line - 1,
                comment.range.start.character + location.end.column,
              ),
            ),
            reason,
          );
          diagnostics.push(diagnostic);
        });
      }),
    );
    ALEX_WARNING.set(document.uri, diagnostics);
  } catch (err) {
    console.warn(err);
    if (err instanceof UnknownLanguageError)
      vscode.window.showErrorMessage(
        "The programming language for the current file is not supported.",
      );
    else vscode.window.showErrorMessage(err);

    return;
  }
}
