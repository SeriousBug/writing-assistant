import unified from "unified";
import * as english from "retext-english";
import * as equality from "retext-equality";
import * as indefiniteArticle from "retext-indefinite-article";
import * as passive from "retext-passive";
import * as readability from "retext-readability";
import * as repeated from "retext-repeated-words";
import * as simplify from "retext-simplify";
import * as spell from "retext-spell";
import * as dictionary from "dictionary-en";

export function analyzer() {
  return unified()
    .use(english)
    .use(equality)
    .use(indefiniteArticle)
    .use(passive)
    .use(readability)
    .use(repeated)
    .use(simplify)
    .use(spell, dictionary);
}
