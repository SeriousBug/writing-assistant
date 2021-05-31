import _ from "lodash";
import vscode from "vscode";

export type Config = {
  autoAnalyzeOn: "edit" | "save" | "never";
  confidenceLimit: number;
  analyses: {
    equality: boolean;
    profanities: boolean;
    indefiniteArticle: boolean;
    passive: boolean;
    readability: boolean;
    repeated: boolean;
    simplify: boolean;
  };
};


const VSCODE_CONFIG = () =>
  vscode.workspace.getConfiguration("writing-assistant");

export function getConfig(key: keyof Config) {
  const selected = VSCODE_CONFIG().get(key);
  if (_.isUndefined(selected))
    throw new Error(`Unknown configuration key ${key}`);
  return selected;
}
