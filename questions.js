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

  const issues = {
    role: {
      social_protection: { label: "社會保護", facet: "social" },
      public_services: { label: "公共服務", facet: "social" },
      market_rules: { label: "市場規範", facet: "economy" },
      transition_governance: { label: "轉型治理", facet: "economy" }
    },
    distribution: {
      tax_wealth: { label: "稅負與財富" },
      opportunity: { label: "機會與補償" },
      welfare_targeting: { label: "福利與資源" },
      reward_contribution: { label: "貢獻與報酬" }
    },
    change: {
      institutional_reform: { label: "制度重設" },
      implementation: { label: "政策實施" },
      risk_transition: { label: "風險轉型" },
      rights_culture: { label: "權利與文化" }
    },
    agency: {
      health_wellbeing: { label: "健康與福祉" },
      education_mobility: { label: "教育與流動" },
      civic_order: { label: "公民與秩序" },
      work_wealth: { label: "工作與財富" }
    }
  };

  const questions = [
    { id: "R01", dimension: "role", issue: "social_protection", facet: "social", topic: "醫療長照", direction: 1, text: "即使需要增加公共支出，政府仍應保障每個人的基本醫療與長期照護。" },
    { id: "R06", dimension: "role", issue: "social_protection", facet: "social", topic: "退休", direction: -1, text: "退休生活主要應由個人儲蓄與民間保險負責，而不是擴大公共年金。" },
    { id: "R09", dimension: "role", issue: "social_protection", facet: "social", topic: "失業保障", direction: 1, text: "非自願失業期間，政府應提供足以維持基本生活的所得保障。" },
    { id: "R10", dimension: "role", issue: "social_protection", facet: "social", topic: "所得風險", direction: -1, text: "工作年齡者的短期所得中斷，應優先由個人與家庭承擔，而非由政府普遍保障。" },

    { id: "R03", dimension: "role", issue: "public_services", facet: "social", topic: "住宅", direction: 1, text: "當租屋市場無法提供可負擔住宅時，政府應直接興建或大量供給社會住宅。" },
    { id: "R04", dimension: "role", issue: "public_services", facet: "social", topic: "教育", direction: -1, text: "教育服務應讓家庭保有更多自費選擇，而非主要由政府統一提供。" },
    { id: "R11", dimension: "role", issue: "public_services", facet: "social", topic: "托育", direction: 1, text: "政府應擴大公共托育供給，即使因此需要提高相關稅收。" },
    { id: "R12", dimension: "role", issue: "public_services", facet: "social", topic: "交通", direction: -1, text: "使用人數不足的公共運輸路線，不應只為維持服務而長期由政府補貼。" },

    { id: "R05", dimension: "role", issue: "market_rules", facet: "economy", topic: "勞動", direction: 1, text: "政府應設定基本工資與勞動條件，即使這會增加部分企業成本。" },
    { id: "R02", dimension: "role", issue: "market_rules", facet: "economy", topic: "企業經營", direction: -1, text: "只要沒有壟斷或欺詐，政府應盡量少介入企業的定價與經營。" },
    { id: "R13", dimension: "role", issue: "market_rules", facet: "economy", topic: "平台經濟", direction: 1, text: "政府應要求數位平台為受其規則控制的工作者提供基本勞動保障。" },
    { id: "R14", dimension: "role", issue: "market_rules", facet: "economy", topic: "契約自由", direction: -1, text: "成年人自願簽訂的工作契約，政府不應因條件不理想就加以限制。" },

    { id: "R07", dimension: "role", issue: "transition_governance", facet: "economy", topic: "氣候", direction: 1, text: "為降低碳排，政府可以用稅制與管制要求企業承擔轉型成本。" },
    { id: "R08", dimension: "role", issue: "transition_governance", facet: "economy", topic: "新科技", direction: -1, text: "新科技應先自由發展，除非已造成明確傷害，政府才需要管制。" },
    { id: "R15", dimension: "role", issue: "transition_governance", facet: "economy", topic: "基礎建設", direction: 1, text: "面對重大產業轉型，政府應直接投資關鍵基礎建設，而不只等待民間市場。" },
    { id: "R16", dimension: "role", issue: "transition_governance", facet: "economy", topic: "產業選擇", direction: -1, text: "政府不應用補貼押注特定新興產業，因為市場更適合判斷哪些技術可行。" },

    { id: "D01", dimension: "distribution", issue: "tax_wealth", topic: "所得稅", direction: 1, text: "高所得者應負擔明顯較高的稅率，以縮小可支配所得差距。" },
    { id: "D05", dimension: "distribution", issue: "tax_wealth", topic: "財富集中", direction: 1, text: "財富高度集中本身就是公共問題，即使累積財富的過程合法。" },
    { id: "D09", dimension: "distribution", issue: "tax_wealth", topic: "繼承", direction: -1, text: "合法累積並留給家人的財產，不應只為縮小差距而被課徵較高的遺產稅。" },
    { id: "D10", dimension: "distribution", issue: "tax_wealth", topic: "稅制目的", direction: -1, text: "稅制的主要目的應是支應公共服務，而不是改變人民之間的財富差距。" },

    { id: "D03", dimension: "distribution", issue: "opportunity", topic: "教育資源", direction: 1, text: "為縮小起點差距，弱勢學生應獲得比一般學生更多的公共教育資源。" },
    { id: "D04", dimension: "distribution", issue: "opportunity", topic: "就業甄選", direction: -1, text: "只要甄選規則一致，結果上的群體差距不應成為調整錄取方式的理由。" },
    { id: "D11", dimension: "distribution", issue: "opportunity", topic: "升學", direction: 1, text: "升學評量應考量申請者可取得的家庭資源，而不只比較最後成績。" },
    { id: "D12", dimension: "distribution", issue: "opportunity", topic: "獎學金", direction: -1, text: "獎學金應優先依表現頒發，而不是為平衡家庭背景而調整標準。" },

    { id: "D07", dimension: "distribution", issue: "welfare_targeting", topic: "偏鄉服務", direction: 1, text: "偏鄉公共服務即使單位成本較高，也應盡量達到都市相近的水準。" },
    { id: "D08", dimension: "distribution", issue: "welfare_targeting", topic: "精準補助", direction: -1, text: "政府補助應精準給真正需要的人，而不是為追求一致而普遍發放。" },
    { id: "D13", dimension: "distribution", issue: "welfare_targeting", topic: "普遍給付", direction: 1, text: "基本福利採普遍提供，比嚴格審查資格更能確保需要的人不被漏掉。" },
    { id: "D14", dimension: "distribution", issue: "welfare_targeting", topic: "排富", direction: -1, text: "成本高昂的公共給付應設定所得門檻，不必讓高所得者同樣取得。" },

    { id: "D15", dimension: "distribution", issue: "reward_contribution", topic: "必要工作", direction: 1, text: "維持社會運作所必需的工作，薪資不應只由市場上的議價能力決定。" },
    { id: "D16", dimension: "distribution", issue: "reward_contribution", topic: "組織分配", direction: 1, text: "大型組織分配獎酬時，應限制高階主管與基層員工之間的差距。" },
    { id: "D02", dimension: "distribution", issue: "reward_contribution", topic: "福利貢獻", direction: -1, text: "公共福利應優先依照繳費或貢獻多寡提供，而不是讓所有人得到相近待遇。" },
    { id: "D06", dimension: "distribution", issue: "reward_contribution", topic: "績效薪資", direction: -1, text: "只要競爭程序公開，能力與績效造成的大幅薪資差距是可以接受的。" },

    { id: "C01", dimension: "change", issue: "institutional_reform", topic: "制度改革", direction: 1, text: "當制度長期製造不公平時，應儘快大幅改革，而不是等待各方完全形成共識。" },
    { id: "C07", dimension: "change", issue: "institutional_reform", topic: "政府組織", direction: 1, text: "為解決跨部會問題，政府應勇於重新設計組織，而不只是改善既有流程。" },
    { id: "C04", dimension: "change", issue: "institutional_reform", topic: "制度延續", direction: -1, text: "成熟制度應以小幅修正為主，頻繁重做規則通常帶來更多問題。" },
    { id: "C09", dimension: "change", issue: "institutional_reform", topic: "重大修法", direction: -1, text: "涉及基本制度的重大修法，應等到主要社會群體形成廣泛共識再推動。" },

    { id: "C10", dimension: "change", issue: "implementation", topic: "政策擴張", direction: 1, text: "當問題已造成廣泛損害時，新政策應先全面實施，再依結果調整細節。" },
    { id: "C11", dimension: "change", issue: "implementation", topic: "行政整合", direction: 1, text: "多個機關反覆協調仍無法解決問題時，應直接重整權責而非繼續磨合。" },
    { id: "C06", dimension: "change", issue: "implementation", topic: "政策試辦", direction: -1, text: "新政策最好先小規模試辦、證明有效，再逐步推廣到全國。" },
    { id: "C12", dimension: "change", issue: "implementation", topic: "定期檢討", direction: -1, text: "影響範圍大的新制度應設定試行期限，經過正式檢討後才轉為常態。" },

    { id: "C03", dimension: "change", issue: "risk_transition", topic: "能源", direction: 1, text: "面對氣候風險，能源轉型應設定積極期限，即使短期成本明顯。" },
    { id: "C13", dimension: "change", issue: "risk_transition", topic: "新興風險", direction: 1, text: "新興風險快速擴大時，政府應先建立新規則，不必等所有證據都完整。" },
    { id: "C02", dimension: "change", issue: "risk_transition", topic: "人工智慧", direction: -1, text: "公共部門導入 AI 等新科技前，寧可慢一些，也要先建立完整規範。" },
    { id: "C14", dimension: "change", issue: "risk_transition", topic: "轉型成本", direction: -1, text: "高風險產業的轉型時程應保留彈性，避免一次改變造成難以回復的損失。" },

    { id: "C05", dimension: "change", issue: "rights_culture", topic: "公民權利", direction: 1, text: "社會價值改變時，法律應主動擴張新興權利，而不必等多數人完全適應。" },
    { id: "C15", dimension: "change", issue: "rights_culture", topic: "少數承認", direction: 1, text: "既有法律忽略少數群體的生活經驗時，應儘快增訂新的保障方式。" },
    { id: "C08", dimension: "change", issue: "rights_culture", topic: "社會慣例", direction: -1, text: "改變長久形成的社會慣例時，維持延續性通常比追求速度更重要。" },
    { id: "C16", dimension: "change", issue: "rights_culture", topic: "文化規範", direction: -1, text: "法律不宜走在社會文化太前面，重大價值改變應讓不同世代有時間適應。" },

    { id: "A01", dimension: "agency", issue: "health_wellbeing", topic: "健康習慣", direction: 1, text: "即使環境條件不同，成年人仍應為可控制的健康習慣負主要責任。" },
    { id: "A09", dimension: "agency", issue: "health_wellbeing", topic: "預防保健", direction: 1, text: "在資訊與服務都可取得時，是否持續進行預防保健主要是個人的責任。" },
    { id: "A08", dimension: "agency", issue: "health_wellbeing", topic: "心理健康", direction: -1, text: "心理健康問題應被理解為社會支持與生活環境的共同結果，而不只是個人的調適能力。" },
    { id: "A10", dimension: "agency", issue: "health_wellbeing", topic: "慢性病", direction: -1, text: "慢性病風險往往受到工時、居住與食物環境影響，不能主要歸因於自律。" },

    { id: "A03", dimension: "agency", issue: "education_mobility", topic: "學習成果", direction: 1, text: "在基本資源已提供後，學習成果主要取決於個人的投入與選擇。" },
    { id: "A11", dimension: "agency", issue: "education_mobility", topic: "職涯選擇", direction: 1, text: "在受教育機會相近時，職涯發展的差異主要來自個人做出的選擇。" },
    { id: "A02", dimension: "agency", issue: "education_mobility", topic: "長期貧窮", direction: -1, text: "一個人陷入長期貧窮，往往更受家庭背景與社會條件影響，而非個人選擇。" },
    { id: "A12", dimension: "agency", issue: "education_mobility", topic: "社會流動", direction: -1, text: "一個人能否向上流動，很大程度取決於其成長地區與可接觸的人際網絡。" },

    { id: "A07", dimension: "agency", issue: "civic_order", topic: "公民參與", direction: 1, text: "民主制度是否健全，最終仍取決於每位公民是否願意了解並參與公共事務。" },
    { id: "A13", dimension: "agency", issue: "civic_order", topic: "違法責任", direction: 1, text: "即使受到生活壓力，成年人仍應為自己明知違法的行為負主要責任。" },
    { id: "A04", dimension: "agency", issue: "civic_order", topic: "犯罪環境", direction: -1, text: "降低犯罪不能只靠處罰個人，更需要處理居住、教育與就業環境。" },
    { id: "A14", dimension: "agency", issue: "civic_order", topic: "制度信任", direction: -1, text: "人們不信任公共制度，往往與長期受到的制度對待有關，而不只是缺乏公民素養。" },

    { id: "A05", dimension: "agency", issue: "work_wealth", topic: "技能更新", direction: 1, text: "面對產業變動，工作者有責任主動更新技能，而不能主要期待政府保障原有職位。" },
    { id: "A15", dimension: "agency", issue: "work_wealth", topic: "創業結果", direction: 1, text: "在基本市場規則公平時，創業成敗主要應歸因於經營者的判斷與承擔。" },
    { id: "A06", dimension: "agency", issue: "work_wealth", topic: "經濟成就", direction: -1, text: "個人的經濟成就很大程度取決於出生家庭、社會網絡與時代機會。" },
    { id: "A16", dimension: "agency", issue: "work_wealth", topic: "就業波動", direction: -1, text: "大規模失業通常更應歸因於產業與總體經濟變化，而不是個別工作者的準備不足。" }
  ];

  return { version: "3.0.0", dimensions, issues, questions };
});
