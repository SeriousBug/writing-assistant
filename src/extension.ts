import * as _ from "lodash";
import * as vscode from "vscode";
import { UnknownLanguageError } from "./error";
import { parse } from "./parser";
import * as alex from "alex";

const EXTENSION_NAME = "Writing Assistant";

const ALEX_WARNING = vscode.languages.createDiagnosticCollection("alex");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "writing-assistant" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "writing-assistant.analyzeFile",
    () => {
      console.log(`${EXTENSION_NAME} is analyzing the file.`);
      const editor = vscode.window.activeTextEditor;
      if (_.isUndefined(editor)) {
        console.log("No document open, doing nothing.");
        return;
      }

      try {
        const parsed = parse(editor.document);
        let diagnostics: vscode.Diagnostic[] = [];
        parsed.forEach((comment) => {
          const checked = alex.text(comment.text).messages;
          checked.forEach((found) => {
            const { location, reason } = found;
            const diagnostic = new vscode.Diagnostic(
              new vscode.Range(
                new vscode.Position(
                  comment.range.start.line + location.start.line - 1, // why -1?
                  comment.range.start.character + location.start.column
                ),
                new vscode.Position(
                  comment.range.start.line + location.end.line - 1,
                  comment.range.start.character + location.end.column
                )
              ),
              reason
            );
            diagnostics.push(diagnostic);
          });
        });
        ALEX_WARNING.set(editor.document.uri, diagnostics);
      } catch (err) {
        console.warn(err);
        if (err instanceof UnknownLanguageError)
          vscode.window.showErrorMessage(
            "The programming language for the current file is not supported."
          );
        return;
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
