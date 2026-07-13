(function () {
  "use strict";
  const bank = window.QUESTION_BANK;
  const scoring = window.PoliticalScoring;
  const quizSession = window.QuizSession;
  const recordCodec = window.PoliticalRecord;
  const types = window.PERSONALITY_TYPES;
  const storageKey = "political-values-v2.2";
  const options = [
    { value: 1, label: "非常不同意" },
    { value: 2, label: "比較不同意" },
    { value: 4, label: "比較同意" },
    { value: 5, label: "非常同意" },
    { value: 3, label: "不確定／不計分", uncertain: true }
  ];
  const state = { current: 0, questions: [], answers: [], comparisonSource: null, lastRecord: null, lastRecords: [], lastResult: null };

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
      comparisonSource: state.comparisonSource
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
      state.comparisonSource = saved.comparisonSource ? recordCodec.validateRecord(saved.comparisonSource, bank.questions) : state.comparisonSource;
      return state.answers.some(function (answer) { return answer !== null; });
    } catch (_) { return false; }
  }

  function renderQuestion() {
    const question = state.questions[state.current];
    const dimension = bank.dimensions[question.dimension];
    $("dimensionLabel").textContent = dimension.label;
    $("topicLabel").textContent = question.topic;
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
      questionIds: state.questions.map(function (question) { return question.id; }),
      answers: state.answers.slice()
    };
    const records = state.comparisonSource ? [state.comparisonSource, record] : [record];
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
    $("comparisonSection").hidden = records.length !== 2;
    if (records.length === 2) renderComparison(records[0], records[1]);
    renderResultNotes(records.length === 2, importedSingle);
    localStorage.removeItem(storageKey);
    state.lastResult = result;
    state.lastRecord = record;
    state.lastRecords = records.slice();
    state.comparisonSource = records.length === 2 ? records[0] : null;
    showScreen($("resultScreen"));
  }

  function renderResultNotes(isComparison, importedSingle) {
    $("compareButton").hidden = !importedSingle;
    if (isComparison) {
      $("resultNoteNumber").textContent = "2 / RECORDS";
      $("resultNoteTitle").textContent = "比較已完成";
      $("resultNoteBody").textContent = "四軸比較保留整體方向；逐題表只比較雙方實際抽到的題目。沒有抽到的題目會明確標記，不當作中立或不同意。";
    } else if (importedSingle) {
      $("resultNoteNumber").textContent = "SHARED / RECORD";
      $("resultNoteTitle").textContent = "朋友傳來的結果";
      $("resultNoteBody").textContent = "這份結果由網址中的紀錄還原。點「用我的答案比較」會抽出你的 16 題；即使題組不同，完成後仍會逐題標出雙方是否抽到。";
    } else {
      $("resultNoteNumber").textContent = "16 / TYPES";
      $("resultNoteTitle").textContent = "網址就是紀錄";
      $("resultNoteBody").textContent = "你的題號與答案已保存在網址 #record 後方。複製完整網址即可保存或傳給朋友；拿到網址的人可以直接查看，或用自己的答案比較。";
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

  function renderComparison(firstRecord, secondRecord) {
    const comparison = recordCodec.buildComparison(firstRecord, secondRecord, bank.questions);
    const firstResult = scoreRecord(firstRecord);
    const secondResult = scoreRecord(secondRecord);
    $("comparisonSummary").textContent = "共同抽到 " + comparison.sharedCount + " 題 · 對方獨有 " + comparison.onlyFirstCount + " 題 · 你獨有 " + comparison.onlySecondCount + " 題";
    $("comparisonAxes").innerHTML = "";
    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const first = firstResult.scores[key].leftPercentage;
      const second = secondResult.scores[key].leftPercentage;
      const card = document.createElement("div");
      card.className = "comparison-axis-card";
      card.innerHTML =
        "<div><b>" + meta.label + "</b><span>相差 " + Math.abs(first - second) + " 點</span></div>" +
        "<p><span>對方 <strong>" + first + "</strong></span><i>" + meta.left + "傾向</i><span>你 <strong>" + second + "</strong></span></p>";
      $("comparisonAxes").appendChild(card);
    });

    $("comparisonRows").innerHTML = "";
    comparison.rows.forEach(function (row, index) {
      const item = document.createElement("article");
      item.className = "comparison-row " + (row.status === "both" ? "is-shared" : "is-unmatched") + (row.sameAnswer ? " is-same" : "");
      const firstLabel = row.firstAnswer === null ? "對方未抽到此題" : answerLabel(row.firstAnswer);
      const secondLabel = row.secondAnswer === null ? "你未抽到此題" : answerLabel(row.secondAnswer);
      item.innerHTML =
        "<div class=\"comparison-question\"><span>" + String(index + 1).padStart(2, "0") + " · " + row.question.topic + "</span><h3>" + row.question.text + "</h3></div>" +
        "<div class=\"comparison-answer" + (row.firstAnswer === null ? " is-missing" : "") + "\"><small>對方</small><b>" + firstLabel + "</b></div>" +
        "<div class=\"comparison-answer" + (row.secondAnswer === null ? " is-missing" : "") + "\"><small>你</small><b>" + secondLabel + "</b></div>";
      $("comparisonRows").appendChild(item);
    });
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
    state.comparisonSource = state.lastRecords[0];
    localStorage.removeItem(storageKey);
    createSession();
    renderQuestion();
    showScreen($("quizScreen"));
  }

  function restart() {
    state.comparisonSource = null;
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

  function shareResult() {
    const result = state.lastResult;
    const profile = types[result.type];
    const lines = [(state.lastRecords.length === 2 ? "我的比較結果：" : "我的政見座標：") + result.type + "「" + profile.name + "」"];
    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const score = result.scores[key];
      lines.push(meta.left + " " + score.leftPercentage + "｜" + score.rightPercentage + " " + meta.right);
    });
    if (state.lastRecords.length === 2) lines.push("網址包含雙方逐題比較；未抽到的題目會分別標記。");
    lines.push("完整紀錄網址：", location.href, "任何拿到網址的人都能查看其中的作答紀錄。");
    navigator.clipboard.writeText(lines.join("\n")).then(function () { showToast("結果與紀錄網址已複製"); }).catch(function () { showToast("無法複製，請檢查瀏覽器權限"); });
  }

  function initializeFromHash() {
    if (!location.hash) return;
    const decoded = recordCodec.decode(location.hash, bank.questions);
    if (!decoded) {
      showToast("這個紀錄網址無法讀取或已損壞");
      return;
    }
    renderRecords(decoded.records, decoded.records.length === 1);
    if (decoded.bankVersion !== bank.version) showToast("這份紀錄來自不同題庫版本，已用相同題號還原");
  }

  $("startButton").addEventListener("click", start);
  $("backButton").addEventListener("click", function () { if (state.current > 0) { state.current -= 1; saveProgress(); renderQuestion(); } });
  $("closeButton").addEventListener("click", function () { saveProgress(); showScreen($("introScreen")); });
  $("compareButton").addEventListener("click", startComparison);
  $("restartButton").addEventListener("click", restart);
  $("shareButton").addEventListener("click", shareResult);
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
