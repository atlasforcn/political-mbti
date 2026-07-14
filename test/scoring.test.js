const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../questions.js");
const { scoreQuiz, validate } = require("../scoring.js");
const { selectBalancedQuestions, restoreQuestions } = require("../quiz-session.js");

test("題庫有十六個議題，每個議題各四題且正反向平衡", () => {
  assert.equal(bank.version, "4.0.0");
  assert.equal(bank.questions.length, 64);
  Object.keys(bank.dimensions).forEach((dimension) => {
    const items = bank.questions.filter((question) => question.dimension === dimension);
    assert.equal(items.length, 16);
    assert.equal(items.filter((item) => item.direction === 1).length, 8);
    assert.equal(items.filter((item) => item.direction === -1).length, 8);
    const issueKeys = Object.keys(bank.issues[dimension]);
    assert.equal(issueKeys.length, 4);
    issueKeys.forEach((issue) => {
      const issueMeta = bank.issues[dimension][issue];
      assert.ok(issueMeta.asOf);
      assert.ok(issueMeta.context.length >= 20);
      assert.ok(Array.isArray(issueMeta.sources) && issueMeta.sources.length >= 1);
      issueMeta.sources.forEach((source) => {
        assert.ok(source.label);
        assert.match(source.url, /^https:\/\//);
      });
      const issueItems = items.filter((item) => item.issue === issue);
      assert.equal(issueItems.length, 4);
      assert.equal(issueItems.filter((item) => item.direction === 1).length, 2);
      assert.equal(issueItems.filter((item) => item.direction === -1).length, 2);
      if (dimension === "role") {
        assert.ok(bank.issues.role[issue].facet);
        issueItems.forEach((item) => assert.equal(item.facet, bank.issues.role[issue].facet));
      }
    });
  });
  assert.equal(new Set(bank.questions.map((question) => question.id)).size, bank.questions.length);
  assert.equal(new Set(bank.questions.map((question) => question.text)).size, bank.questions.length);
  bank.questions.forEach((question) => {
    assert.ok(question.topic);
    assert.ok(question.text.endsWith("。"));
    assert.ok([...question.text].length >= 18 && [...question.text].length <= 65);
  });
});

test("每次從 64 題抽出 16 題並完整涵蓋所有議題", () => {
  const selected = selectBalancedQuestions(bank.questions, bank.dimensions, () => 0.42);
  assert.equal(selected.length, 16);
  assert.equal(new Set(selected.map((question) => question.id)).size, 16);
  Object.keys(bank.dimensions).forEach((dimension) => {
    const items = selected.filter((question) => question.dimension === dimension);
    assert.equal(items.length, 4);
    assert.deepEqual(new Set(items.map((item) => item.issue)), new Set(Object.keys(bank.issues[dimension])));
    assert.equal(items.filter((item) => item.direction === 1).length, 2);
    assert.equal(items.filter((item) => item.direction === -1).length, 2);
  });
  const roleItems = selected.filter((question) => question.dimension === "role");
  ["social", "economy"].forEach((facet) => {
    const items = roleItems.filter((question) => question.facet === facet);
    assert.equal(items.length, 2);
    assert.equal(items.filter((item) => item.direction === 1).length, 1);
    assert.equal(items.filter((item) => item.direction === -1).length, 1);
  });
});

test("題庫中的 64 題都能在重複抽題時被選中", () => {
  let seed = 20260713;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const seen = new Set();
  for (let index = 0; index < 500; index += 1) {
    selectBalancedQuestions(bank.questions, bank.dimensions, random).forEach((question) => seen.add(question.id));
  }
  assert.equal(seen.size, bank.questions.length);
});

test("政府邊界能保留跨議題的大小政府矛盾", () => {
  const selected = selectBalancedQuestions(bank.questions, bank.dimensions, () => 0.42);
  const answers = selected.map((question) => {
    if (question.dimension !== "role") return 3;
    const chooseLeft = question.facet === "social";
    return chooseLeft === (question.direction === 1) ? 5 : 1;
  });
  const result = scoreQuiz(selected, answers, bank.dimensions);
  assert.equal(result.scores.role.leftPercentage, 50);
  assert.equal(result.governmentProfile.social.leftPercentage, 100);
  assert.equal(result.governmentProfile.economy.leftPercentage, 0);
  assert.equal(result.governmentProfile.gap, 100);
  assert.equal(result.governmentProfile.kind, "social_public_economy_market");
  assert.equal(result.governmentProfile.selective, true);
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
  const answeredDimensions = new Set();
  const answers = selected.map((question) => {
    if (answeredDimensions.has(question.dimension)) return 3;
    answeredDimensions.add(question.dimension);
    return question.direction === 1 ? 5 : 1;
  });
  const result = scoreQuiz(selected, answers, bank.dimensions);
  Object.values(result.scores).forEach((score) => {
    assert.equal(score.leftPercentage, 100);
    assert.equal(score.answeredCount, 1);
    assert.equal(score.insufficient, true);
  });
});
