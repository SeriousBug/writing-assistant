import * as _ from "lodash";
import * as vscode from "vscode";
import { UnknownLanguageError } from "./error";
import { parse } from "./parser";
import { EXTENSION_NAME, ALEX_WARNING } from "./extension";
import { analyzer } from "./analyzer";
import { Processor } from "unified";
import { VFile } from "vfile";
import { sort as vfileSort, VFileMessage } from "vfile-sort";
import { getConfig } from "./config";

export async function analyzeFile(document: vscode.TextDocument) {
  console.log(`${EXTENSION_NAME} is analyzing the file.`);
  try {
    const parsed = parse(document);
    let diagnostics: vscode.Diagnostic[] = [];
    const processor: Processor = analyzer();
    const confidenceLimit = getConfig("confidenceLimit");

    await Promise.all(
      parsed.map(async (comment) => {
        const file = new VFile(comment.text);
        const tree = processor.parse(file);
        await processor.run(tree, file);

        vfileSort(file);
        file.messages.forEach(
          (found: VFileMessage & { confidence?: number }) => {
            const { position: location, reason, confidence } = found;
            if (_.isNull(location)) {
              console.warn(`Got warning without a location: ${reason}`);
              return;
            }
            if (!_.isUndefined(confidence) && confidence < confidenceLimit) {
              console.log(
                `Skipping warning due to low confidence (limit ${confidenceLimit}): ${reason}`,
              );
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
          },
        );
      }),
    );
    ALEX_WARNING.set(document.uri, diagnostics);
  } catch (err) {
    if (err instanceof UnknownLanguageError)
      vscode.window.showErrorMessage(
        "The programming language for the current file is not supported.",
      );
    else vscode.window.showErrorMessage(err);

    return;
  }
}
