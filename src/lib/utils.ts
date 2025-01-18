import { marked } from "marked";
import DOMPurify from "dompurify";

export function generateTimeString(date: string): string {
  const obj = new Date(date);
  const diff = (Date.now() - obj.getTime()) / 1000;

  if (Math.floor(diff) == 0) {
    return "just now";
  } else if (diff < 60) {
    return `${Math.floor(diff)} seconds ago`;
  } else if (diff / 60 < 60) {
    return `${Math.floor(diff / 60)} minutes ago`;
  } else if (diff / 60 / 60 < 24) {
    return `${Math.floor(diff / 3600)} hours ago`;
  } else if (diff / 60 / 60 / 24 < 30) {
    return `${Math.floor(diff / 86400)} days ago`;
  }

  return obj.toDateString();
}

export function parseMsg(content: string): string {
  let cleaned = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "strong",
      "i",
      "em",
      "mark",
      "small",
      "del",
      "ins",
      "sub",
      "sup",
    ],
  });

  let final = DOMPurify.sanitize(marked(cleaned) as string);

  const urlInImg = /<img[^>]+src="([^">]+)"/g;

  if (urlInImg.test(final)) {
    final = final.replace(urlInImg, (match, url) => {
      return match.replace(url, `https://corsproxy.io/?url=${url}`);
    });
  }

  final = final.replace("<img", '<img id="msg-img"');

  return final;
}

export function parseAboutMe(content: string): string {
  let cleaned = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "strong",
      "i",
      "em",
      "mark",
      "small",
      "del",
      "ins",
      "sub",
      "sup",
    ],
  });

  let lexer = new marked.Lexer();

  lexer.tokenizer.rules.block.heading = {
    exec: function () {
      return undefined;
    },
  };

  return DOMPurify.sanitize(marked.parser(lexer.lex(cleaned)) as string, {
    FORBID_TAGS: ["img"],
  });
}
