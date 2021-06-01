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
    intensify: boolean;
  };
  equality: {
    noBinary: boolean;
    ignore: string[];
  };
  profanities: {
    sureness: number;
    ignore: string[];
  };
  passive: {
    ignore: string[];
  };
  readability: {
    age: number;
    threshold: number;
    minWords: number;
  };
  simplify: {
    ignore: string[];
  };
  intensify: {
    ignore: string[];
  };
};

const VSCODE_CONFIG = () =>
  vscode.workspace.getConfiguration("writing-assistant");

export function getConfig<T>(key: keyof Config): T {
  const selected = VSCODE_CONFIG().get(key);
  if (_.isUndefined(selected))
    throw new Error(`Unknown configuration key ${key}`);
  return selected as T;
}
