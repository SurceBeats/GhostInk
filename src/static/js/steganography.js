export function normalize(text) {
  // prettier-ignore
  const special = {
    "\u00F1": "n", "\u00D1": "N",       // ñ Ñ
    "\u00DF": "ss",                       // ß
    "\u00E6": "ae", "\u00C6": "AE",      // æ Æ
    "\u00F8": "o", "\u00D8": "O",        // ø Ø
    "\u00F0": "d", "\u00D0": "D",        // ð Ð
    "\u00FE": "th", "\u00DE": "Th",      // þ Þ
    "\u0142": "l", "\u0141": "L",        // ł Ł
    "\u0153": "oe", "\u0152": "OE",      // œ Œ
    "\u2018": "'", "\u2019": "'",        // ' '
    "\u201C": '"', "\u201D": '"',        // " "
    "\u2014": "-", "\u2013": "-",        // — –
    "\u2026": "...",                       // …
  };

  let result = "";
  for (const char of text) {
    if (special[char]) {
      result += special[char];
    } else {
      result += char;
    }
  }

  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return result.replace(/[^\x01-\x7e]/g, "");
}

export function encode(emoji, secretText) {
  const clean = normalize(secretText);
  const tagChars = [...clean].map((c) => String.fromCodePoint(0xe0000 + c.codePointAt(0))).join("");
  const cancelTag = String.fromCodePoint(0xe007f);
  return emoji + tagChars + cancelTag;
}

export function decode(input) {
  return [...input]
    .filter((c) => {
      const cp = c.codePointAt(0);
      return cp >= 0xe0001 && cp <= 0xe007e;
    })
    .map((c) => String.fromCodePoint(c.codePointAt(0) - 0xe0000))
    .join("");
}

export function analyzeCodepoints(input) {
  return [...input].map((c) => {
    const cp = c.codePointAt(0);
    if (cp >= 0xe0001 && cp <= 0xe007e) {
      return {
        type: "tag",
        char: String.fromCodePoint(cp - 0xe0000),
        codepoint: cp,
      };
    } else if (cp === 0xe007f) {
      return { type: "cancel", char: "\u26D4", codepoint: cp };
    } else {
      return { type: "visible", char: c, codepoint: cp };
    }
  });
}
