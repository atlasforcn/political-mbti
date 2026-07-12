(function () {
  "use strict";
  const bank = window.QUESTION_BANK;
  const scoring = window.PoliticalScoring;
  const quizSession = window.QuizSession;
  const types = window.PERSONALITY_TYPES;
  const storageKey = "political-values-v2";
  const labels = ["非常不同意", "不同意", "中立／不確定", "同意", "非常同意"];
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

    labels.forEach(function (label, index) {
      const value = index + 1;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button" + (state.answers[state.current] === value ? " is-selected" : "");
      button.innerHTML = "<span class=\"answer-key\">" + value + "</span><span>" + label + "</span>";
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
      row.innerHTML =
        "<div class=\"axis-meta\"><b>" + meta.label + "</b><span>" + (score.balance ? "接近中線" : "傾向「" + (score.leftPercentage >= 50 ? meta.left : meta.right) + "」") + "</span></div>" +
        "<div class=\"axis-labels\"><span>" + meta.left + " <b>" + score.leftPercentage + "</b></span><span><b>" + score.rightPercentage + "</b> " + meta.right + "</span></div>" +
        "<div class=\"axis-track\"><span style=\"width:" + score.leftPercentage + "%\"></span><i style=\"left:" + score.leftPercentage + "%\"></i></div>";
      $("axisResults").appendChild(row);
    });
    localStorage.removeItem(storageKey);
    state.lastResult = result;
    showScreen($("resultScreen"));
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
    const value = Number(event.key);
    if (value >= 1 && value <= 5) answerQuestion(value);
    if (event.key === "ArrowLeft" && state.current > 0) { state.current -= 1; saveProgress(); renderQuestion(); }
  });
})();
