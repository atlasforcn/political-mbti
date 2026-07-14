const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../questions.js");
const { selectBalancedQuestions } = require("../quiz-session.js");
const recordCodec = require("../record-codec.js");

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function makeRecord(seed, answer) {
  const random = seededRandom(seed);
  const questions = selectBalancedQuestions(bank.questions, bank.dimensions, random);
  return { questionIds: questions.map((question) => question.id), answers: questions.map(() => answer) };
}

function makeLegacyHash(record, bankVersion) {
  const payload = JSON.stringify({ v: 1, b: bankVersion, r: [{ q: record.questionIds, a: record.answers.join("") }] });
  return "#record=" + Buffer.from(payload, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

test("單人紀錄可編碼進 hash 並完整還原", () => {
  const record = makeRecord(20, 4);
  const hash = recordCodec.encode([record], bank.version, bank.questions);
  const decoded = recordCodec.decode(hash, bank.questions);
  assert.match(hash, /^#r=v3_0_0;[A-Z0-9.~]+$/);
  assert.ok(!/[{}%\u4e00-\u9fff]/u.test(hash));
  assert.ok(hash.length < 180);
  assert.equal(decoded.bankVersion, bank.version);
  assert.equal(decoded.format, "compact");
  assert.deepEqual(decoded.records, [record]);
});

test("比較網址可保存兩份紀錄", () => {
  const first = makeRecord(10, 1);
  const second = makeRecord(80, 5);
  const hash = recordCodec.encode([first, second], bank.version, bank.questions);
  const decoded = recordCodec.decode(hash, bank.questions);
  assert.ok(hash.includes("~"));
  assert.deepEqual(decoded.records, [first, second]);
});

test("多人具名紀錄可在同一網址接力並完整還原", () => {
  const records = ["小明", "Alice", "旅行不吵架"].map((name, index) => ({ ...makeRecord(index + 1, index + 1), name }));
  const hash = recordCodec.encode(records, bank.version, bank.questions);
  const decoded = recordCodec.decode(hash, bank.questions);
  assert.deepEqual(decoded.records, records);
  assert.ok(hash.length < 600);
  const group = recordCodec.buildGroupComparison(records, bank.questions);
  assert.equal(group.records.length, 3);
  assert.ok(group.rows.length >= 16);
});

test("分享桌限制六人與二十字暱稱", () => {
  assert.throws(() => recordCodec.encode(Array.from({ length: 7 }, (_, index) => makeRecord(index, 4)), bank.version, bank.questions), /一至六份/);
  assert.throws(() => recordCodec.encode([{ ...makeRecord(1, 4), name: "這是一個超過二十個字所以應該要被拒絕掉的暱稱" }], bank.version, bank.questions), /1 到 20 個字/);
});

test("不同抽題組會逐題標出雙方未抽到的題目", () => {
  const first = makeRecord(10, 2);
  const second = makeRecord(80, 4);
  const comparison = recordCodec.buildComparison(first, second, bank.questions);
  assert.equal(comparison.rows.length, comparison.sharedCount + comparison.onlyFirstCount + comparison.onlySecondCount);
  assert.ok(comparison.onlyFirstCount > 0);
  assert.ok(comparison.onlySecondCount > 0);
  comparison.rows.filter((row) => row.status === "onlyFirst").forEach((row) => assert.equal(row.secondAnswer, null));
  comparison.rows.filter((row) => row.status === "onlySecond").forEach((row) => assert.equal(row.firstAnswer, null));
});

test("損壞、未知題號或不合法答案的網址會被拒絕", () => {
  const record = makeRecord(30, 4);
  assert.equal(recordCodec.decode("#r=v3_0_0;not-valid", bank.questions), null);
  assert.throws(() => recordCodec.encode([{ ...record, questionIds: record.questionIds.map((id, index) => index ? id : "missing") }], bank.version, bank.questions), /未知題號/);
  assert.throws(() => recordCodec.encode([{ ...record, answers: record.answers.map((answer, index) => index ? answer : 9) }], bank.version, bank.questions), /1 到 5/);
});

test("舊版 Base64URL 分享網址仍可還原並標記為 legacy", () => {
  const oldRecord = {
    questionIds: ["R01", "R02", "R03", "R04", "D01", "D02", "D03", "D04", "C01", "C02", "C03", "C04", "A01", "A02", "A03", "A04"],
    answers: [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1]
  };
  const decoded = recordCodec.decode(makeLegacyHash(oldRecord, "2.2.0"), bank.questions);
  assert.equal(decoded.bankVersion, "2.2.0");
  assert.equal(decoded.format, "legacy");
  assert.deepEqual(decoded.records[0], oldRecord);
});

test("可從完整網址或單獨 hash 擷取紀錄碼", () => {
  const hash = recordCodec.encode([makeRecord(42, 5)], bank.version, bank.questions);
  assert.equal(recordCodec.extractHash("https://example.com/quiz" + hash), hash);
  assert.equal(recordCodec.extractHash("  " + hash + "  "), hash);
  assert.equal(recordCodec.extractHash("https://example.com/quiz"), null);
  assert.equal(recordCodec.extractHash(""), null);
});
