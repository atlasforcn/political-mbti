(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PoliticalRecord = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const prefix = "#record=";

  function toBase64Url(text) {
    const encoded = typeof btoa === "function" ? btoa(text) : Buffer.from(text, "utf8").toString("base64");
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

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
      return { q: valid.questionIds, a: valid.answers.join("") };
    });
    return prefix + toBase64Url(JSON.stringify({ v: 1, b: bankVersion, r: compact }));
  }

  function decode(hash, questions) {
    try {
      if (typeof hash !== "string" || hash.indexOf(prefix) !== 0 || hash.length > 12000) return null;
      const payload = JSON.parse(fromBase64Url(hash.slice(prefix.length)));
      if (!payload || payload.v !== 1 || !Array.isArray(payload.r) || payload.r.length < 1 || payload.r.length > 2) return null;
      const records = payload.r.map(function (compact) {
        if (!compact || !Array.isArray(compact.q) || typeof compact.a !== "string") throw new Error("無效的精簡紀錄");
        return validateRecord({ questionIds: compact.q, answers: compact.a.split("").map(Number) }, questions);
      });
      return { bankVersion: payload.b || "unknown", records };
    } catch (_) { return null; }
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

  return { encode, decode, validateRecord, buildComparison };
});
