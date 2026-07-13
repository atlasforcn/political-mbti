(function () {
  "use strict";
  const bank = window.QUESTION_BANK;
  const scoring = window.PoliticalScoring;
  const quizSession = window.QuizSession;
  const types = window.PERSONALITY_TYPES;
  const storageKey = "political-values-v2.1";
  const options = [
    { value: 1, label: "非常不同意" },
    { value: 2, label: "比較不同意" },
    { value: 4, label: "比較同意" },
    { value: 5, label: "非常同意" },
    { value: 3, label: "不確定／不計分", uncertain: true }
  ];
  const state = { current: 0, questions: [], answers: [] };

  const $ = function (id) { return document.getElementById(id); };
  const screens = [$("introScreen"), $("quizScreen"), $("resultScreen")];

  function showScreen(target) {
    screens.forEach(function (screen) { screen.classList.toggle("is-active", screen === target); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveProgress() {
    localStorage.setItem(storageKey, JSON.stringify({
      current: state.current,
      questionIds: state.questions.map(function (question) { return question.id; }),
      answers: state.answers
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
    } else renderResult();
  }

  function renderResult() {
    const result = scoring.scoreQuiz(state.questions, state.answers, bank.dimensions);
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
    localStorage.removeItem(storageKey);
    state.lastResult = result;
    showScreen($("resultScreen"));
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

  function restart() {
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
    const lines = ["我的政見座標：" + result.type + "「" + profile.name + "」"];
    Object.keys(bank.dimensions).forEach(function (key) {
      const meta = bank.dimensions[key];
      const score = result.scores[key];
      lines.push(meta.left + " " + score.leftPercentage + "｜" + score.rightPercentage + " " + meta.right);
    });
    if (result.governmentProfile && result.governmentProfile.sufficient) {
      lines.push("政府邊界：社會保障 " + result.governmentProfile.social.leftPercentage + "｜經濟治理 " + result.governmentProfile.economy.leftPercentage + "（落差 " + result.governmentProfile.gap + "）");
    }
    lines.push("這是價值探索工具，不是政黨配對或心理診斷。", location.href);
    navigator.clipboard.writeText(lines.join("\n")).then(function () { showToast("結果摘要已複製"); }).catch(function () { showToast("無法複製，請檢查瀏覽器權限"); });
  }

  $("startButton").addEventListener("click", start);
  $("backButton").addEventListener("click", function () { if (state.current > 0) { state.current -= 1; saveProgress(); renderQuestion(); } });
  $("closeButton").addEventListener("click", function () { saveProgress(); showScreen($("introScreen")); });
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
})();
