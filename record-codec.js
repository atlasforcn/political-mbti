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
  const maxRecords = 6;

  function fromBase64Url(text) {
    const padding = "=".repeat((4 - text.length % 4) % 4);
    const encoded = text.replace(/-/g, "+").replace(/_/g, "/") + padding;
    return typeof atob === "function" ? atob(encoded) : Buffer.from(encoded, "base64").toString("utf8");
  }

  function encodeName(name) {
    const bytes = unescape(encodeURIComponent(name));
    const encoded = typeof btoa === "function" ? btoa(bytes) : Buffer.from(bytes, "binary").toString("base64");
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeName(code) {
    return decodeURIComponent(escape(fromBase64Url(code)));
  }

  function validateName(name) {
    if (name === undefined || name === null || name === "") return "";
    if (typeof name !== "string") throw new Error("暱稱格式錯誤");
    const clean = name.trim().replace(/[\u0000-\u001f\u007f]/g, "");
    if (!clean || Array.from(clean).length > 20) throw new Error("暱稱需為 1 到 20 個字");
    return clean;
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
    const valid = { questionIds: record.questionIds.slice(), answers: record.answers.slice() };
    const name = validateName(record.name);
    if (name) valid.name = name;
    return valid;
  }

  function encode(records, bankVersion, questions) {
    if (!Array.isArray(records) || records.length < 1 || records.length > maxRecords) throw new Error("網址只能保存一至六份紀錄");
    const compact = records.map(function (record) {
      const valid = validateRecord(record, questions);
      const answers = valid.questionIds.map(function (id, index) { return id + answerCodes[valid.answers[index]]; }).join(".");
      return valid.name ? "@" + encodeName(valid.name) + "!" + answers : answers;
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
      if (recordCodes.length < 1 || recordCodes.length > maxRecords) return null;
      const records = recordCodes.map(function (recordCode) {
        let name = "";
        if (recordCode[0] === "@") {
          const nameEnd = recordCode.indexOf("!");
          if (nameEnd < 2) throw new Error("無效的暱稱代碼");
          name = validateName(decodeName(recordCode.slice(1, nameEnd)));
          recordCode = recordCode.slice(nameEnd + 1);
        }
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
        return validateRecord({ name, questionIds, answers }, questions);
      });
      return { bankVersion, records, format: "compact" };
    } catch (_) { return null; }
  }

  function decodeLegacy(hash, questions) {
    try {
      if (hash.indexOf(legacyPrefix) !== 0) return null;
      const payload = JSON.parse(fromBase64Url(hash.slice(legacyPrefix.length)));
      if (!payload || payload.v !== 1 || !Array.isArray(payload.r) || payload.r.length < 1 || payload.r.length > maxRecords) return null;
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

  function buildGroupComparison(records, questions) {
    if (!Array.isArray(records) || records.length < 2 || records.length > maxRecords) throw new Error("群組比較需要二至六份紀錄");
    const validRecords = records.map(function (record) { return validateRecord(record, questions); });
    const answerMaps = validRecords.map(function (record) {
      return new Map(record.questionIds.map(function (id, index) { return [id, record.answers[index]]; }));
    });
    const rows = questions.filter(function (question) {
      return answerMaps.some(function (answers) { return answers.has(question.id); });
    }).map(function (question) {
      const answers = answerMaps.map(function (map) { return map.has(question.id) ? map.get(question.id) : null; });
      const certain = answers.filter(function (answer) { return answer !== null && answer !== 3; });
      return {
        question,
        answers,
        answeredCount: answers.filter(function (answer) { return answer !== null; }).length,
        spread: certain.length > 1 ? Math.max.apply(null, certain) - Math.min.apply(null, certain) : 0
      };
    });
    return { records: validRecords, rows };
  }

  return { encode, decode, extractHash, validateRecord, buildComparison, buildGroupComparison, maxRecords };
});
