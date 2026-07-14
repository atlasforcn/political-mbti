(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.PERSONALITY_TYPES = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const role = { S: "公共", L: "自主" };
  const distribution = { E: "平權", F: "程序" };
  const change = { A: "改革", T: "穩健" };
  const agency = { R: "能動", C: "脈絡" };
  const suffix = { R: "實踐者", C: "協作者" };
  const thoughtIndex = {
    SEAR: { thinker: "阿馬蒂亞・沈恩", field: "經濟學家／哲學家", work: "《以自由看待發展》", question: "真正的平等，是資源一樣，還是每個人都有把資源化為生活選擇的能力？", connection: "你的公共保障、結果平等與個人能動取向，和「能力方法」同樣在意：制度應擴張人的真實自由，而人也不是被動的福利接受者。", url: "https://plato.stanford.edu/entries/capability-approach/" },
    SEAC: { thinker: "卡爾・馬克思", field: "哲學家／政治經濟學家", work: "《資本論》第一卷", question: "看似自由的交換，是否仍被生產關係與階級位置預先塑造？", connection: "你的公共保障、結果平等、積極改革與結構歸因，適合從馬克思對資本、勞動與階級關係的分析繼續追問。", url: "https://plato.stanford.edu/entries/marx/" },
    SETR: { thinker: "T. H. 馬歇爾", field: "社會學家", work: "《公民身分與社會階級》", question: "公民權若只有法律上的自由，卻缺少教育、醫療與基本生活，還算完整嗎？", connection: "你重視公共保障與平等，也偏好制度化、漸進累積的改變；馬歇爾的社會公民權正好把這幾條線接在一起。", url: "https://www.britannica.com/biography/T-H-Marshall" },
    SETC: { thinker: "約翰・羅爾斯", field: "政治哲學家", work: "《正義論》", question: "如果不知道自己會出生在哪個階級，我們會同意怎樣的社會規則？", connection: "你的公共保障、結果平等、穩健制度與結構視角，鄰近羅爾斯以公平合作和最不利者處境檢驗基本制度的方式。", url: "https://plato.stanford.edu/entries/rawls/" },
    SFAR: { thinker: "約翰・杜威", field: "哲學家／教育家", work: "《公眾及其問題》", question: "民主是一套投票程序，還是一種共同發現問題、反覆實驗的生活方式？", connection: "你相信公共行動、公平程序與積極改良，也保留公民能動性；杜威的實驗民主會是一位很合拍的對話者。", url: "https://plato.stanford.edu/entries/dewey-political/" },
    SFAC: { thinker: "于爾根・哈伯馬斯", field: "哲學家／社會理論家", work: "《在事實與規範之間》", question: "一條法律要如何經過公共討論，才不只是有權者的命令？", connection: "你同時看重公共制度、程序正當性、改革與結構條件；哈伯馬斯會把焦點放在能否形成不被權力扭曲的公共溝通。", url: "https://plato.stanford.edu/entries/habermas/" },
    SFTR: { thinker: "馬克斯・韋伯", field: "社會學家", work: "《政治作為一種志業》", question: "政治行動者應只忠於信念，還是也要為可預見的後果負責？", connection: "你的公共角色、程序公平、穩健步調與個人責任感，適合從韋伯的責任倫理與現代官僚制開始延伸。", url: "https://plato.stanford.edu/entries/weber/" },
    SFTC: { thinker: "艾彌爾・涂爾幹", field: "社會學家", work: "《社會分工論》", question: "高度分工的社會，靠什麼維持成員之間的連帶與共同規範？", connection: "你信任公共制度與穩定規則，也習慣從社會結構理解個人；涂爾幹會引導你觀察制度如何製造整合，也可能造成失範。", url: "https://plato.stanford.edu/entries/durkheim/" },
    LEAR: { thinker: "埃莉諾・奧斯特羅姆", field: "政治學家／經濟學家", work: "《公共事務的治理之道》", question: "除了政府命令與市場私有化，人們能否自己訂規則、共同管理資源？", connection: "你的自治、平等、改革與能動取向，和奧斯特羅姆對社群自我治理的研究相遇：公共問題不一定只有國家或市場兩個答案。", url: "https://www.nobelprize.org/prizes/economic-sciences/2009/ostrom/facts/" },
    LEAC: { thinker: "艾瑞克・歐林・萊特", field: "社會學家", work: "《真實烏托邦》", question: "我們能否在既有制度裡，逐步長出更平等、民主又分權的替代方案？", connection: "你的市場自治與結果平等看似拉扯；萊特研究的合作社、社會經濟與真實烏托邦，正是在這種矛盾中尋找制度出口。", url: "https://www.ssc.wisc.edu/~wright/ERU.htm" },
    LETR: { thinker: "亨利・喬治", field: "政治經濟學家", work: "《進步與貧困》", question: "如何保留市場活力，卻不讓土地增值成為少數人的不勞所得？", connection: "你偏好自治與能動性，卻也在意結果差距；亨利・喬治以土地價值稅調和市場和分配，是很直接的政策型思想鄰居。", url: "https://www.britannica.com/biography/Henry-George" },
    LETC: { thinker: "卡爾・波蘭尼", field: "經濟史家／社會理論家", work: "《鉅變》", question: "當市場邏輯擴張到土地、勞動與貨幣，社會會如何自我保護？", connection: "這是一位帶著異議的思想鄰居：你珍惜自治與漸進秩序，波蘭尼則提醒市場本身也依賴制度，並可能觸發結構性的反作用。", url: "https://www.britannica.com/biography/Karl-Polanyi" },
    LFAR: { thinker: "米爾頓・傅利曼", field: "經濟學家", work: "《資本主義與自由》", question: "競爭市場是否比政治權力更能分散決策，並保護個人選擇？", connection: "你的市場自治、程序公平、積極改變與個人責任取向，能與傅利曼主張的經濟自由及政策改革直接交鋒。", url: "https://www.nobelprize.org/prizes/economic-sciences/1976/friedman/facts/" },
    LFAC: { thinker: "米歇爾・傅柯", field: "哲學家／思想史家", work: "《生命政治的誕生》", question: "當政府以競爭、風險與自我負責來治理，人真的變得更自由了嗎？", connection: "這也是一位帶著異議的鄰居：你的自治與改革取向，會被傅柯追問成一種治理技術，並從制度話語看見個人選擇背後的權力。", url: "https://plato.stanford.edu/entries/foucault/" },
    LFTR: { thinker: "羅伯特・諾齊克", field: "政治哲學家", work: "《無政府、國家與烏托邦》", question: "只要取得與移轉的過程正當，國家有權為了理想分配而重新拿走財產嗎？", connection: "你的市場自治、程序公平、穩健邊界與個人責任，和諾齊克的權利論及最小國家形成清楚的理論對話。", url: "https://plato.stanford.edu/entries/nozick-political/" },
    LFTC: { thinker: "弗里德里希・海耶克", field: "經濟學家／政治哲學家", work: "《自由憲章》", question: "沒有人掌握全貌時，分散知識如何透過規則與自發秩序協調？", connection: "你的市場自治、程序公平、漸進秩序與結構視角，鄰近海耶克對分散知識、一般規則與自發秩序的關注。", url: "https://plato.stanford.edu/entries/friedrich-hayek/" }
  };
  const types = {};

  Object.keys(role).forEach(function (r) {
    Object.keys(distribution).forEach(function (d) {
      Object.keys(change).forEach(function (c) {
        Object.keys(agency).forEach(function (a) {
          const code = r + d + c + a;
          const name = role[r] + distribution[d] + change[c] + suffix[a];
          types[code] = {
            name,
            summary: "你較重視" + role[r] + "取向的公共角色、" + distribution[d] + "導向的分配原則，並偏好" + change[c] + "的改變步調；判斷社會成果時，你更著重" + agency[a] + "因素。",
            thought: thoughtIndex[code]
          };
        });
      });
    });
  });
  return types;
});
