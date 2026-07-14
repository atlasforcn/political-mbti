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
    const itemCounts = {};
    Object.keys(dimensions).forEach(function (key) { buckets[key] = []; itemCounts[key] = 0; });

    const facetBuckets = {};
    Object.keys(dimensions).forEach(function (key) {
      if (!dimensions[key].facets) return;
      facetBuckets[key] = {};
      Object.keys(dimensions[key].facets).forEach(function (facet) { facetBuckets[key][facet] = []; });
    });

    questions.forEach(function (question, index) {
      if (!buckets[question.dimension]) throw new Error("未知的測量軸：" + question.dimension);
      itemCounts[question.dimension] += 1;
      const centered = answers[index] - 3;
      if (centered !== 0) {
        const directionalValue = centered * question.direction;
        buckets[question.dimension].push(directionalValue);
        if (question.facet && facetBuckets[question.dimension] && facetBuckets[question.dimension][question.facet]) {
          facetBuckets[question.dimension][question.facet].push(directionalValue);
        }
      }
    });

    const scores = {};
    let type = "";
    Object.keys(dimensions).forEach(function (key) {
      const values = buckets[key];
      if (!itemCounts[key]) throw new Error("測量軸沒有題目：" + key);
      const mean = values.length ? values.reduce(function (sum, value) { return sum + value; }, 0) / values.length : 0;
      const leftPercentage = Math.round(((mean + 2) / 4) * 100);
      const distance = Math.abs(leftPercentage - 50);
      const meta = dimensions[key];
      scores[key] = {
        leftPercentage,
        rightPercentage: 100 - leftPercentage,
        balance: distance <= 6,
        strength: distance >= 25 ? "明顯" : distance >= 13 ? "中度" : "輕微",
        insufficient: values.length < 2,
        answeredCount: values.length,
        itemCount: itemCounts[key]
      };
      type += leftPercentage >= 50 ? meta.leftCode : meta.rightCode;
    });
    const roleFacets = facetBuckets.role;
    let governmentProfile = null;
    if (roleFacets) {
      const facetScore = function (key) {
        const values = roleFacets[key];
        const mean = values.length ? values.reduce(function (sum, value) { return sum + value; }, 0) / values.length : 0;
        return { leftPercentage: Math.round(((mean + 2) / 4) * 100), answeredCount: values.length, sufficient: values.length >= 2 };
      };
      const social = facetScore("social");
      const economy = facetScore("economy");
      const sufficient = social.sufficient && economy.sufficient;
      const gap = Math.abs(social.leftPercentage - economy.leftPercentage);
      let kind = "mixed";
      if (!sufficient) kind = "insufficient";
      else if (social.leftPercentage >= 57 && economy.leftPercentage <= 43) kind = "social_public_economy_market";
      else if (social.leftPercentage <= 43 && economy.leftPercentage >= 57) kind = "social_private_economy_public";
      else if (social.leftPercentage >= 57 && economy.leftPercentage >= 57) kind = "broad_public";
      else if (social.leftPercentage <= 43 && economy.leftPercentage <= 43) kind = "limited_public";
      governmentProfile = { social, economy, gap, selective: kind.indexOf("social_") === 0, kind, sufficient };
    }
    return { type, scores, governmentProfile };
  }

  return { scoreQuiz, validate };
});
