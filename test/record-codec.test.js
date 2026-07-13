const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../questions.js");
const { selectBalancedQuestions } = require("../quiz-session.js");
const recordCodec = require("../record-codec.js");

function makeRecord(random, answer) {
  const questions = selectBalancedQuestions(bank.questions, bank.dimensions, random);
  return { questionIds: questions.map((question) => question.id), answers: questions.map(() => answer) };
}

test("單人紀錄可編碼進 hash 並完整還原", () => {
  const record = makeRecord(() => 0.2, 4);
  const hash = recordCodec.encode([record], bank.version, bank.questions);
  const decoded = recordCodec.decode(hash, bank.questions);
  assert.match(hash, /^#record=[A-Za-z0-9_-]+$/);
  assert.equal(decoded.bankVersion, bank.version);
  assert.deepEqual(decoded.records, [record]);
});

test("比較網址可保存兩份紀錄", () => {
  const first = makeRecord(() => 0.1, 1);
  const second = makeRecord(() => 0.8, 5);
  const decoded = recordCodec.decode(recordCodec.encode([first, second], bank.version, bank.questions), bank.questions);
  assert.deepEqual(decoded.records, [first, second]);
});

test("不同抽題組會逐題標出雙方未抽到的題目", () => {
  const first = makeRecord(() => 0.1, 2);
  const second = makeRecord(() => 0.8, 4);
  const comparison = recordCodec.buildComparison(first, second, bank.questions);
  assert.equal(comparison.rows.length, comparison.sharedCount + comparison.onlyFirstCount + comparison.onlySecondCount);
  assert.ok(comparison.onlyFirstCount > 0);
  assert.ok(comparison.onlySecondCount > 0);
  comparison.rows.filter((row) => row.status === "onlyFirst").forEach((row) => assert.equal(row.secondAnswer, null));
  comparison.rows.filter((row) => row.status === "onlySecond").forEach((row) => assert.equal(row.firstAnswer, null));
});

test("損壞、未知題號或不合法答案的網址會被拒絕", () => {
  const record = makeRecord(() => 0.3, 4);
  assert.equal(recordCodec.decode("#record=not-valid", bank.questions), null);
  assert.throws(() => recordCodec.encode([{ ...record, questionIds: record.questionIds.map((id, index) => index ? id : "missing") }], bank.version, bank.questions), /未知題號/);
  assert.throws(() => recordCodec.encode([{ ...record, answers: record.answers.map((answer, index) => index ? answer : 9) }], bank.version, bank.questions), /1 到 5/);
});
