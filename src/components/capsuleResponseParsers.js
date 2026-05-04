/** Shared parsing for AI capsule responses (Results + Market Analysis recap). */

function parseBoldLeadBlocks(md) {
  if (!md?.trim()) return [];
  const blocks = [];
  const re = /\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n*\*\*|$)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    const title = m[1].trim();
    const body = m[2].trim();
    if (title.length && title.length < 100) blocks.push({ title, body });
  }
  return blocks;
}

function parseListColonBlocks(text) {
  if (!text?.trim()) return [];
  const blocks = [];
  const seen = new Set();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const stripped = line
      .replace(/^\s*(?:[-*•]|\d+[.)]+)\s+/, "")
      .replace(/\*\*/g, "")
      .trim();
    const idx = stripped.indexOf(":");
    if (idx <= 1 || idx >= stripped.length - 1) continue;
    const title = stripped.slice(0, idx).trim();
    const body = stripped.slice(idx + 1).trim();
    if (title.length < 2 || body.length < 1) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    blocks.push({ title, body });
  }
  return blocks;
}

function extractCompanionPreamble(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const firstBullet = lines.findIndex((l) => l && /^\s*(?:[-*•]|\d+[.)]+)\s+/.test(l));
  if (firstBullet <= 0) return null;
  const before = lines.slice(0, firstBullet).filter(Boolean);
  if (before.length >= 2) {
    return { title: before[0], body: before.slice(1).join(" ") };
  }
  if (before.length === 1) {
    return { title: before[0], body: "" };
  }
  return null;
}

export function normalizeListMarkdownToParagraphs(text) {
  if (!text?.trim()) return text;
  const lines = text.split(/\r?\n/);
  const chunks = [];
  let buf = [];
  const flushBuf = () => {
    if (buf.length) {
      chunks.push(buf.join(" "));
      buf = [];
    }
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBuf();
      continue;
    }
    const isList = /^\s*(?:[-*•]|\d+[.)]+)\s+/.test(line);
    const content = trimmed.replace(/^\s*(?:[-*•]|\d+[.)]+)\s+/, "").trim();
    if (isList) {
      flushBuf();
      chunks.push(content);
    } else {
      buf.push(trimmed);
    }
  }
  flushBuf();
  return chunks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function mergeBlocksUnique(blocks) {
  const m = new Map();
  for (const b of blocks) {
    const k = b.title.toLowerCase();
    if (!m.has(k)) m.set(k, b);
  }
  return Array.from(m.values());
}

export function parseMaterialsForDisplay(md) {
  if (!md?.trim()) return { mode: "markdown", text: md || "" };
  const fromBold = parseBoldLeadBlocks(md);
  const fromList = parseListColonBlocks(md);
  const merged = mergeBlocksUnique([...fromBold, ...fromList]);
  if (merged.length >= 1) {
    return { mode: "blocks", blocks: merged };
  }

  const colonBlocks = [];
  for (const para of md.split(/\n\n+/)) {
    const line = para.replace(/\*\*/g, "").split("\n")[0]?.trim();
    if (!line) continue;
    const cm =
      line.match(/^([^:–—-]{2,80})[:–—-]\s*(.+)$/) ||
      line.match(/^([^:–—-]{2,80}):\s*(.+)$/);
    if (cm) {
      colonBlocks.push({
        title: cm[1].replace(/^[-*•\s]+/, "").trim(),
        body: (cm[2] + para.slice(line.length)).trim(),
      });
    }
  }
  if (colonBlocks.length >= 1) return { mode: "blocks", blocks: colonBlocks };
  return {
    mode: "markdown",
    text: normalizeListMarkdownToParagraphs(md),
  };
}

export function parseSalesPriceForDisplay(text) {
  if (!text?.trim()) return { body: "", retailValue: null };

  let retailValue = null;
  const rangePatterns = [
    /(?:Recommended|Suggested)\s+retail\s*:?\s*\*?\s*(\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?)/i,
    /\*\*Retail\s+price:\*\*\s*(\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?)/i,
    /(?:Retail\s+price|RRP|MSRP)\s*:?\s*(\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?)/i,
    /retail\s+(?:range|of|at|around|is)\s*:?\s*(\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?)/i,
    /(?:^|\n)\s*(?:Recommended\s+retail|Retail\s+price|Retail)\s*:?\s*(\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?)/im,
  ];
  for (const re of rangePatterns) {
    const m = text.match(re);
    if (m?.[1]) {
      retailValue = m[1].replace(/\s*-\s*/g, "–");
      break;
    }
  }
  if (!retailValue) {
    const pair = text.match(/(\$[\d,.]+)\s*[-–]\s*(\$[\d,.]+)/);
    if (pair) retailValue = `${pair[1]}–${pair[2]}`;
  }
  if (!retailValue) {
    const all = text.match(/\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?/g);
    if (all?.length) retailValue = all[all.length - 1];
  }

  let body = text;
  if (retailValue) {
    const esc = retailValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    body = body
      .replace(
        new RegExp(
          `(?:\\*\\*)?(?:Recommended|Suggested)\\s+retail\\s*:?\\s*(?:\\*\\*)?\\s*${esc}[^\\n]*`,
          "gi"
        ),
        ""
      )
      .replace(
        new RegExp(`\\*\\*Retail\\s+price:\\*\\*\\s*${esc}[^\\n]*`, "gi"),
        ""
      )
      .replace(
        new RegExp(`(?:Retail\\s+price|RRP|MSRP)\\s*:?\\s*${esc}[^\\n]*`, "gi"),
        ""
      )
      .replace(
        new RegExp(`^\\s*[-*•]?\\s*Recommended\\s+retail[^\\n]*${esc}[^\\n]*$`, "gim"),
        ""
      )
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  body = normalizeListMarkdownToParagraphs(body);
  body = body
    .replace(
      /^\*\*(?:Recommended\s+retail|Retail\s+price):\*\*\s*\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?\s*/im,
      ""
    )
    .replace(
      /^(?:Recommended\s+retail|Retail\s+price):\s*\$[\d,.]+(?:\s*[-–]\s*\$[\d,.]+)?\s*/im,
      ""
    )
    .trim();

  return { body: body || text, retailValue };
}

export function parseCompanionForDisplay(text) {
  if (!text?.trim()) return { mode: "markdown", text: text || "" };

  const preamble = extractCompanionPreamble(text);
  const listBlocks = parseListColonBlocks(text);
  const fromBold = parseBoldLeadBlocks(text);

  const mergedPieces = mergeBlocksUnique([...listBlocks, ...fromBold]);
  const preambleTitle = (preamble?.title || "").toLowerCase();

  const blocks = [];
  if (preamble?.title) blocks.push(preamble);
  for (const b of mergedPieces) {
    if (
      preambleTitle &&
      b.title.toLowerCase() === preambleTitle &&
      !b.body.trim()
    )
      continue;
    blocks.push(b);
  }

  if (blocks.length >= 1) return { mode: "blocks", blocks };

  const out = [];
  for (const block of text.split(/\n\n+/)) {
    const raw = block.trim();
    if (!raw) continue;
    const firstLine = raw.split(/\r?\n/)[0];
    const plain = firstLine.replace(/\*\*/g, "");
    const mc = plain.match(/^([^:–—]{2,100})[:–—]\s*(.*)$/);
    if (mc) {
      const restOfBlock = raw.slice(firstLine.length).trim();
      const bodyPart = mc[2].trim()
        ? `${mc[2].trim()}${restOfBlock ? `\n${restOfBlock}` : ""}`
        : restOfBlock;
      out.push({
        title: mc[1].replace(/^[-*•\d.]+\s*/, "").trim(),
        body: bodyPart || mc[2].trim(),
      });
    }
  }
  if (out.length > 0) return { mode: "blocks", blocks: out };
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const plain = line.replace(/\*\*/g, "");
    const mc = plain.match(/^([^:–—]{2,100})[:–—]\s*(.+)$/);
    if (mc) {
      out.push({
        title: mc[1].replace(/^[-*•\d.]+\s*/, "").trim(),
        body: mc[2].trim(),
      });
    }
  }
  if (out.length > 0) return { mode: "blocks", blocks: out };
  return {
    mode: "markdown",
    text: normalizeListMarkdownToParagraphs(text),
  };
}
