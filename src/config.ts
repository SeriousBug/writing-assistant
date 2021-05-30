import vscode from "vscode";
import _ from "lodash";

export type Config = {
  autoAnalyzeOn: "edit" | "save" | "never";
  confidenceLimit: number;
};

const DEFAULTS: Config = {
  autoAnalyzeOn: "save",
  confidenceLimit: 0.8,
};

const VSCODE_CONFIG = vscode.workspace.getConfiguration("writing-assistant");

export function getConfig(key: keyof Config) {
  const selected = VSCODE_CONFIG.get(`writing-assistant.${key}`);
  if (_.isUndefined(selected)) return DEFAULTS[key];
  return selected;
}
