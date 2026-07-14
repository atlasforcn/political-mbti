(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PoliticalDiscussion = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const archetypes = {
    roleLeft: ["安全網編織者", "你看見風險時，第一反應是：大家一起接住。"],
    roleRight: ["邊界守門員", "你會先問：這件事真的需要政府出手嗎？"],
    distributionLeft: ["起跑線校正師", "你不只看規則一不一樣，也在意大家從哪裡起跑。"],
    distributionRight: ["規則公證人", "你寧可把程序講清楚，也不想為結果臨時改尺。"],
    changeLeft: ["制度拆牆隊長", "看到結構卡住，你傾向先動手重做，再處理陣痛。"],
    changeRight: ["改革煞車測試員", "你不是拒絕改變，只是堅持先確認車輪不會飛出去。"],
    agencyLeft: ["選擇權責派", "你相信環境有限制，但人仍要為可控制的選擇負責。"],
    agencyRight: ["結構顯微鏡", "當別人只看個人，你會追問背後是哪套制度在推動。"]
  };

  function answerCopy(value) {
    return ({ 1: "非常不同意", 2: "比較不同意", 3: "還不確定", 4: "比較同意", 5: "非常同意" })[value];
  }

  function analyze(questions, answers, result, dimensions, issues) {
    const scored = questions.map(function (question, index) {
      const answer = answers[index];
      return {
        question,
        answer,
        directional: answer === 3 ? 0 : (answer - 3) * question.direction,
        intensity: answer === 3 ? 0 : Math.abs(answer - 3),
        issue: issues[question.dimension][question.issue].label
      };
    });
    const answered = scored.filter(function (item) { return item.answer !== 3; });
    const extremes = answered.filter(function (item) { return item.intensity === 2; });
    const heat = answered.length ? Math.round(extremes.length / answered.length * 100) : 0;
    const heatLabel = heat >= 70 ? "麥克風已開" : heat >= 40 ? "有話直說" : "先聽再說";

    const strongestKey = Object.keys(result.scores).sort(function (a, b) {
      return Math.abs(result.scores[b].leftPercentage - 50) - Math.abs(result.scores[a].leftPercentage - 50);
    })[0];
    const strongest = result.scores[strongestKey];
    const archetype = archetypes[strongestKey + (strongest.leftPercentage >= 50 ? "Left" : "Right")];

    const rebels = answered.filter(function (item) {
      const expectsLeft = result.scores[item.question.dimension].leftPercentage >= 50;
      return expectsLeft ? item.directional < 0 : item.directional > 0;
    }).sort(function (a, b) { return b.intensity - a.intensity; });

    const prompts = answered.slice().sort(function (a, b) {
      return b.intensity - a.intensity || a.question.id.localeCompare(b.question.id);
    }).map(function (item) {
      return {
        id: item.question.id,
        topic: item.issue + " · " + item.question.topic,
        question: item.question.text,
        answer: answerCopy(item.answer)
      };
    });

    return {
      archetype: archetype[0],
      archetypeCopy: archetype[1],
      strongestAxis: dimensions[strongestKey].label,
      heat,
      heatLabel,
      rebel: rebels[0] || null,
      prompts
    };
  }

  return { analyze, answerCopy };
});
