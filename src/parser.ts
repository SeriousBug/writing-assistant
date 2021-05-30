import * as _ from "lodash";
import { TextDocument, Range } from "vscode";
import { languageIdToDelimiters } from "./commentSymbols";
import { ParserError } from "./error";

type Comment = {
  type: "singleLine" | "multiLine";
  text: string;
  range: Range;
};

function languageIdToRegex(languageId: string): RegExp {
  const { singleLine, multiLine } = languageIdToDelimiters(languageId);

  let singleLineRegex: string | undefined;
  if (!_.isUndefined(singleLine))
    singleLineRegex =
      "" +
      // starts with the single line symbol
      `${singleLine}` +
      // followed by the text of the comment
      "(?<singleLineCommentText>.*?)" +
      // ending with the end of the line
      "$";
  let multiLineRegex: string | undefined;
  if (!_.isUndefined(multiLine)) {
    const [multiLineStart, multiLineEnd] = multiLine;
    multiLineRegex =
      "" +
      // starts with the starting symbol
      `${multiLineStart}` +
      // followed by the text of the comment (text, whitespace, and new lines)
      "(?<multiLineCommentText>[\\s\\S\\n]*?)" +
      // ending with the ending symbol
      `${multiLineEnd}`;
  }
  let finalRegex = "";
  if (!_.isUndefined(singleLineRegex)) {
    finalRegex += singleLineRegex;
    if (!_.isUndefined(multiLineRegex)) finalRegex += "|";
  }
  if (!_.isUndefined(multiLineRegex)) finalRegex += multiLineRegex;
  return new RegExp(
    finalRegex,
    // g: find all matches, not just one
    // m: each match can span multiple lines, required for multiline comments
    "gm",
  );
}

export function parse(document: TextDocument): Comment[] {
  let comments: Comment[] = [];
  const languageId = document.languageId;
  const regex = languageIdToRegex(languageId);

  let match: RegExpExecArray | null;
  while ((match = regex.exec(document.getText()))) {
    if (_.isUndefined(match.groups)) {
      console.warn("Matched a comment, but no comment text.", match);
      continue;
    }
    const { singleLineCommentText, multiLineCommentText } = match.groups;
    if (multiLineCommentText) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      comments.push({
        type: "multiLine",
        text: multiLineCommentText,
        range: new Range(startPos, endPos),
      });
    } else if (singleLineCommentText) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length);
      comments.push({
        type: "singleLine",
        text: singleLineCommentText,
        range: new Range(startPos, endPos),
      });
    } else {
      throw new ParserError("Comment matched, but not a single or multi line comment");
    }
  }
  return comments;
}
