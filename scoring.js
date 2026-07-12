(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PoliticalScoring = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function validate(questions, answers) {
    if (!Array.isArray(questions) || !questions.length) throw new Error("題庫不可為空");
    if (!Array.isArray(answers) || answers.length !== questions.length) throw new Error("答案數量與題目不符");
    answers.forEach(function (answer) {
      if (!Number.isInteger(answer) || answer < 1 || answer > 5) throw new Error("答案必須是 1 到 5 的整數");
    });
  }

  function scoreQuiz(questions, answers, dimensions) {
    validate(questions, answers);
    const buckets = {};
    Object.keys(dimensions).forEach(function (key) { buckets[key] = []; });

    questions.forEach(function (question, index) {
      if (!buckets[question.dimension]) throw new Error("未知的測量軸：" + question.dimension);
      const centered = answers[index] - 3;
      buckets[question.dimension].push(centered * question.direction);
    });

    const scores = {};
    let type = "";
    Object.keys(dimensions).forEach(function (key) {
      const values = buckets[key];
      if (!values.length) throw new Error("測量軸沒有題目：" + key);
      const mean = values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
      const leftPercentage = Math.round(((mean + 2) / 4) * 100);
      const meta = dimensions[key];
      scores[key] = {
        leftPercentage,
        rightPercentage: 100 - leftPercentage,
        balance: Math.abs(leftPercentage - 50) <= 6,
        itemCount: values.length
      };
      type += leftPercentage >= 50 ? meta.leftCode : meta.rightCode;
    });
    return { type, scores };
  }

  return { scoreQuiz, validate };
});
