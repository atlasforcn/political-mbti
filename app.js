(function () {
  "use strict";
  const bank = window.QUESTION_BANK;
  const scoring = window.PoliticalScoring;
  const quizSession = window.QuizSession;
  const recordCodec = window.PoliticalRecord;
  const types = window.PERSONALITY_TYPES;
  const discussion = window.PoliticalDiscussion;
  const storageKey = "political-values-v4";
  const nameStorageKey = "political-values-name";
  const options = [
    { value: 1, label: "非常不同意" },
    { value: 2, label: "比較不同意" },
    { value: 4, label: "比較同意" },
    { value: 5, label: "非常同意" },
    { value: 3, label: "不確定／不計分", uncertain: true }
  ];
  const state = { current: 0, questions: [], answers: [], comparisonSources: [], lastRecord: null, lastRecords: [], lastResult: null, discussionProfile: null, debateIndex: 0 };

  const $ = function (id) { return document.getElementById(id); };
  const screens = [$("introScreen"), $("quizScreen"), $("resultScreen")];

  function showScreen(target) {
    screens.forEach(function (screen) { screen.classList.toggle("is-active", screen === target); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function recordQuestions(record) {
    const questions = quizSession.restoreQuestions(record.questionIds, bank.questions);
    if (!questions) throw new Error("無法還原紀錄題目");
    return questions;
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify({
      current: state.current,
      questionIds: state.questions.map(function (question) { return question.id; }),
      answers: state.answers,
      comparisonSources: state.comparisonSources
    }));
  }

  function createSession() {
    state.current = 0;
    state.questions = quizSession.selectBalancedQuestions(bank.questions, bank.dimensions);
    state.answers = Array(state.questions.length).fill(null);
  }

  function restoreProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      const restoredQuestions = quizSession.restoreQuestions(saved && saved.questionIds, bank.questions);
      if (!restoredQuestions || !Array.isArray(saved.answers) || saved.answers.length !== restoredQuestions.length) return false;
      state.questions = restoredQuestions;
      state.answers = saved.answers.slice();
      state.current = Math.min(Math.max(saved.current || 0, 0), state.questions.length - 1);
      const sources = saved.comparisonSources || (saved.comparisonSource ? [saved.comparisonSource] : []);
      state.comparisonSources = Array.isArray(sources) ? sources.map(function (record) { return recordCodec.validateRecord(record, bank.questions); }) : [];
      return state.answers.some(function (answer) { return answer !== null; });
    } catch (_) { return false; }
  }

  function renderQuestion() {
    const question = state.questions[state.current];
    const dimension = bank.dimensions[question.dimension];
    const issue = bank.issues[question.dimension][question.issue];
    $("dimensionLabel").textContent = dimension.label;
    $("topicLabel").textContent = issue.label + " · " + question.topic;
    $("contextAsOf").textContent = issue.asOf;
    $("contextText").textContent = issue.context;
    $("contextSources").replaceChildren();
    issue.sources.forEach(function (source) {
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = source.label + " ↗";
      $("contextSources").appendChild(link);
    });
    $("questionText").textContent = question.text;
    $("questionNumber").textContent = String(state.current + 1).padStart(2, "0");
    $("questionTotal").textContent = state.questions.length;
    $("progressBar").style.width = ((state.current + 1) / state.questions.length * 100) + "%";
    $("backButton").disabled = state.current === 0;
    $("answerScale").innerHTML = "<legend class=\"sr-only\">選擇同意程度</legend>";

    options.forEach(function (option, index) {
      const value = option.value;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button" + (option.uncertain ? " is-uncertain" : "") + (state.answers[state.current] === value ? " is-selected" : "");
      button.innerHTML = "<span class=\"answer-key\">" + (index + 1) + "</span><span>" + option.label + "</span>";
      button.addEventListener("click", function () { answerQuestion(value); });
      $("answerScale").appendChild(button);
    });
  }

  function answerQuestion(value) {
    state.answers[state.current] = value;
    saveProgress();
    if (state.current < state.questions.length - 1) {
      state.current += 1;
      setTimeout(renderQuestion, 120);
    } else finishQuiz();
  }

  function finishQuiz() {
    const record = {
      name: $("participantName").value.trim() || "匿名玩家",
      questionIds: state.questions.map(function (question) { return question.id; }),
      answers: state.answers.slice()
    };
    const records = state.comparisonSources.concat(record).slice(-recordCodec.maxRecords);
    writeRecordHash(records);
    renderRecords(records, false);
  }

  function scoreRecord(record) {
    return scoring.scoreQuiz(recordQuestions(record), record.answers, bank.dimensions);
  }

  function renderRecords(records, importedSingle) {
    const record = records[records.length - 1];
    const result = scoreRecord(record);
    const profile = types[result.type];
    $("resultCode").textContent = result.type;
    $("resultName").textContent = profile.name;
    $("resultSummary").textContent = profile.summary;
    renderThoughtNeighbor(profile.thought);
    renderDiscussion(record, result);
    $("axisResults").innerHTML = "";

    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const score = result.scores[key];
      const row = document.createElement("div");
      row.className = "axis-row";
      const reading = score.insufficient ? "資料不足" : score.balance ? "拉鋸中" : score.strength + "傾向「" + (score.leftPercentage >= 50 ? meta.left : meta.right) + "」";
      row.innerHTML =
        "<div class=\"axis-meta\"><b>" + meta.label + "</b><span>" + reading + " · 有效 " + score.answeredCount + "/" + score.itemCount + " 題</span></div>" +
        "<div class=\"axis-labels\"><span>" + meta.left + " <b>" + score.leftPercentage + "</b></span><span><b>" + score.rightPercentage + "</b> " + meta.right + "</span></div>" +
        "<div class=\"axis-track\"><span style=\"width:" + score.leftPercentage + "%\"></span><i style=\"left:" + score.leftPercentage + "%\"></i></div>";
      $("axisResults").appendChild(row);
    });

    renderGovernmentProfile(result.governmentProfile);
    $("comparisonSection").hidden = records.length < 2;
    if (records.length >= 2) renderComparison(records);
    renderResultNotes(records.length >= 2, importedSingle, records.length);
    localStorage.removeItem(storageKey);
    state.lastResult = result;
    state.lastRecord = record;
    state.lastRecords = records.slice();
    state.comparisonSources = records.length >= 2 ? records.slice(0, -1) : [];
    showScreen($("resultScreen"));
  }

  function renderThoughtNeighbor(thought) {
    $("thoughtThinker").textContent = thought.thinker;
    $("thoughtField").textContent = thought.field;
    $("thoughtQuestion").textContent = "「" + thought.question + "」";
    $("thoughtConnection").textContent = thought.connection;
    $("thoughtWork").textContent = thought.work;
    $("thoughtLink").href = thought.searchUrl;
  }

  function renderDiscussion(record, result) {
    const questions = recordQuestions(record);
    const profile = discussion.analyze(questions, record.answers, result, bank.dimensions, bank.issues);
    state.discussionProfile = profile;
    state.debateIndex = 0;
    $("discussionArchetype").textContent = profile.archetype;
    $("discussionArchetypeCopy").textContent = profile.archetypeCopy;
    $("discussionAxis").textContent = "最鮮明軸線 · " + profile.strongestAxis;
    $("discussionHeat").textContent = profile.heat;
    $("discussionHeatBar").style.width = profile.heat + "%";
    $("discussionHeatLabel").textContent = profile.heatLabel;
    $("rebelCard").hidden = !profile.rebel;
    if (profile.rebel) {
      $("rebelTopic").textContent = profile.rebel.issue + " · " + profile.rebel.question.topic;
      $("rebelQuestion").textContent = profile.rebel.question.text;
      $("rebelAnswer").textContent = "你選了「" + discussion.answerCopy(profile.rebel.answer) + "」";
    }
    renderDebatePrompt();
  }

  function renderDebatePrompt() {
    const prompts = state.discussionProfile && state.discussionProfile.prompts;
    if (!prompts || !prompts.length) return;
    const prompt = prompts[state.debateIndex % prompts.length];
    $("debateTopic").textContent = prompt.topic;
    $("debateQuestion").textContent = prompt.question;
    $("debateAnswer").textContent = prompt.answer;
  }

  function renderResultNotes(isComparison, importedSingle, recordCount) {
    $("compareButton").hidden = !importedSingle || recordCount >= recordCodec.maxRecords;
    if (isComparison) {
      $("resultNoteNumber").textContent = recordCount + " / 6 PLAYERS";
      $("resultNoteTitle").textContent = "共同討論桌";
      $("resultNoteBody").textContent = "這條網址已累積 " + recordCount + " 人。分享出去後，朋友可以查看全員答案，再把自己加入同一張討論桌。";
    } else if (importedSingle) {
      $("resultNoteNumber").textContent = "SHARED / RECORD";
      $("resultNoteTitle").textContent = "朋友傳來的結果";
      $("resultNoteBody").textContent = "這份結果由網址中的紀錄還原。點「加入我的答案」會抽出你的 16 題，完成後把你加入同一張接力討論桌。";
    } else {
      $("resultNoteNumber").textContent = "16 / TYPES";
      $("resultNoteTitle").textContent = "網址就是紀錄";
      $("resultNoteBody").textContent = "你的題號與答案已轉成 R01A 這類代碼，保存在網址 #r 後方。複製完整網址即可保存或傳給朋友；拿到網址的人可以直接查看，或用自己的答案比較。";
    }
  }

  function renderGovernmentProfile(profile) {
    const copy = {
      social_public_economy_market: ["選擇性政府", "社會保障偏向共同承擔，經濟治理則偏向市場放手。你不是單純支持大政府或小政府，而是依議題劃出不同邊界。"],
      social_private_economy_public: ["選擇性政府", "社會保障偏向個人選擇，經濟治理卻接受較多公共介入。你對政府大小的判準會隨議題改變。"],
      broad_public: ["廣泛公共介入", "在社會保障與經濟治理上，你都較願意讓政府承擔責任。"],
      limited_public: ["廣泛政府克制", "在社會保障與經濟治理上，你都較傾向保留個人或市場空間。"],
      mixed: ["邊界仍在拉鋸", "兩類議題尚未形成清楚而一致的政府邊界。比起單一標籤，你的個別題目選擇更值得細看。"],
      insufficient: ["資料不足", "其中一類題目有太多「不確定」，暫時無法判斷你是否會依議題改變政府邊界。"]
    };
    const message = copy[profile.kind];
    $("governmentProfile").classList.toggle("is-selective", profile.selective);
    $("governmentReading").textContent = message[0];
    $("governmentSummary").textContent = message[1];
    $("governmentGap").textContent = profile.sufficient ? "兩類落差 " + profile.gap + " 點" : "有效回答不足";
    ["social", "economy"].forEach(function (key) {
      const score = profile[key];
      $(key + "GovernmentLeftValue").textContent = score.leftPercentage;
      $(key + "GovernmentRightValue").textContent = 100 - score.leftPercentage;
      $(key + "GovernmentBar").style.width = score.leftPercentage + "%";
      $(key + "GovernmentMarker").style.left = score.leftPercentage + "%";
    });
  }

  function participantName(record, index, total) {
    return record.name || (index === total - 1 ? "你" : "玩家 " + (index + 1));
  }

  function renderComparison(records) {
    const comparison = recordCodec.buildGroupComparison(records, bank.questions);
    const results = records.map(scoreRecord);
    $("comparisonSummary").textContent = records.length + " 人接力完成 · 共出現 " + comparison.rows.length + " 道不同題目";
    $("comparisonAxes").innerHTML = "";
    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const values = results.map(function (result) { return result.scores[key].leftPercentage; });
      const low = Math.min.apply(null, values);
      const high = Math.max.apply(null, values);
      const card = document.createElement("div");
      card.className = "comparison-axis-card";
      card.innerHTML =
        "<div><b>" + meta.label + "</b><span>全桌跨度 " + (high - low) + " 點</span></div>" +
        "<p><span>最低 <strong>" + low + "</strong></span><i>" + meta.left + "傾向</i><span>最高 <strong>" + high + "</strong></span></p>";
      $("comparisonAxes").appendChild(card);
    });

    $("comparisonRows").innerHTML = "";
    comparison.rows.forEach(function (row, index) {
      const item = document.createElement("article");
      item.className = "comparison-row" + (row.answeredCount < records.length ? " is-unmatched" : "");
      item.style.gridTemplateColumns = "minmax(280px,1.5fr) repeat(" + records.length + ",minmax(125px,.55fr))";
      item.innerHTML = "<div class=\"comparison-question\"><span>" + String(index + 1).padStart(2, "0") + " · " + bank.issues[row.question.dimension][row.question.issue].label + " / " + row.question.topic + "</span><h3>" + row.question.text + "</h3></div>";
      row.answers.forEach(function (answer, playerIndex) {
        const cell = document.createElement("div");
        cell.className = "comparison-answer" + (answer === null ? " is-missing" : "");
        const small = document.createElement("small");
        const value = document.createElement("b");
        small.textContent = participantName(records[playerIndex], playerIndex, records.length);
        value.textContent = answer === null ? "這次未抽到" : answerLabel(answer);
        cell.appendChild(small);
        cell.appendChild(value);
        item.appendChild(cell);
      });
      $("comparisonRows").appendChild(item);
    });

    const clash = comparison.rows.slice().sort(function (a, b) { return b.spread - a.spread; })[0];
    $("showdownCard").hidden = !clash || clash.spread === 0;
    if (clash && clash.spread > 0) {
      $("showdownTopic").textContent = bank.issues[clash.question.dimension][clash.question.issue].label + " · " + clash.question.topic;
      $("showdownQuestion").textContent = clash.question.text;
      const positions = clash.answers.map(function (answer, index) { return { answer, index }; }).filter(function (item) { return item.answer !== null && item.answer !== 3; });
      const min = positions.slice().sort(function (a, b) { return a.answer - b.answer; })[0];
      const max = positions.slice().sort(function (a, b) { return b.answer - a.answer; })[0];
      $("showdownFirst").textContent = participantName(records[min.index], min.index, records.length) + "：" + answerLabel(min.answer);
      $("showdownSecond").textContent = participantName(records[max.index], max.index, records.length) + "：" + answerLabel(max.answer);
    }
  }

  function answerLabel(value) {
    if (value === 3) return "不確定／不計分";
    const option = options.find(function (item) { return item.value === value; });
    return option ? option.label : "無效答案";
  }

  function writeRecordHash(records) {
    const hash = recordCodec.encode(records, bank.version, bank.questions);
    history.replaceState(null, "", location.pathname + location.search + hash);
  }

  function clearRecordHash() {
    history.replaceState(null, "", location.pathname + location.search);
  }

  function start() {
    const hasProgress = restoreProgress();
    if (!hasProgress) createSession();
    if (hasProgress && !window.confirm("偵測到未完成的測驗，要從上次進度繼續嗎？\n按「取消」會重新開始。")) {
      createSession();
      localStorage.removeItem(storageKey);
    }
    renderQuestion();
    showScreen($("quizScreen"));
  }

  function startComparison() {
    state.comparisonSources = state.lastRecords.slice();
    localStorage.removeItem(storageKey);
    createSession();
    renderQuestion();
    showScreen($("quizScreen"));
  }

  function restart() {
    state.comparisonSources = [];
    state.lastRecords = [];
    clearRecordHash();
    createSession();
    localStorage.removeItem(storageKey);
    renderQuestion();
    showScreen($("quizScreen"));
  }

  function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("is-visible");
    setTimeout(function () { $("toast").classList.remove("is-visible"); }, 2200);
  }

  async function shareResult() {
    const result = state.lastResult;
    const profile = types[result.type];
    const talk = state.discussionProfile;
    const lines = [(state.lastRecords.length >= 2 ? "我們的共同討論桌（" + state.lastRecords.length + " 人）：" : "我的政見座標：") + result.type + "「" + profile.name + "」"];
    if (talk) lines.push("討論系人格：" + talk.archetype + "｜立場音量 " + talk.heat + "%");
    if (profile.thought) lines.push("思想鄰居：" + profile.thought.thinker + "｜延伸閱讀 " + profile.thought.work);
    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const score = result.scores[key];
      lines.push(meta.left + " " + score.leftPercentage + "｜" + score.rightPercentage + " " + meta.right);
    });
    if (state.lastRecords.length >= 2) lines.push("網址包含全員逐題比較；你也可以加入答案再分享給下一位。");
    if (talk && talk.prompts.length) {
      const prompt = talk.prompts[state.debateIndex % talk.prompts.length];
      lines.push("想問你：" + prompt.question, "我選「" + prompt.answer + "」，你呢？");
    }
    lines.push("完整紀錄網址：", location.href, "任何拿到網址的人都能查看其中的作答紀錄。");
    const text = lines.join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: "政見座標｜共同討論桌", text: lines.slice(0, -3).join("\n"), url: location.href });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
    navigator.clipboard.writeText(text).then(function () { showToast("討論桌與紀錄網址已複製"); }).catch(function () { showToast("無法複製，請檢查瀏覽器權限"); });
  }

  function importFriendRecord(event) {
    event.preventDefault();
    const hash = recordCodec.extractHash($("friendUrlInput").value);
    const decoded = hash && recordCodec.decode(hash, bank.questions);
    if (!decoded) {
      $("friendUrlStatus").textContent = "讀不到有效紀錄。請確認網址包含完整的 #r=… 代碼。";
      $("friendUrlInput").setAttribute("aria-invalid", "true");
      return;
    }
    if (decoded.bankVersion !== bank.version) {
      $("friendUrlStatus").textContent = "這份網址使用舊題庫；題意已更新，請重新作答。";
      $("friendUrlInput").setAttribute("aria-invalid", "true");
      return;
    }
    $("friendUrlStatus").textContent = "";
    $("friendUrlInput").removeAttribute("aria-invalid");
    writeRecordHash(decoded.records);
    renderRecords(decoded.records, true);
  }

  function initializeFromHash() {
    if (!location.hash) return;
    const decoded = recordCodec.decode(location.hash, bank.questions);
    if (!decoded) {
      showToast("這個紀錄網址無法讀取或已損壞");
      return;
    }
    if (decoded.bankVersion !== bank.version) {
      showScreen($("introScreen"));
      showToast("這份網址使用舊題庫；題意已更新，請重新作答");
      return;
    }
    if (decoded.format === "legacy") writeRecordHash(decoded.records);
    renderRecords(decoded.records, true);
  }

  $("participantName").value = localStorage.getItem(nameStorageKey) || "";
  $("participantName").addEventListener("input", function () { localStorage.setItem(nameStorageKey, $("participantName").value); });
  $("startButton").addEventListener("click", start);
  $("friendImportForm").addEventListener("submit", importFriendRecord);
  $("backButton").addEventListener("click", function () { if (state.current > 0) { state.current -= 1; saveProgress(); renderQuestion(); } });
  $("closeButton").addEventListener("click", function () { saveProgress(); showScreen($("introScreen")); });
  $("compareButton").addEventListener("click", startComparison);
  $("restartButton").addEventListener("click", restart);
  $("shareButton").addEventListener("click", shareResult);
  $("nextDebateButton").addEventListener("click", function () { state.debateIndex += 1; renderDebatePrompt(); });
  $("methodButton").addEventListener("click", function () { $("methodDialog").showModal(); });
  $("closeMethodButton").addEventListener("click", function () { $("methodDialog").close(); });
  $("methodDialog").addEventListener("click", function (event) { if (event.target === $("methodDialog")) $("methodDialog").close(); });
  window.addEventListener("keydown", function (event) {
    if (!$("quizScreen").classList.contains("is-active")) return;
    const optionIndex = Number(event.key) - 1;
    if (optionIndex >= 0 && optionIndex < options.length) answerQuestion(options[optionIndex].value);
    if (event.key === "ArrowLeft" && state.current > 0) { state.current -= 1; saveProgress(); renderQuestion(); }
  });
  window.addEventListener("hashchange", initializeFromHash);

  initializeFromHash();
})();
