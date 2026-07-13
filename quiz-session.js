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
      const facets = dimensions[dimension].facets;
      const dimensionItems = questions.filter(function (question) { return question.dimension === dimension; });
      const issueKeys = Array.from(new Set(dimensionItems.map(function (question) { return question.issue; })));
      if (issueKeys.length !== 4 || issueKeys.some(function (issue) { return !issue; })) {
        throw new Error("每個測量軸必須定義四個議題：" + dimension);
      }

      function pick(issue, direction) {
        const candidates = dimensionItems.filter(function (question) {
          return question.issue === issue && question.direction === direction;
        });
        if (candidates.length < 2) throw new Error("每個議題與方向至少需要兩題：" + dimension + "/" + issue);
        selection.push(shuffle(candidates, rng)[0]);
      }

      if (facets) {
        Object.keys(facets).forEach(function (facet) {
          const facetIssues = issueKeys.filter(function (issue) {
            return dimensionItems.some(function (question) { return question.issue === issue && question.facet === facet; });
          });
          if (facetIssues.length !== 2) throw new Error("每個議題剖面必須包含兩個議題：" + dimension + "/" + facet);
          const orderedIssues = shuffle(facetIssues, rng);
          const directions = shuffle([1, -1], rng);
          orderedIssues.forEach(function (issue, index) { pick(issue, directions[index]); });
        });
        return;
      }
      const orderedIssues = shuffle(issueKeys, rng);
      const directions = shuffle([1, 1, -1, -1], rng);
      orderedIssues.forEach(function (issue, index) { pick(issue, directions[index]); });
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
