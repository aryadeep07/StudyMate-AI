// ==========================================================================
// STUDYMATE AI - CLIENT CONTROLLER
// Handles application state, API communication, animations, and quiz play
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- UI Elements ---
  const studyForm = document.getElementById("study-form");
  const inputSubject = document.getElementById("input-subject");
  const inputTopic = document.getElementById("input-topic");
  const inputExamDate = document.getElementById("input-exam-date");
  const inputDailyHours = document.getElementById("input-daily-hours");
  const hoursDisplayValue = document.getElementById("hours-display-value");
  
  // State Containers
  const stateWelcome = document.getElementById("state-welcome");
  const stateLoading = document.getElementById("state-loading");
  const stateError = document.getElementById("state-error");
  const stateResults = document.getElementById("state-results");
  const errorMessageText = document.getElementById("error-message-text");
  const buttonRetry = document.getElementById("button-retry");

  // Tab Buttons & Panels
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // Planner Panel Elements
  const plannerBadgeSubject = document.getElementById("planner-badge-subject");
  const plannerTitle = document.getElementById("planner-title");
  const plannerSummaryHours = document.getElementById("planner-summary-hours");
  const plannerSummary = document.getElementById("planner-summary");
  const plannerScheduleContainer = document.getElementById("planner-schedule-container");

  // Revision Panel Elements
  const revisionBadgeSubject = document.getElementById("revision-badge-subject");
  const revisionTitle = document.getElementById("revision-title");
  const revisionCountdownText = document.getElementById("revision-countdown-text");
  const revisionMilestonesContainer = document.getElementById("revision-milestones-container");
  const revisionNightBefore = document.getElementById("revision-night-before");
  const revisionMorningOf = document.getElementById("revision-morning-of");

  // Quiz Panel Elements
  const quizBadgeSubject = document.getElementById("quiz-badge-subject");
  const quizTitle = document.getElementById("quiz-title");
  const quizProgressText = document.getElementById("quiz-progress-text");
  const quizActiveWindow = document.getElementById("quiz-active-window");
  const quizResultsWindow = document.getElementById("quiz-results-window");
  const quizProgressFill = document.getElementById("quiz-progress-fill");
  const quizQuestionText = document.getElementById("quiz-question-text");
  const quizOptionsContainer = document.getElementById("quiz-options-container");
  const quizExplanationContainer = document.getElementById("quiz-explanation-container");
  const quizExplanationText = document.getElementById("quiz-explanation-text");
  const buttonNextQuestion = document.getElementById("button-next-question");
  const quizFinalScore = document.getElementById("quiz-final-score");
  const quizPerformanceFeedback = document.getElementById("quiz-performance-feedback");
  const buttonRestartQuiz = document.getElementById("button-restart-quiz");

  // Motivation Panel Elements
  const motivationBadgeSubject = document.getElementById("motivation-badge-subject");
  const motivationPepTalk = document.getElementById("motivation-pep-talk");
  const motivationQuoteText = document.getElementById("motivation-quote-text");
  const motivationQuoteAuthor = document.getElementById("motivation-quote-author");
  const motivationTipsContainer = document.getElementById("motivation-tips-container");

  // Quick Boost Widget Elements
  const buttonQuickBoost = document.getElementById("button-quick-boost");
  const boostBox = document.getElementById("boost-box");
  const boostSpinner = document.getElementById("boost-spinner");

  // --- App State ---
  let generatedData = null;
  let quizState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false
  };

  // --- Setup Defaults ---
  // Set default exam date to 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  inputExamDate.value = defaultDate.toISOString().split("T")[0];

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  inputExamDate.min = tomorrow.toISOString().split("T")[0];

  // Hour slider label handler
  inputDailyHours.addEventListener("input", (e) => {
    const val = e.target.value;
    hoursDisplayValue.textContent = val + (val == 1 ? " hour" : " hours");
  });

  // --- Tab Selection Handler ---
  tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetTab = link.getAttribute("data-tab");
      
      // Update active classes on tab buttons
      tabLinks.forEach(t => t.classList.remove("active"));
      link.classList.add("active");

      // Update active classes on content panels
      tabPanels.forEach(p => p.classList.remove("active"));
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // --- Application State Transitions ---
  function changeState(newState) {
    const states = [stateWelcome, stateLoading, stateError, stateResults];
    states.forEach(s => {
      s.classList.remove("active");
      setTimeout(() => {
        s.style.display = "none";
      }, 200);
    });

    setTimeout(() => {
      newState.style.display = newState.id === "state-results" ? "block" : "flex";
      // Allow display change to register before styling transition
      setTimeout(() => {
        newState.classList.add("active");
      }, 50);
    }, 200);
  }

  // --- Progress Stepper Animation ---
  const stepIds = ["step-planner", "step-quiz", "step-revision", "step-motivation"];
  let stepperInterval = null;

  function runStepperAnimation() {
    // Reset all steps to pending
    stepIds.forEach(id => {
      const el = document.getElementById(id);
      el.className = "progress-step pending";
      el.querySelector(".step-status").className = "fa-regular fa-circle step-status";
    });

    let currentStepIndex = 0;
    
    // Set first step active
    activateStep(currentStepIndex);

    stepperInterval = setInterval(() => {
      // Complete current step
      completeStep(currentStepIndex);
      
      currentStepIndex++;
      if (currentStepIndex < stepIds.length) {
        activateStep(currentStepIndex);
      } else {
        clearInterval(stepperInterval);
      }
    }, 2500); // Transitions every 2.5s for realistic simulation
  }

  function activateStep(index) {
    const id = stepIds[index];
    const el = document.getElementById(id);
    if (el) {
      el.className = "progress-step active";
      el.querySelector(".step-status").className = "fa-solid fa-circle-notch fa-spin step-status";
    }
  }

  function completeStep(index) {
    const id = stepIds[index];
    const el = document.getElementById(id);
    if (el) {
      el.className = "progress-step complete";
      el.querySelector(".step-status").className = "fa-solid fa-circle-check step-status";
    }
  }

  function fastForwardStepper() {
    clearInterval(stepperInterval);
    stepIds.forEach((id, idx) => {
      const el = document.getElementById(id);
      el.className = "progress-step complete";
      el.querySelector(".step-status").className = "fa-solid fa-circle-check step-status";
    });
  }

  // --- Form Submission Handler (Triggers Agents) ---
  studyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = inputSubject.value.trim();
    const topic = inputTopic.value.trim();
    const examDate = inputExamDate.value;
    const dailyHours = inputDailyHours.value;

    changeState(stateLoading);
    runStepperAnimation();

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, examDate, dailyHours })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate materials. Please check your config.");
      }

      generatedData = result.data;
      fastForwardStepper();

      // Small delay for clean transition
      setTimeout(() => {
        populateDashboard(generatedData, subject, examDate, dailyHours);
        changeState(stateResults);
      }, 800);

    } catch (err) {
      clearInterval(stepperInterval);
      errorMessageText.textContent = err.message || "An unexpected connection error occurred.";
      changeState(stateError);
    }
  });

  buttonRetry.addEventListener("click", () => {
    changeState(stateWelcome);
  });

  // --- Populate Dashboard Contents ---
  function populateDashboard(data, subject, examDate, dailyHours) {
    // 1. Planner Panel
    plannerBadgeSubject.textContent = subject;
    plannerTitle.textContent = data.planner.title || `Study Plan: ${inputTopic.value}`;
    plannerSummaryHours.textContent = `${dailyHours} ${dailyHours == 1 ? 'hour' : 'hours'} / day`;
    plannerSummary.textContent = data.planner.summary || "";
    
    // Clear and build Planner schedule
    plannerScheduleContainer.innerHTML = "";
    if (data.planner.schedule && Array.isArray(data.planner.schedule)) {
      data.planner.schedule.forEach(day => {
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";
        
        // Calculate date string if needed
        const dateStr = day.date ? day.date : `Day ${day.day}`;
        
        let tasksHtml = "";
        if (day.tasks && Array.isArray(day.tasks)) {
          day.tasks.forEach(task => {
            // Map types to CSS classes
            let typeClass = "type-core-study";
            if (task.type) {
              const formattedType = task.type.toLowerCase().replace(" ", "-");
              if (formattedType.includes("recall")) typeClass = "type-active-recall";
              else if (formattedType.includes("question") || formattedType.includes("quiz") || formattedType.includes("practice")) typeClass = "type-practice-questions";
              else if (formattedType.includes("review")) typeClass = "type-review";
              else if (formattedType.includes("break") || formattedType.includes("rest")) typeClass = "type-rest-break";
            }
            
            tasksHtml += `
              <div class="task-item">
                <div class="task-time-meta">
                  <span class="task-time"><i class="fa-regular fa-clock"></i> ${task.timeSlot || task.time || 'Session'}</span>
                  <span class="task-type-badge ${typeClass}">${task.type || 'Study'}</span>
                </div>
                <div class="task-desc">${task.activity}</div>
              </div>
            `;
          });
        }

        dayCard.innerHTML = `
          <div class="day-card-header">
            <h4>Day ${day.day}</h4>
            <span class="date-label">${dateStr}</span>
          </div>
          <p class="day-focus"><i class="fa-solid fa-bullseye"></i> ${day.focus || 'Focus Study'}</p>
          <div class="tasks-list">
            ${tasksHtml}
          </div>
        `;
        plannerScheduleContainer.appendChild(dayCard);
      });
    }

    // 2. Revision Panel
    revisionBadgeSubject.textContent = subject;
    revisionTitle.textContent = data.revision.revisionTitle || "Spaced Repetition Milestones";
    
    // Format exam date nicely
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateObj = new Date(examDate);
    const formattedExamDate = isNaN(dateObj.getTime()) ? examDate : dateObj.toLocaleDateString(undefined, options);
    revisionCountdownText.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Exam: ${formattedExamDate}`;

    revisionMilestonesContainer.innerHTML = "";
    if (data.revision.milestones && Array.isArray(data.revision.milestones)) {
      data.revision.milestones.forEach(milestone => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        
        let tasksListHtml = "";
        if (milestone.tasks && Array.isArray(milestone.tasks)) {
          milestone.tasks.forEach(t => {
            tasksListHtml += `<li>${t}</li>`;
          });
        }

        let priorityColor = "var(--success)";
        if (milestone.priority) {
          if (milestone.priority.toLowerCase() === "critical") priorityColor = "var(--danger)";
          else if (milestone.priority.toLowerCase() === "high") priorityColor = "var(--warning)";
        }

        item.innerHTML = `
          <div class="timeline-dot" style="background-color: ${priorityColor}; box-shadow: 0 0 8px ${priorityColor}80;"></div>
          <div class="timeline-card">
            <div class="timeline-header">
              <span class="timeline-timeframe">${milestone.timeFrame || milestone.timePeriod}</span>
              <span class="timeline-strategy">${milestone.strategy || 'Strategy'}</span>
            </div>
            <h4>${milestone.phaseName || milestone.focus || 'Revision Phase'}</h4>
            <div class="timeline-tasks-title">Milestone Goals:</div>
            <ul class="timeline-tasks">
              ${tasksListHtml}
            </ul>
          </div>
        `;
        revisionMilestonesContainer.appendChild(item);
      });
    }

    // Exam day preparations
    if (data.revision.examDayPrep) {
      revisionNightBefore.textContent = data.revision.examDayPrep.nightBefore || "";
      revisionMorningOf.textContent = data.revision.examDayPrep.morningOf || "";
    }

    // 3. Motivation Panel
    motivationBadgeSubject.textContent = subject;
    motivationPepTalk.textContent = data.motivation.pepTalk || "";
    if (data.motivation.mindsetQuote) {
      motivationQuoteText.textContent = data.motivation.mindsetQuote.quote || "";
      motivationQuoteAuthor.textContent = `— ${data.motivation.mindsetQuote.author || 'Unknown'}`;
    }

    motivationTipsContainer.innerHTML = "";
    if (data.motivation.subjectTips && Array.isArray(data.motivation.subjectTips)) {
      data.motivation.subjectTips.forEach(tip => {
        const tipCard = document.createElement("div");
        tipCard.className = "tip-card";
        tipCard.innerHTML = `
          <h4>${tip.tip || tip.title}</h4>
          <p>${tip.description}</p>
        `;
        motivationTipsContainer.appendChild(tipCard);
      });
    }

    // 4. Initialize Practice Quiz
    quizBadgeSubject.textContent = subject;
    quizTitle.textContent = data.quiz.quizTitle || "Interactive Mastery Quiz";
    if (data.quiz.questions && Array.isArray(data.quiz.questions)) {
      quizState.questions = data.quiz.questions;
      startQuiz();
    }
  }

  // --- Interactive Quiz Controller ---
  function startQuiz() {
    quizState.currentIndex = 0;
    quizState.score = 0;
    quizActiveWindow.style.display = "block";
    quizResultsWindow.style.display = "none";
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    quizState.answered = false;
    buttonNextQuestion.style.display = "none";
    quizExplanationContainer.style.display = "none";
    
    const currentQuestion = quizState.questions[quizState.currentIndex];
    
    // Progress
    const progressPercent = ((quizState.currentIndex + 1) / quizState.questions.length) * 100;
    quizProgressFill.style.width = `${progressPercent}%`;
    quizProgressText.textContent = `Question ${quizState.currentIndex + 1} of ${quizState.questions.length}`;

    // Question
    quizQuestionText.textContent = currentQuestion.question;

    // Options
    quizOptionsContainer.innerHTML = "";
    const options = currentQuestion.options || {};
    
    Object.keys(options).forEach(key => {
      const optionBtn = document.createElement("button");
      optionBtn.className = "option-btn";
      optionBtn.innerHTML = `
        <span class="option-badge">${key}</span>
        <span class="option-label">${options[key]}</span>
      `;
      
      optionBtn.addEventListener("click", () => handleQuizOptionClick(key, optionBtn));
      quizOptionsContainer.appendChild(optionBtn);
    });
  }

  function handleQuizOptionClick(selectedKey, selectedBtn) {
    if (quizState.answered) return;
    quizState.answered = true;

    const currentQuestion = quizState.questions[quizState.currentIndex];
    const correctKey = currentQuestion.correctOption;

    const optionButtons = quizOptionsContainer.querySelectorAll(".option-btn");
    
    // Disable all options
    optionButtons.forEach(btn => btn.disabled = true);

    if (selectedKey === correctKey) {
      selectedBtn.classList.add("correct");
      quizState.score++;
    } else {
      selectedBtn.classList.add("incorrect");
      // Find and highlight correct answer
      optionButtons.forEach(btn => {
        const badgeText = btn.querySelector(".option-badge").textContent;
        if (badgeText === correctKey) {
          btn.classList.add("correct-reveal");
        }
      });
    }

    // Populate and show explanation
    quizExplanationText.textContent = currentQuestion.explanation || "No explanation provided.";
    quizExplanationContainer.style.display = "block";

    // Show Next button
    buttonNextQuestion.style.display = "inline-flex";
  }

  buttonNextQuestion.addEventListener("click", () => {
    quizState.currentIndex++;
    if (quizState.currentIndex < quizState.questions.length) {
      renderQuizQuestion();
    } else {
      showQuizResults();
    }
  });

  function showQuizResults() {
    quizActiveWindow.style.display = "none";
    quizResultsWindow.style.display = "flex";
    
    const finalScoreStr = `${quizState.score}/${quizState.questions.length}`;
    quizFinalScore.textContent = finalScoreStr;

    // Feedbacks based on score
    const ratio = quizState.score / quizState.questions.length;
    let feedback = "";
    if (ratio === 1) {
      feedback = "Perfect Score! You have fully mastered this topic! Awesome work.";
    } else if (ratio >= 0.7) {
      feedback = "Great job! You have a solid grasp. Review the explanations for any missed concepts.";
    } else if (ratio >= 0.4) {
      feedback = "Good attempt. Spaced repetition and active study on these specific concepts will help solidify your score.";
    } else {
      feedback = "Keep studying. Focus on active recall using the suggested study plan, then try the quiz again!";
    }
    quizPerformanceFeedback.textContent = feedback;
  }

  buttonRestartQuiz.addEventListener("click", () => {
    startQuiz();
  });

  // --- Quick Motivational Booster Widget ---
  buttonQuickBoost.addEventListener("click", async () => {
    buttonQuickBoost.disabled = true;
    boostSpinner.style.display = "inline-block";

    try {
      const response = await fetch("/api/motivation-boost");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to get motivation boost.");
      }

      const boost = result.data;

      // Animate fade out and in
      boostBox.style.opacity = 0;
      setTimeout(() => {
        boostBox.querySelector(".quote-text").textContent = `"${boost.quote}"`;
        boostBox.querySelector(".quote-author").textContent = `— ${boost.author}`;
        boostBox.querySelector("#boost-micro-tip").innerHTML = `<strong>Coach Tip:</strong> ${boost.microTip}`;
        boostBox.style.opacity = 1;
      }, 250);

    } catch (error) {
      console.error(error);
      // Fallback local boosts
      const fallbacks = [
        { q: "Believe you can and you're halfway there.", a: "Theodore Roosevelt", t: "Take a 5-minute deep breathing break now." },
        { q: "It always seems impossible until it's done.", a: "Nelson Mandela", t: "Solve one medium-level problem right now." },
        { q: "Quality is not an act, it is a habit.", a: "Aristotle", t: "Clear your desk space from clutter to help focus." }
      ];
      const r = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      
      boostBox.style.opacity = 0;
      setTimeout(() => {
        boostBox.querySelector(".quote-text").textContent = `"${r.q}"`;
        boostBox.querySelector(".quote-author").textContent = `— ${r.a}`;
        boostBox.querySelector("#boost-micro-tip").innerHTML = `<strong>Coach Tip:</strong> ${r.t}`;
        boostBox.style.opacity = 1;
      }, 250);
    } finally {
      buttonQuickBoost.disabled = false;
      boostSpinner.style.display = "none";
    }
  });
});
