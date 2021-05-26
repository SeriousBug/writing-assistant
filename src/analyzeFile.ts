import * as vscode from "vscode";
import { UnknownLanguageError } from "./error";
import { parse } from "./parser";
import * as alex from "alex";
import { EXTENSION_NAME, ALEX_WARNING } from "./extension";

export function analyzeFile(textEditor: vscode.TextEditor) {
  console.log(`${EXTENSION_NAME} is analyzing the file.`);
  try {
    const parsed = parse(textEditor.document);
    let diagnostics: vscode.Diagnostic[] = [];
    parsed.forEach((comment) => {
      const checked = alex.text(comment.text).messages;
      checked.forEach((found) => {
        const { location, reason } = found;
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
    });
    ALEX_WARNING.set(textEditor.document.uri, diagnostics);
  } catch (err) {
    console.warn(err);
    if (err instanceof UnknownLanguageError)
      vscode.window.showErrorMessage(
        "The programming language for the current file is not supported."
      );
    return;
  }
}
