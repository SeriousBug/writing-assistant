import unified from "unified";
import english from "retext-english";
import equality from "retext-equality";
import profanities from "retext-profanities";
import indefiniteArticle from "retext-indefinite-article";
import passive from "retext-passive";
import readability from "retext-readability";
import repeated from "retext-repeated-words";
import simplify from "retext-simplify";

export function analyzer() {
  return unified()
    .use(english)
    .use(equality)
    .use(profanities)
    .use(indefiniteArticle)
    .use(passive)
    .use(readability)
    .use(repeated)
    .use(simplify);
}
