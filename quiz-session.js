(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.QuizSession = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function shuffle(items, random) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      const temporary = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = temporary;
    }
    return result;
  }

  function selectBalancedQuestions(questions, dimensions, random) {
    const rng = random || Math.random;
    const selection = [];
    Object.keys(dimensions).forEach(function (dimension) {
      [1, -1].forEach(function (direction) {
        const candidates = questions.filter(function (question) {
          return question.dimension === dimension && question.direction === direction;
        });
        if (candidates.length < 2) throw new Error("每個測量軸與方向至少需要兩題：" + dimension);
        selection.push.apply(selection, shuffle(candidates, rng).slice(0, 2));
      });
    });
    return shuffle(selection, rng);
  }

  function restoreQuestions(questionIds, questionBank) {
    if (!Array.isArray(questionIds) || questionIds.length !== 16) return null;
    const byId = new Map(questionBank.map(function (question) { return [question.id, question]; }));
    const restored = questionIds.map(function (id) { return byId.get(id); });
    if (restored.some(function (question) { return !question; })) return null;
    if (new Set(questionIds).size !== questionIds.length) return null;
    return restored;
  }

  return { selectBalancedQuestions, restoreQuestions };
});
