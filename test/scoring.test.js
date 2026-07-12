const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../questions.js");
const { scoreQuiz, validate } = require("../scoring.js");
const { selectBalancedQuestions, restoreQuestions } = require("../quiz-session.js");

test("題庫每軸各有八題且正反向平衡", () => {
  Object.keys(bank.dimensions).forEach((dimension) => {
    const items = bank.questions.filter((question) => question.dimension === dimension);
    assert.equal(items.length, 8);
    assert.equal(items.filter((item) => item.direction === 1).length, 4);
    assert.equal(items.filter((item) => item.direction === -1).length, 4);
  });
  assert.equal(new Set(bank.questions.map((question) => question.id)).size, bank.questions.length);
});

test("每次從 32 題平衡抽出 16 題", () => {
  const selected = selectBalancedQuestions(bank.questions, bank.dimensions, () => 0.42);
  assert.equal(selected.length, 16);
  assert.equal(new Set(selected.map((question) => question.id)).size, 16);
  Object.keys(bank.dimensions).forEach((dimension) => {
    const items = selected.filter((question) => question.dimension === dimension);
    assert.equal(items.length, 4);
    assert.equal(items.filter((item) => item.direction === 1).length, 2);
    assert.equal(items.filter((item) => item.direction === -1).length, 2);
  });
});

test("續測能以題號還原同一組題目與順序", () => {
  const selected = selectBalancedQuestions(bank.questions, bank.dimensions, () => 0.24);
  const restored = restoreQuestions(selected.map((question) => question.id), bank.questions);
  assert.deepEqual(restored.map((question) => question.id), selected.map((question) => question.id));
  assert.equal(restoreQuestions(["missing"], bank.questions), null);
});

test("中立答案落在四軸中線", () => {
  const result = scoreQuiz(bank.questions, bank.questions.map(() => 3), bank.dimensions);
  assert.equal(result.type, "SEAR");
  Object.values(result.scores).forEach((score) => {
    assert.equal(score.leftPercentage, 50);
    assert.equal(score.balance, true);
    assert.equal(score.answeredCount, 0);
    assert.equal(score.insufficient, true);
  });
});

test("依題目方向作答可到達兩端", () => {
  const left = bank.questions.map((question) => question.direction === 1 ? 5 : 1);
  const right = bank.questions.map((question) => question.direction === 1 ? 1 : 5);
  assert.equal(scoreQuiz(bank.questions, left, bank.dimensions).type, "SEAR");
  assert.equal(scoreQuiz(bank.questions, right, bank.dimensions).type, "LFTC");
  Object.values(scoreQuiz(bank.questions, left, bank.dimensions).scores).forEach((score) => assert.equal(score.leftPercentage, 100));
});

test("一致同意正反向平衡題目不會製造假傾向", () => {
  const result = scoreQuiz(bank.questions, bank.questions.map(() => 4), bank.dimensions);
  Object.values(result.scores).forEach((score) => assert.equal(score.leftPercentage, 50));
});

test("拒絕缺漏與超出量表的答案", () => {
  assert.throws(() => validate(bank.questions, [3]), /數量/);
  assert.throws(() => validate(bank.questions, bank.questions.map(() => 6)), /1 到 5/);
});

test("不確定答案不會稀釋其他有效答案", () => {
  const selected = selectBalancedQuestions(bank.questions, bank.dimensions, () => 0.31);
  const answers = selected.map((question, index) => index % 4 === 0 ? (question.direction === 1 ? 5 : 1) : 3);
  const result = scoreQuiz(selected, answers, bank.dimensions);
  Object.values(result.scores).forEach((score) => {
    assert.equal(score.leftPercentage, 100);
    assert.equal(score.answeredCount, 1);
    assert.equal(score.insufficient, true);
  });
});
