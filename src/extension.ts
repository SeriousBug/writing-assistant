import * as _ from "lodash";
import * as vscode from "vscode";
import { analyzeFile } from "./analyzeFile";

export const EXTENSION_NAME = "Writing Assistant";

export const ALEX_WARNING = vscode.languages.createDiagnosticCollection("alex");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(`${EXTENSION_NAME} is activated`);

  let disposable = vscode.commands.registerTextEditorCommand(
    "writing-assistant.analyzeFile",
    analyzeFile,
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
