(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PoliticalRecord = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const prefix = "#r=";
  const legacyPrefix = "#record=";
  const answerCodes = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };
  const codeAnswers = { A: 1, B: 2, C: 3, D: 4, E: 5 };

  function fromBase64Url(text) {
    const padding = "=".repeat((4 - text.length % 4) % 4);
    const encoded = text.replace(/-/g, "+").replace(/_/g, "/") + padding;
    return typeof atob === "function" ? atob(encoded) : Buffer.from(encoded, "base64").toString("utf8");
  }

  function validateRecord(record, questions) {
    if (!record || !Array.isArray(record.questionIds) || !Array.isArray(record.answers)) throw new Error("紀錄格式不完整");
    if (record.questionIds.length !== 16 || record.answers.length !== 16) throw new Error("紀錄必須包含 16 題");
    if (new Set(record.questionIds).size !== record.questionIds.length) throw new Error("紀錄含有重複題號");
    const knownIds = new Set(questions.map(function (question) { return question.id; }));
    record.questionIds.forEach(function (id) { if (!knownIds.has(id)) throw new Error("紀錄含有未知題號"); });
    record.answers.forEach(function (answer) {
      if (!Number.isInteger(answer) || answer < 1 || answer > 5) throw new Error("紀錄答案必須是 1 到 5");
    });
    return { questionIds: record.questionIds.slice(), answers: record.answers.slice() };
  }

  function encode(records, bankVersion, questions) {
    if (!Array.isArray(records) || records.length < 1 || records.length > 2) throw new Error("網址只能保存一至兩份紀錄");
    const compact = records.map(function (record) {
      const valid = validateRecord(record, questions);
      return valid.questionIds.map(function (id, index) { return id + answerCodes[valid.answers[index]]; }).join(".");
    });
    const versionCode = String(bankVersion || "unknown").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return prefix + "v" + versionCode + ";" + compact.join("~");
  }

  function decodeCompact(hash, questions) {
    try {
      if (hash.indexOf(prefix) !== 0) return null;
      const body = hash.slice(prefix.length);
      const separator = body.indexOf(";");
      if (separator < 2 || body[0] !== "v") return null;
      const bankVersion = body.slice(1, separator).replace(/_/g, ".");
      const recordCodes = body.slice(separator + 1).split("~");
      if (recordCodes.length < 1 || recordCodes.length > 2) return null;
      const records = recordCodes.map(function (recordCode) {
        const tokens = recordCode.split(".");
        if (tokens.length !== 16) throw new Error("紀錄必須包含 16 題");
        const questionIds = [];
        const answers = [];
        tokens.forEach(function (token) {
          const match = token.match(/^([A-Z][0-9]+)([A-E])$/);
          if (!match) throw new Error("無效的題目答案代碼");
          questionIds.push(match[1]);
          answers.push(codeAnswers[match[2]]);
        });
        return validateRecord({ questionIds, answers }, questions);
      });
      return { bankVersion, records, format: "compact" };
    } catch (_) { return null; }
  }

  function decodeLegacy(hash, questions) {
    try {
      if (hash.indexOf(legacyPrefix) !== 0) return null;
      const payload = JSON.parse(fromBase64Url(hash.slice(legacyPrefix.length)));
      if (!payload || payload.v !== 1 || !Array.isArray(payload.r) || payload.r.length < 1 || payload.r.length > 2) return null;
      const records = payload.r.map(function (compact) {
        if (!compact || !Array.isArray(compact.q) || typeof compact.a !== "string") throw new Error("無效的精簡紀錄");
        return validateRecord({ questionIds: compact.q, answers: compact.a.split("").map(Number) }, questions);
      });
      return { bankVersion: payload.b || "unknown", records, format: "legacy" };
    } catch (_) { return null; }
  }

  function decode(hash, questions) {
    if (typeof hash !== "string" || hash.length > 12000) return null;
    return decodeCompact(hash, questions) || decodeLegacy(hash, questions);
  }

  function extractHash(input) {
    if (typeof input !== "string") return null;
    const value = input.trim();
    if (!value) return null;
    if (value[0] === "#") return value;
    const hashIndex = value.indexOf("#");
    return hashIndex >= 0 ? value.slice(hashIndex) : null;
  }

  function buildComparison(first, second, questions) {
    const firstRecord = validateRecord(first, questions);
    const secondRecord = validateRecord(second, questions);
    const firstAnswers = new Map(firstRecord.questionIds.map(function (id, index) { return [id, firstRecord.answers[index]]; }));
    const secondAnswers = new Map(secondRecord.questionIds.map(function (id, index) { return [id, secondRecord.answers[index]]; }));
    const rows = questions.filter(function (question) {
      return firstAnswers.has(question.id) || secondAnswers.has(question.id);
    }).map(function (question) {
      const hasFirst = firstAnswers.has(question.id);
      const hasSecond = secondAnswers.has(question.id);
      return {
        question,
        firstAnswer: hasFirst ? firstAnswers.get(question.id) : null,
        secondAnswer: hasSecond ? secondAnswers.get(question.id) : null,
        status: hasFirst && hasSecond ? "both" : hasFirst ? "onlyFirst" : "onlySecond",
        sameAnswer: hasFirst && hasSecond && firstAnswers.get(question.id) === secondAnswers.get(question.id)
      };
    });
    return {
      rows,
      sharedCount: rows.filter(function (row) { return row.status === "both"; }).length,
      onlyFirstCount: rows.filter(function (row) { return row.status === "onlyFirst"; }).length,
      onlySecondCount: rows.filter(function (row) { return row.status === "onlySecond"; }).length
    };
  }

  return { encode, decode, extractHash, validateRecord, buildComparison };
});
