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

export type AnalyzedMessage = VFileMessage & {
  /** How confident the analysis is that the issue is a true positive, between 0 and 1.*/
  confidence?: number;
  /** How confident the analysis is that the issue is a true positive, between 0 and 2.*/
  profanitySeverity?: number;
  /** Suggestions for alternatives. */
  expected?: string[];
  /** Which analysis the message comes from. */
  source?: string;
  /** A categorization for the message. */
  ruleId?: string;
  /** Extra information. Not sure if this is even used? */
  note?: string;
};

function confidence(message: AnalyzedMessage): number {
  const { confidence, profanitySeverity } = message;
  if (!_.isUndefined(confidence)) return confidence;
  if (!_.isUndefined(profanitySeverity)) return profanitySeverity / 2.0;
  // If not specified, it's fully certain
  return 1;
}

export async function analyzeFile(document: vscode.TextDocument) {
  console.log(`${EXTENSION_NAME} is analyzing the file.`);
  try {
    const parsed = parse(document);
    let diagnostics: vscode.Diagnostic[] = [];
    const processor: Processor = analyzer();
    const confidenceLimit: number = getConfig("confidenceLimit");

    await Promise.all(
      parsed.map(async (comment) => {
        const file = new VFile(comment.text);
        const tree = processor.parse(file);
        await processor.run(tree, file);

        vfileSort(file);
        for (const found of file.messages as AnalyzedMessage[]) {
          if (_.isNull(found.position)) {
            console.warn(`Got warning without a location: ${found.reason}`);
            return;
          }
          if (confidence(found) < confidenceLimit) {
            console.log(
              `Skipping warning due to low confidence (limit ${confidenceLimit}): ${found.reason}`,
            );
            return;
          }
          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(
              new vscode.Position(
                comment.range.start.line + found.position.start.line - 1,
                comment.range.start.character + found.position.start.column,
              ),
              new vscode.Position(
                comment.range.start.line + found.position.end.line - 1,
                comment.range.start.character + found.position.end.column,
              ),
            ),
            `(${found.ruleId}): ${found.reason}`,
          );
          diagnostic.source = found.source;
          diagnostics.push(diagnostic);
        }
      }),
    );
    ALEX_WARNING.set(document.uri, diagnostics);
  } catch (err) {
    if (err instanceof UnknownLanguageError)
      vscode.window.showErrorMessage(
        "The programming language for the current file is not supported.",
      );
    else {
      vscode.window.showErrorMessage(err);
      throw err;
    }
  }
}
