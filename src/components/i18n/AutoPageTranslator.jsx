import { useEffect, useRef } from "react";
import { useTranslation } from "../../i18n";
import { requestTranslations } from "../../services/i18nService";
import useResolvedLanguage from "../../hooks/useResolvedLanguage";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "OPTION",
  "CODE",
  "PRE",
  "SVG",
  "PATH",
  "IFRAME"
]);
const LETTER_REGEX = /[A-Za-z\u0900-\u097F]/;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const MAX_CHUNK_SIZE = 40;

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function isTranslatableText(text) {
  if (!text || text.length < 2) return false;
  if (!LETTER_REGEX.test(text)) return false;
  return true;
}

function isAlreadyInTargetScript(targetLang, text) {
  if (!text) return false;
  if (targetLang === "hi" || targetLang === "mr") {
    return DEVANAGARI_REGEX.test(text);
  }
  return false;
}

function preserveWhitespace(rawText, translatedCore) {
  const raw = String(rawText || "");
  const leading = (raw.match(/^\s*/) || [""])[0];
  const trailing = (raw.match(/\s*$/) || [""])[0];
  return `${leading}${translatedCore}${trailing}`;
}

function chunkArray(values, chunkSize) {
  const chunks = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }
  return chunks;
}

export default function AutoPageTranslator() {
  const { lang } = useTranslation();
  const { resolvedLanguage } = useResolvedLanguage();
  const originalTextByNodeRef = useRef(new WeakMap());
  const trackedNodesRef = useRef(new Set());
  const translatedCacheRef = useRef(new Map());
  const isApplyingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return undefined;

    const rememberOriginalText = (node) => {
      if (!originalTextByNodeRef.current.has(node)) {
        originalTextByNodeRef.current.set(node, node.nodeValue || "");
      }
      trackedNodesRef.current.add(node);
      return originalTextByNodeRef.current.get(node) || "";
    };

    const collectNodes = () => {
      const map = new Map();
      const root = document.body;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let currentNode = walker.nextNode();

      while (currentNode) {
        const parent = currentNode.parentElement;
        if (parent) {
          const blocked = parent.closest("[data-no-auto-translate='true']");
          if (!blocked && !parent.isContentEditable && !SKIP_TAGS.has(parent.tagName)) {
            const originalRaw = rememberOriginalText(currentNode);
            const normalized = normalizeText(originalRaw);

            if (isTranslatableText(normalized)) {
              if (!map.has(normalized)) {
                map.set(normalized, []);
              }
              map.get(normalized).push({ node: currentNode, originalRaw });
            }
          }
        }
        currentNode = walker.nextNode();
      }

      return map;
    };

    const restoreOriginals = () => {
      trackedNodesRef.current.forEach((node) => {
        if (!node?.isConnected) {
          trackedNodesRef.current.delete(node);
          return;
        }
        const originalRaw = originalTextByNodeRef.current.get(node);
        if (typeof originalRaw === "string") {
          node.nodeValue = originalRaw;
        }
      });
    };

    const processTranslation = async () => {
      const runId = ++runIdRef.current;
      const textNodeMap = collectNodes();
      const applyForCurrentLanguage = () => {
        if (runId !== runIdRef.current) return;
        isApplyingRef.current = true;
        textNodeMap.forEach((items, normalizedText) => {
          const translatedCore = isAlreadyInTargetScript(resolvedLanguage, normalizedText)
            ? normalizedText
            : translatedCacheRef.current.get(`${resolvedLanguage}::${normalizedText}`) || normalizedText;

          items.forEach(({ node, originalRaw }) => {
            if (!node?.isConnected) return;
            node.nodeValue = preserveWhitespace(originalRaw, translatedCore);
          });
        });
        isApplyingRef.current = false;
      };

      if (resolvedLanguage === "en") {
        if (runId !== runIdRef.current) return;
        isApplyingRef.current = true;
        restoreOriginals();
        isApplyingRef.current = false;
        return;
      }

      // Immediately refresh text nodes using any cached values for this language.
      applyForCurrentLanguage();

      const texts = [...textNodeMap.keys()];
      const needFetch = texts.filter((text) => {
        if (isAlreadyInTargetScript(resolvedLanguage, text)) return false;
        return !translatedCacheRef.current.has(`${resolvedLanguage}::${text}`);
      });

      if (needFetch.length > 0) {
        const chunks = chunkArray(needFetch, MAX_CHUNK_SIZE);
        for (const chunk of chunks) {
          if (runId !== runIdRef.current) return;
          try {
            const response = await requestTranslations({
              texts: chunk,
              sourceLang: "auto",
              targetLang: resolvedLanguage
            });
            chunk.forEach((text) => {
              const translated = response.translations?.[text];
              // Keep retries possible when provider falls back to identity text.
              if (translated && translated !== text) {
                translatedCacheRef.current.set(`${resolvedLanguage}::${text}`, translated);
              }
            });
          } catch {
            // Ignore and keep original text; observer will retry later.
          }
          applyForCurrentLanguage();
        }
      }
    };

    const scheduleProcess = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        void processTranslation();
      }, 140);
    };

    scheduleProcess();

    const observer = new MutationObserver(() => {
      if (isApplyingRef.current) return;
      scheduleProcess();
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true
    });

    return () => {
      runIdRef.current += 1;
      observer.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [lang, resolvedLanguage]);

  return null;
}
