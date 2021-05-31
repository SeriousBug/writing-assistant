import english from "retext-english";
import equality from "retext-equality";
import { getConfig } from "./config";
import indefiniteArticle from "retext-indefinite-article";
import passive from "retext-passive";
import profanities from "retext-profanities";
import readability from "retext-readability";
import redundantAcronyms from "retext-redundant-acronyms";
import repeated from "retext-repeated-words";
import simplify from "retext-simplify";
import unified from "unified";

export function analyzer() {
  const processor = unified().use(english);
  const config = getConfig("analyses");
  if (config.equality) processor.use(equality);
  if (config.profanities) processor.use(profanities);
  if (config.indefiniteArticle) processor.use(indefiniteArticle);
  if (config.passive) processor.use(passive)
  if (config.readability) processor.use(readability)
  if (config.repeated) processor.use(repeated)
  if (config.simplify) processor.use(simplify)
  if (config.redundantAcronyms) processor.use(redundantAcronyms);
  return processor();
}
