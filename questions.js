(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.QUESTION_BANK = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const dimensions = {
    role: {
      label: "公共角色", left: "公共保障", right: "市場自治", leftCode: "S", rightCode: "L",
      facets: {
        social: { label: "社會保障", left: "共同承擔", right: "個人選擇" },
        economy: { label: "經濟治理", left: "公共介入", right: "市場放手" }
      }
    },
    distribution: { label: "分配原則", left: "結果平等", right: "程序公平", leftCode: "E", rightCode: "F" },
    change: { label: "改革步調", left: "積極改革", right: "穩健漸進", leftCode: "A", rightCode: "T" },
    agency: { label: "責任歸因", left: "個人能動", right: "結構脈絡", leftCode: "R", rightCode: "C" }
  };

  const questions = [
    { id: "R01", dimension: "role", facet: "social", topic: "社會安全", direction: 1, text: "即使需要增加公共支出，政府仍應保障每個人的基本醫療與長期照護。" },
    { id: "R02", dimension: "role", facet: "economy", topic: "產業政策", direction: -1, text: "只要沒有壟斷或欺詐，政府應盡量少介入企業的定價與經營。" },
    { id: "R03", dimension: "role", facet: "social", topic: "住宅", direction: 1, text: "當租屋市場無法提供可負擔住宅時，政府應直接興建或大量供給社會住宅。" },
    { id: "R04", dimension: "role", facet: "social", topic: "教育", direction: -1, text: "教育服務應讓家庭保有更多自費選擇，而非主要由政府統一提供。" },
    { id: "R05", dimension: "role", facet: "economy", topic: "勞動", direction: 1, text: "政府應設定基本工資與勞動條件，即使這會增加部分企業成本。" },
    { id: "R06", dimension: "role", facet: "social", topic: "退休", direction: -1, text: "退休生活主要應由個人儲蓄與民間保險負責，而不是擴大公共年金。" },
    { id: "R07", dimension: "role", facet: "economy", topic: "氣候", direction: 1, text: "為降低碳排，政府可以用稅制與管制要求企業承擔轉型成本。" },
    { id: "R08", dimension: "role", facet: "economy", topic: "數位治理", direction: -1, text: "新科技應先自由發展，除非已造成明確傷害，政府才需要管制。" },

    { id: "D01", dimension: "distribution", topic: "稅制", direction: 1, text: "高所得者應負擔明顯較高的稅率，以縮小可支配所得差距。" },
    { id: "D02", dimension: "distribution", topic: "福利", direction: -1, text: "公共福利應優先依照繳費或貢獻多寡提供，而不是讓所有人得到相近待遇。" },
    { id: "D03", dimension: "distribution", topic: "教育", direction: 1, text: "為縮小起點差距，弱勢學生應獲得比一般學生更多的公共教育資源。" },
    { id: "D04", dimension: "distribution", topic: "就業", direction: -1, text: "只要甄選規則一致，結果上的群體差距不應成為調整錄取方式的理由。" },
    { id: "D05", dimension: "distribution", topic: "財富", direction: 1, text: "財富高度集中本身就是公共問題，即使累積財富的過程合法。" },
    { id: "D06", dimension: "distribution", topic: "薪資", direction: -1, text: "只要競爭程序公開，能力與績效造成的大幅薪資差距是可以接受的。" },
    { id: "D07", dimension: "distribution", topic: "偏鄉", direction: 1, text: "偏鄉公共服務即使單位成本較高，也應盡量達到都市相近的水準。" },
    { id: "D08", dimension: "distribution", topic: "補助", direction: -1, text: "政府補助應精準給真正需要的人，而不是為追求一致而普遍發放。" },

    { id: "C01", dimension: "change", topic: "制度改革", direction: 1, text: "當制度長期製造不公平時，應儘快大幅改革，而不是等待各方完全形成共識。" },
    { id: "C02", dimension: "change", topic: "科技", direction: -1, text: "公共部門導入 AI 等新科技前，寧可慢一些，也要先建立完整規範。" },
    { id: "C03", dimension: "change", topic: "能源", direction: 1, text: "面對氣候風險，能源轉型應設定積極期限，即使短期成本明顯。" },
    { id: "C04", dimension: "change", topic: "治理", direction: -1, text: "成熟制度應以小幅修正為主，頻繁重做規則通常帶來更多問題。" },
    { id: "C05", dimension: "change", topic: "公民權利", direction: 1, text: "社會價值改變時，法律應主動擴張新興權利，而不必等多數人完全適應。" },
    { id: "C06", dimension: "change", topic: "社會政策", direction: -1, text: "新政策最好先小規模試辦、證明有效，再逐步推廣到全國。" },
    { id: "C07", dimension: "change", topic: "政府組織", direction: 1, text: "為解決跨部會問題，政府應勇於重新設計組織，而不只是改善既有流程。" },
    { id: "C08", dimension: "change", topic: "文化", direction: -1, text: "改變長久形成的社會慣例時，維持延續性通常比追求速度更重要。" },

    { id: "A01", dimension: "agency", topic: "健康", direction: 1, text: "即使環境條件不同，成年人仍應為可控制的健康習慣負主要責任。" },
    { id: "A02", dimension: "agency", topic: "貧窮", direction: -1, text: "一個人陷入長期貧窮，往往更受家庭背景與社會條件影響，而非個人選擇。" },
    { id: "A03", dimension: "agency", topic: "教育", direction: 1, text: "在基本資源已提供後，學習成果主要取決於個人的投入與選擇。" },
    { id: "A04", dimension: "agency", topic: "犯罪", direction: -1, text: "降低犯罪不能只靠處罰個人，更需要處理居住、教育與就業環境。" },
    { id: "A05", dimension: "agency", topic: "就業", direction: 1, text: "面對產業變動，工作者有責任主動更新技能，而不能主要期待政府保障原有職位。" },
    { id: "A06", dimension: "agency", topic: "財富", direction: -1, text: "個人的經濟成就很大程度取決於出生家庭、社會網絡與時代機會。" },
    { id: "A07", dimension: "agency", topic: "公民參與", direction: 1, text: "民主制度是否健全，最終仍取決於每位公民是否願意了解並參與公共事務。" },
    { id: "A08", dimension: "agency", topic: "心理健康", direction: -1, text: "心理健康問題應被理解為社會支持與生活環境的共同結果，而不只是個人的調適能力。" }
  ];

  return { version: "2.2.0", dimensions, questions };
});
