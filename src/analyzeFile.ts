import * as _ from "lodash";
import * as vscode from "vscode";
import { UnknownLanguageError } from "./error";
import { Comment, parse as commentParser } from "./parser";
import { EXTENSION_NAME, WARNING } from "./extension";
import { analyzer as plaintextAnalyzer, markdownAnalyzer } from "./analyzer";
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

export async function analyzeFile(document: vscode.TextDocument, invokedViaCommand?: boolean) {
  console.log(`${EXTENSION_NAME} is analyzing the file.`);
  try {
    const diagnostics: vscode.Diagnostic[] = [];

    if (document.languageId === "markdown") {
      const processor = markdownAnalyzer();
      await analyzeDocument(processor, diagnostics, document);
      
    } else if (document.languageId === "plaintext") {
      const processor = plaintextAnalyzer();
      await analyzeDocument(processor, diagnostics, document);
    } else {
      const parsed = commentParser(document);
      const processor = plaintextAnalyzer();
      await analyzeComments(parsed, processor, diagnostics, document);
    }

    WARNING.set(document.uri, diagnostics);
  } catch (err) {
    if (err instanceof UnknownLanguageError) {
      const msg = `The programming language ${document.languageId} for the current file ${document.uri.toString()} is not supported.`;
      console.error(msg);
      if (invokedViaCommand) vscode.window.showErrorMessage(msg);
    }
    else {
      vscode.window.showErrorMessage(err);
      throw err;
    }
  }
}

const ZERO_POSITION = new vscode.Position(0, 0);

async function analyzeDocument(processor: Processor, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument) {
  const file = new VFile(document.getText());
  const tree = processor.parse(file);
  await processor.run(tree, file);
  vfileSort(file);
  reportMessages(ZERO_POSITION, file, diagnostics, document);
}

async function analyzeComments(parsed: Comment[], processor: Processor, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument) {
  await Promise.all(
    parsed.map(async (comment) => {
      const file = new VFile(comment.text);
      const tree = processor.parse(file);
      await processor.run(tree, file);

      vfileSort(file);
      reportMessages(comment.range.start, file, diagnostics, document);
    })
  );
}

function reportMessages(offset: vscode.Position, file: VFile, diagnostics: vscode.Diagnostic[], document: vscode.TextDocument) {
  const confidenceLimit: number = getConfig("confidenceLimit");

  for (const found of file.messages as AnalyzedMessage[]) {
    if (_.isNull(found.position)) {
      console.warn(`Got warning without a location: ${found.reason}`);
      continue;
    }
    if (confidence(found) < confidenceLimit) {
      console.log(
        `Skipping warning due to low confidence (limit ${confidenceLimit}): ${found.reason}`
      );
      continue;
    }
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(
        new vscode.Position(
          offset.line + found.position.start.line - 1,
          offset.character + found.position.start.column
        ),
        new vscode.Position(
          offset.line + found.position.end.line - 1,
          offset.character + found.position.end.column
        )
      ),
      found.reason
    );
    diagnostic.source = `${found.source} (${found.ruleId})`;
    diagnostics.push(diagnostic);
    // if (found.expected) {
    //   for (const solution of found.expected) {
    //     const action = new vscode.CodeAction(found.ruleId, vscode.CodeActionKind.QuickFix);
    //     action.diagnostics = [diagnostic];
    //     action.edit = new vscode.WorkspaceEdit();
    //     action.edit.replace(document.uri, diagnostic.range, solution);
    //   }
    // }
  }
}