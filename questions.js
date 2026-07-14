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
      social_protection: {
        label: "社會保護", facet: "social", asOf: "臺灣現況 · 2026",
        context: "全民健保一般保險費率為 5.17%，並以安全準備與收支連動維持財務；勞退新制要求雇主至少提繳月薪 6%；一般失業給付通常為平均月投保薪資 60%，最長 6 個月。",
        sources: [
          { label: "健保署：保費計算", url: "https://www.nhi.gov.tw/ch/cp-3277-6c895-2588-1.html" },
          { label: "健保署：財務平衡機制", url: "https://www.nhi.gov.tw/ch/cp-2866-65928-3150-1.html" },
          { label: "勞動部：勞退個人專戶", url: "https://www.mol.gov.tw/1607/28162/28540/28560/28562/30453/post" },
          { label: "就業保險法第 16 條", url: "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?flno=16&id=FL023221" }
        ]
      },
      public_services: {
        label: "公共服務", facet: "social", asOf: "臺灣現況 · 2026",
        context: "社會住宅 3.0 以直接興建、包租代管及租金補貼並行；未滿 2 歲幼兒公共化托育補助每月 7,000 元起，準公共托育 13,000 元起。",
        sources: [
          { label: "內政部：社會住宅 3.0", url: "https://www.moi.gov.tw/cp.aspx?Create=1&n=285" },
          { label: "衛福部：托育政策", url: "https://www.mohw.gov.tw/CSO/cp-5130-58003-1.html" }
        ]
      },
      market_rules: {
        label: "市場規範", facet: "economy", asOf: "臺灣現況 · 2026",
        context: "2026 年最低工資為月薪 29,500 元、時薪 196 元。最低工資法要求每年依消費者物價、工資、生產力與經濟情勢等指標審議。",
        sources: [
          { label: "勞動部：2026 最低工資", url: "https://www.mol.gov.tw/1607/1632/1633/93004/post" },
          { label: "最低工資法", url: "https://laws.mol.gov.tw/FLAW/FLAWDAT0202.aspx?id=FL102659" }
        ]
      },
      transition_governance: {
        label: "轉型治理", facet: "economy", asOf: "臺灣現況 · 2026",
        context: "臺灣碳費一般費率為每公噸二氧化碳當量 300 元，符合自主減量目標者可適用 50 元或 100 元優惠費率；政府另以 2050 淨零路徑推動十二項關鍵戰略。",
        sources: [
          { label: "環境部：碳費費率", url: "https://enews.moenv.gov.tw/Page/3B3C62C78849F32F/3a0a408a-33e5-4a0d-9939-23e8222c5284" },
          { label: "國發會：2050 淨零路徑", url: "https://ncsd.ndc.gov.tw/Fore/nsdn/about0/2050Path" }
        ]
      }
    },
    distribution: {
      tax_wealth: {
        label: "稅負與財富", asOf: "臺灣現況 · 2024–2026",
        context: "主計總處以每人可支配所得排序，2024 年最高與最低 20% 家庭的所得差距為 3.92 倍。臺灣綜所稅與遺產稅均採累進稅率。",
        sources: [
          { label: "主計總處：2024 家庭收支", url: "https://ws.dgbas.gov.tw/001/Upload/463/ebook/ebook_357928/pdf/full.pdf" },
          { label: "財政部：遺產及贈與稅法", url: "https://law-out.mof.gov.tw/LawContent.aspx?id=FL006067&media=print" }
        ]
      },
      opportunity: {
        label: "機會與補償", asOf: "臺灣現況 · 2026",
        context: "《偏遠地區學校教育發展條例》允許以額外經費、人事彈性、住宿與專業支持改善偏鄉師資及學習資源，政策目標是縮小城鄉與弱勢學習差距。",
        sources: [
          { label: "教育部：偏遠地區學校支持", url: "https://www.edu.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=3E18D28CAE93DF45" },
          { label: "教育部：偏鄉學力增能", url: "https://www.edu.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=A256A75504B21BCD&sms=169B8E91BB75571F" }
        ]
      },
      welfare_targeting: {
        label: "福利與資源", asOf: "臺灣現況 · 2026",
        context: "未滿 2 歲育兒津貼已取消排富，第 1 名子女每月 5,000 元；托育補助則依公共化、準公共、弱勢身分及子女次序採不同額度。",
        sources: [
          { label: "衛福部：育兒津貼與托育補助", url: "https://www.mohw.gov.tw/CSO/cp-5130-58003-1.html" },
          { label: "我的 E 政府：托育費用補助", url: "https://www.gov.tw/News_Content_2_745216" }
        ]
      },
      reward_contribution: {
        label: "貢獻與報酬", asOf: "臺灣現況 · 2026",
        context: "最低工資保障正常工時的工資下限；勞退新制另要求雇主為適用勞工提繳至少月薪 6%，部分工時勞工也在保障範圍內。",
        sources: [
          { label: "勞動部：最低工資", url: "https://www.mol.gov.tw/1607/1632/1633/93004/post" },
          { label: "勞動部：部分工時勞退", url: "https://www.mol.gov.tw/1607/1632/1640/54506/post" }
        ]
      }
    },
    change: {
      institutional_reform: {
        label: "制度重設", asOf: "臺灣現況 · 2026",
        context: "《人工智慧基本法》已通過，政府接下來仍須把原則落實為資料治理、風險分類、人才、基礎設施與各目的事業規範；這類跨部會制度可採一次重整或分階段補強。",
        sources: [{ label: "數發部：人工智慧基本法", url: "https://moda.gov.tw/press/press-releases/18316" }]
      },
      implementation: {
        label: "政策實施", asOf: "臺灣現況 · 2026",
        context: "長照 3.0 於 2026 年啟動，涵蓋健康促進、醫療照顧銜接、在地安老與安寧善終。大型政策仍可選擇全國同步、地方試辦或設定檢討期限。",
        sources: [{ label: "行政院：長照 3.0", url: "https://www.ey.gov.tw/Page/448DE008087A1971/75589810-5aa3-418f-9c33-1d10e5950fb7" }]
      },
      risk_transition: {
        label: "風險轉型", asOf: "臺灣現況 · 2026",
        context: "臺灣已提出 2050 淨零路徑，並通過人工智慧基本法。兩者都涉及在風險尚未完全確定時，如何安排規範、投資與產業轉型時程。",
        sources: [
          { label: "國發會：2050 淨零路徑", url: "https://ncsd.ndc.gov.tw/Fore/nsdn/about0/2050Path" },
          { label: "數發部：AI 治理", url: "https://ipfs.moda.gov.tw/major-policies/ai/governance/19248.html" }
        ]
      },
      rights_culture: {
        label: "權利與文化", asOf: "臺灣現況 · 2019–2026",
        context: "《司法院釋字第 748 號解釋施行法》自 2019 年施行，使同性伴侶可以辦理結婚登記；權利改革仍持續面對法律形式、家庭制度與社會接受速度的討論。",
        sources: [
          { label: "行政院：同婚法制", url: "https://www.ey.gov.tw/Goals/60F82C802498E92D" },
          { label: "我的 E 政府：同性結婚登記", url: "https://www.gov.tw/News_Content_2_576031" }
        ]
      }
    },
    agency: {
      health_wellbeing: {
        label: "健康與福祉", asOf: "臺灣現況 · 2025–2026",
        context: "2025 年起，30–39 歲民眾每 5 年可接受一次免費成人預防保健。政策提供了檢查機會，但是否使用服務仍受個人選擇、工時與可近性影響。",
        sources: [{ label: "衛福部：成人預防保健", url: "https://www.mohw.gov.tw/cp-2704-81240-1.html" }]
      },
      education_mobility: {
        label: "教育與流動", asOf: "臺灣現況 · 2026",
        context: "臺灣以偏鄉教育特別法、學習扶助及數位學伴等方案補足地區與家庭資源差異，但教育與職涯結果仍同時受到個人投入及社會網絡影響。",
        sources: [
          { label: "教育部：偏遠地區學校支持", url: "https://www.edu.tw/News_Content.aspx?n=9E7AC85F1954DDA8&s=3E18D28CAE93DF45" },
          { label: "教育部：數位學伴補助", url: "https://www.edu.tw/EduFunding_Content.aspx?n=DB65945783B1F7D3&s=289FA61B86D4304B&sms=F362D4AAE872CDDE" }
        ]
      },
      civic_order: {
        label: "公民與秩序", asOf: "臺灣現況 · 2023–2026",
        context: "國民法官制度自 2023 年施行，符合條件的民眾可能參與重大刑案審判；公共政策網路參與平臺則提供提議、附議、政策諮詢與監督管道。",
        sources: [
          { label: "司法院：國民法官制度", url: "https://www.judicial.gov.tw/tw/cp-2341-939345-c5345-5.html" },
          { label: "公共政策網路參與平臺", url: "https://join.gov.tw/" }
        ]
      },
      work_wealth: {
        label: "工作與財富", asOf: "臺灣現況 · 2026",
        context: "在職勞工參加產業人才投資方案，可獲 80% 或 100% 訓練費補助，每 3 年最高 10 萬元；非自願失業者另有就業保險給付。",
        sources: [
          { label: "勞動部：職業訓練資源", url: "https://www.mol.gov.tw/1607/28690/87707/" },
          { label: "就業保險法第 16 條", url: "https://laws.mol.gov.tw/FLAW/FLAWDOC01.aspx?flno=16&id=FL023221" }
        ]
      }
    }
  };

  const questions = [
    { id: "R01", dimension: "role", issue: "social_protection", facet: "social", topic: "醫療長照", direction: 1, text: "面對健保醫療支出與長照需求增加，即使需要提高保費或稅收，政府仍應維持廣泛的基本保障。" },
    { id: "R06", dimension: "role", issue: "social_protection", facet: "social", topic: "退休", direction: -1, text: "在雇主依法提繳 6% 勞退之外，退休生活應更依靠個人自提與儲蓄，而不是擴大公共年金。" },
    { id: "R09", dimension: "role", issue: "social_protection", facet: "social", topic: "失業保障", direction: 1, text: "現行失業給付通常為投保薪資六成、最長六個月；政府應提高比例或延長期間。" },
    { id: "R10", dimension: "role", issue: "social_protection", facet: "social", topic: "所得風險", direction: -1, text: "工作年齡者的短期所得中斷，應優先由個人與家庭承擔，而非由政府普遍保障。" },

    { id: "R03", dimension: "role", issue: "public_services", facet: "social", topic: "住宅", direction: 1, text: "政府應以直接興建社會住宅為主，而不只依靠租金補貼與包租代管。" },
    { id: "R04", dimension: "role", issue: "public_services", facet: "social", topic: "教育", direction: -1, text: "教育服務應讓家庭保有更多自費選擇，而非主要由政府統一提供。" },
    { id: "R11", dimension: "role", issue: "public_services", facet: "social", topic: "托育", direction: 1, text: "在現有公共與準公共托育補助之外，政府應優先增加公共托育名額，即使成本較高。" },
    { id: "R12", dimension: "role", issue: "public_services", facet: "social", topic: "交通", direction: -1, text: "使用人數不足的公共運輸路線，不應只為維持服務而長期由政府補貼。" },

    { id: "R05", dimension: "role", issue: "market_rules", facet: "economy", topic: "勞動", direction: 1, text: "2026 年最低工資為月薪 29,500 元、時薪 196 元；政府仍應依生活成本持續調高。" },
    { id: "R02", dimension: "role", issue: "market_rules", facet: "economy", topic: "企業經營", direction: -1, text: "只要沒有壟斷或欺詐，政府應盡量少介入企業的定價與經營。" },
    { id: "R13", dimension: "role", issue: "market_rules", facet: "economy", topic: "平台經濟", direction: 1, text: "政府應要求數位平台為受其規則控制的工作者提供基本勞動保障。" },
    { id: "R14", dimension: "role", issue: "market_rules", facet: "economy", topic: "契約自由", direction: -1, text: "成年人自願簽訂的工作契約，政府不應因條件不理想就加以限制。" },

    { id: "R07", dimension: "role", issue: "transition_governance", facet: "economy", topic: "氣候", direction: 1, text: "碳費一般費率目前每噸 300 元；政府應逐步提高費率，讓高排放者承擔更多轉型成本。" },
    { id: "R08", dimension: "role", issue: "transition_governance", facet: "economy", topic: "新科技", direction: -1, text: "新科技應先自由發展，除非已造成明確傷害，政府才需要管制。" },
    { id: "R15", dimension: "role", issue: "transition_governance", facet: "economy", topic: "基礎建設", direction: 1, text: "面對重大產業轉型，政府應直接投資關鍵基礎建設，而不只等待民間市場。" },
    { id: "R16", dimension: "role", issue: "transition_governance", facet: "economy", topic: "產業選擇", direction: -1, text: "政府不應用補貼押注特定新興產業，因為市場更適合判斷哪些技術可行。" },

    { id: "D01", dimension: "distribution", issue: "tax_wealth", topic: "所得稅", direction: 1, text: "現行綜所稅已有累進稅率；為縮小所得差距，最高級距仍應提高。" },
    { id: "D05", dimension: "distribution", issue: "tax_wealth", topic: "財富集中", direction: 1, text: "即使形成過程合法，政府仍應把縮小所得與財富差距列為明確政策目標。" },
    { id: "D09", dimension: "distribution", issue: "tax_wealth", topic: "繼承", direction: -1, text: "在現有累進遺產稅之外，不應再為縮小世代財富差距提高稅率。" },
    { id: "D10", dimension: "distribution", issue: "tax_wealth", topic: "稅制目的", direction: -1, text: "稅制的主要目的應是支應公共服務，而不是改變人民之間的財富差距。" },

    { id: "D03", dimension: "distribution", issue: "opportunity", topic: "教育資源", direction: 1, text: "偏遠與弱勢學校應獲得高於一般學校的師資與經費，即使每名學生成本較高。" },
    { id: "D04", dimension: "distribution", issue: "opportunity", topic: "就業甄選", direction: -1, text: "只要甄選規則一致，結果上的群體差距不應成為調整錄取方式的理由。" },
    { id: "D11", dimension: "distribution", issue: "opportunity", topic: "升學", direction: 1, text: "升學評量應考量申請者可取得的家庭資源，而不只比較最後成績。" },
    { id: "D12", dimension: "distribution", issue: "opportunity", topic: "獎學金", direction: -1, text: "獎學金應優先依表現頒發，而不是為平衡家庭背景而調整標準。" },

    { id: "D07", dimension: "distribution", issue: "welfare_targeting", topic: "偏鄉服務", direction: 1, text: "偏鄉公共服務即使單位成本較高，也應盡量達到都市相近的水準。" },
    { id: "D08", dimension: "distribution", issue: "welfare_targeting", topic: "精準補助", direction: -1, text: "政府補助應精準給真正需要的人，而不是為追求一致而普遍發放。" },
    { id: "D13", dimension: "distribution", issue: "welfare_targeting", topic: "普遍給付", direction: 1, text: "未滿 2 歲育兒津貼已取消排富；基本育兒津貼應繼續不設所得門檻。" },
    { id: "D14", dimension: "distribution", issue: "welfare_targeting", topic: "排富", direction: -1, text: "成本高昂的公共給付應設定所得門檻，不必讓高所得者同樣取得。" },

    { id: "D15", dimension: "distribution", issue: "reward_contribution", topic: "必要工作", direction: 1, text: "維持社會運作所必需的工作，薪資不應只由市場上的議價能力決定。" },
    { id: "D16", dimension: "distribution", issue: "reward_contribution", topic: "組織分配", direction: 1, text: "大型組織分配獎酬時，應限制高階主管與基層員工之間的差距。" },
    { id: "D02", dimension: "distribution", issue: "reward_contribution", topic: "福利貢獻", direction: -1, text: "公共福利應優先依照繳費或貢獻多寡提供，而不是讓所有人得到相近待遇。" },
    { id: "D06", dimension: "distribution", issue: "reward_contribution", topic: "績效薪資", direction: -1, text: "只要競爭程序公開，能力與績效造成的大幅薪資差距是可以接受的。" },

    { id: "C01", dimension: "change", issue: "institutional_reform", topic: "制度改革", direction: 1, text: "當制度長期製造不公平時，應儘快大幅改革，而不是等待各方完全形成共識。" },
    { id: "C07", dimension: "change", issue: "institutional_reform", topic: "政府組織", direction: 1, text: "為解決跨部會問題，政府應勇於重新設計組織，而不只是改善既有流程。" },
    { id: "C04", dimension: "change", issue: "institutional_reform", topic: "制度延續", direction: -1, text: "成熟制度應以小幅修正為主，頻繁重做規則通常帶來更多問題。" },
    { id: "C09", dimension: "change", issue: "institutional_reform", topic: "重大修法", direction: -1, text: "涉及基本制度的重大修法，應等到主要社會群體形成廣泛共識再推動。" },

    { id: "C10", dimension: "change", issue: "implementation", topic: "政策擴張", direction: 1, text: "長照 3.0 已於 2026 年上路；面對高齡化，應先全面擴大服務，再依執行結果調整。" },
    { id: "C11", dimension: "change", issue: "implementation", topic: "行政整合", direction: 1, text: "多個機關反覆協調仍無法解決問題時，應直接重整權責而非繼續磨合。" },
    { id: "C06", dimension: "change", issue: "implementation", topic: "政策試辦", direction: -1, text: "新政策最好先小規模試辦、證明有效，再逐步推廣到全國。" },
    { id: "C12", dimension: "change", issue: "implementation", topic: "定期檢討", direction: -1, text: "影響範圍大的新制度應設定試行期限，經過正式檢討後才轉為常態。" },

    { id: "C03", dimension: "change", issue: "risk_transition", topic: "能源", direction: 1, text: "臺灣已設定 2050 淨零目標；政府應訂出更具約束力的中期能源轉型時程，即使短期成本上升。" },
    { id: "C13", dimension: "change", issue: "risk_transition", topic: "新興風險", direction: 1, text: "新興風險快速擴大時，政府應先建立新規則，不必等所有證據都完整。" },
    { id: "C02", dimension: "change", issue: "risk_transition", topic: "人工智慧", direction: -1, text: "公共部門採用生成式 AI 前，應先完成風險分級、資料治理與救濟規則，即使延後導入。" },
    { id: "C14", dimension: "change", issue: "risk_transition", topic: "轉型成本", direction: -1, text: "高風險產業的轉型時程應保留彈性，避免一次改變造成難以回復的損失。" },

    { id: "C05", dimension: "change", issue: "rights_culture", topic: "公民權利", direction: 1, text: "臺灣同婚法制施行後，對尚未充分保障的新型家庭關係，法律仍應主動擴張權利。" },
    { id: "C15", dimension: "change", issue: "rights_culture", topic: "少數承認", direction: 1, text: "既有法律忽略少數群體的生活經驗時，應儘快增訂新的保障方式。" },
    { id: "C08", dimension: "change", issue: "rights_culture", topic: "社會慣例", direction: -1, text: "改變長久形成的社會慣例時，維持延續性通常比追求速度更重要。" },
    { id: "C16", dimension: "change", issue: "rights_culture", topic: "文化規範", direction: -1, text: "法律不宜走在社會文化太前面，重大價值改變應讓不同世代有時間適應。" },

    { id: "A01", dimension: "agency", issue: "health_wellbeing", topic: "健康習慣", direction: 1, text: "即使環境條件不同，成年人仍應為可控制的健康習慣負主要責任。" },
    { id: "A09", dimension: "agency", issue: "health_wellbeing", topic: "預防保健", direction: 1, text: "政府已提供 30 歲以上成人預防保健；在服務可近時，是否定期使用主要是個人責任。" },
    { id: "A08", dimension: "agency", issue: "health_wellbeing", topic: "心理健康", direction: -1, text: "心理健康問題應被理解為社會支持與生活環境的共同結果，而不只是個人的調適能力。" },
    { id: "A10", dimension: "agency", issue: "health_wellbeing", topic: "慢性病", direction: -1, text: "慢性病風險往往受到工時、居住與食物環境影響，不能主要歸因於自律。" },

    { id: "A03", dimension: "agency", issue: "education_mobility", topic: "學習成果", direction: 1, text: "在基本資源已提供後，學習成果主要取決於個人的投入與選擇。" },
    { id: "A11", dimension: "agency", issue: "education_mobility", topic: "職涯選擇", direction: 1, text: "在受教育機會相近時，職涯發展的差異主要來自個人做出的選擇。" },
    { id: "A02", dimension: "agency", issue: "education_mobility", topic: "長期貧窮", direction: -1, text: "一個人陷入長期貧窮，往往更受家庭背景與社會條件影響，而非個人選擇。" },
    { id: "A12", dimension: "agency", issue: "education_mobility", topic: "社會流動", direction: -1, text: "一個人能否向上流動，很大程度取決於其成長地區與可接觸的人際網絡。" },

    { id: "A07", dimension: "agency", issue: "civic_order", topic: "公民參與", direction: 1, text: "政府已提供網路提案與附議管道；民主品質仍主要取決於公民是否願意實際參與。" },
    { id: "A13", dimension: "agency", issue: "civic_order", topic: "違法責任", direction: 1, text: "即使受到生活壓力，成年人仍應為自己明知違法的行為負主要責任。" },
    { id: "A04", dimension: "agency", issue: "civic_order", topic: "犯罪環境", direction: -1, text: "降低犯罪不能只靠處罰個人，更需要處理居住、教育與就業環境。" },
    { id: "A14", dimension: "agency", issue: "civic_order", topic: "制度信任", direction: -1, text: "人們不信任公共制度，往往與長期受到的制度對待有關，而不只是缺乏公民素養。" },

    { id: "A05", dimension: "agency", issue: "work_wealth", topic: "技能更新", direction: 1, text: "政府已補助在職訓練；面對產業變動，工作者仍有責任主動更新技能。" },
    { id: "A15", dimension: "agency", issue: "work_wealth", topic: "創業結果", direction: 1, text: "在基本市場規則公平時，創業成敗主要應歸因於經營者的判斷與承擔。" },
    { id: "A06", dimension: "agency", issue: "work_wealth", topic: "經濟成就", direction: -1, text: "個人的經濟成就很大程度取決於出生家庭、社會網絡與時代機會。" },
    { id: "A16", dimension: "agency", issue: "work_wealth", topic: "就業波動", direction: -1, text: "大規模失業通常更應歸因於產業與總體經濟變化，而不是個別工作者的準備不足。" }
  ];

  return { version: "4.0.0", dimensions, issues, questions };
});
