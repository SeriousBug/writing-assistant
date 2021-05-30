import * as _ from "lodash";
import * as vscode from "vscode";
import { analyzeFile } from "./analyzeFile";
import { getConfig } from "./config";

export const EXTENSION_NAME = "Writing Assistant";
export const EXTENSION_CODE = "writing-assistant";

export const ALEX_WARNING = vscode.languages.createDiagnosticCollection("alex");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log(`${EXTENSION_NAME} is activated`);

  const disposableCommand = vscode.commands.registerTextEditorCommand(
    "writing-assistant.analyzeFile",
    (editor) => analyzeFile(editor.document),
  );
  context.subscriptions.push(disposableCommand);

  // Set up callback functions for auto-analyzing the file if configured to do
  // so. We also update these callbacks if configuration changes.
  vscode.workspace.onDidChangeConfiguration(() => {
    setupCallbacks(context);
  });
  setupCallbacks(context);
}

let callbackDisposables: vscode.Disposable[] = [];

function setupCallbacks(context: vscode.ExtensionContext) {
  for (const disposable of callbackDisposables) disposable.dispose();
  callbackDisposables = [];

  const autoAnalyzeOn = getConfig("autoAnalyzeOn");
  switch (autoAnalyzeOn) {
    case "edit":
      const disposableEdit = vscode.workspace.onDidChangeTextDocument((event) =>
        analyzeFile(event.document),
      );
      callbackDisposables.push(disposableEdit);
    case "save":
      const disposableSave =
        vscode.workspace.onDidSaveTextDocument(analyzeFile);
      callbackDisposables.push(disposableSave);
    case "never":
    /* deliberately left empty */
  }
  if (autoAnalyzeOn !== "never") {
    const disposableOpen = vscode.workspace.onDidOpenTextDocument(analyzeFile);
    callbackDisposables.push(disposableOpen);
  }
  context.subscriptions.push(...callbackDisposables);
}

// this method is called when your extension is deactivated
export function deactivate() {}
