// Enhanced Mental Health Prediction Script
class MentalHealthPredictor {
  constructor() {
    this.form = document.getElementById("predictForm");
    this.loadingOverlay = document.getElementById("loadingOverlay");
    this.resultsSection = document.getElementById("results");
    this.resultContent = document.getElementById("resultContent");
    this.submitButton = document.getElementById("submitButton");
    this.currentStep = 1;
    this.totalSteps = 4;

    this.init();
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupFormNavigation();
    this.addFormAnimations();
    this.addScrollEffects();
  }

  setupFormNavigation() {
    const nextButton = document.getElementById("nextButton");
    const prevButton = document.getElementById("prevButton");

    nextButton.addEventListener("click", () => this.nextStep());
    prevButton.addEventListener("click", () => this.prevStep());

    this.updateFormDisplay();
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateFormDisplay();
        this.updateProgressIndicator();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateFormDisplay();
      this.updateProgressIndicator();
    }
  }

  updateFormDisplay() {
    // Hide all steps
    document.querySelectorAll(".form-step").forEach((step) => {
      step.classList.remove("active");
    });

    // Show current step
    document.getElementById(`step-${this.currentStep}`).classList.add("active");

    // Update navigation buttons
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const submitButton = document.getElementById("submitButton");

    prevButton.style.display = this.currentStep === 1 ? "none" : "flex";
    nextButton.style.display =
      this.currentStep === this.totalSteps ? "none" : "flex";
    submitButton.style.display =
      this.currentStep === this.totalSteps ? "flex" : "none";
  }

  updateProgressIndicator() {
    document.querySelectorAll(".progress-step").forEach((step, index) => {
      step.classList.remove("active", "completed");

      if (index + 1 === this.currentStep) {
        step.classList.add("active");
      } else if (index + 1 < this.currentStep) {
        step.classList.add("completed");
      }
    });
  }

  validateCurrentStep() {
    const currentStepElement = document.getElementById(
      `step-${this.currentStep}`
    );
    const requiredFields = currentStepElement.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ff4444";
        field.style.boxShadow = "0 0 0 3px rgba(255, 68, 68, 0.1)";
        isValid = false;

        // Add shake animation
        field.style.animation = "shake 0.5s ease-in-out";
        setTimeout(() => {
          field.style.animation = "";
        }, 500);
      } else {
        field.style.borderColor = "";
        field.style.boxShadow = "";
      }
    });

    if (!isValid) {
      this.showError("Please fill in all required fields before proceeding.");
    }

    return isValid;
  }

  addFormAnimations() {
    // Animate form sections on scroll
    const formSections = document.querySelectorAll(".form-section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animation = "fadeInUp 0.6s ease-out forwards";
          }
        });
      },
      { threshold: 0.1 }
    );

    formSections.forEach((section) => {
      observer.observe(section);
    });

    // Add focus animations to form inputs
    const inputs = document.querySelectorAll("input, select");
    inputs.forEach((input) => {
      input.addEventListener("focus", (e) => {
        e.target.parentElement.style.transform = "scale(1.02)";
        e.target.parentElement.style.transition = "transform 0.2s ease";
      });

      input.addEventListener("blur", (e) => {
        e.target.parentElement.style.transform = "scale(1)";
      });
    });
  }

  addScrollEffects() {
    // Parallax effect for floating elements
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      document.querySelectorAll(".floating-element").forEach((el, index) => {
        const speed = 0.2 + index * 0.1;
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showError("Please fill in all required fields.");
      return;
    }

    this.showLoading();

    try {
      const formData = new FormData(this.form);
      let data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });

      // Add progress animation
      this.animateProgress();

      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log(result)

      // Wait for animation to complete
      await this.delay(2000);

      this.hideLoading();
      this.displayResults(result, data);
    } catch (error) {
      console.error("Error:", error);
      this.hideLoading();
      this.showError(
        "An error occurred while processing your request. Please try again."
      );
    }
  }

  validateForm() {
    const requiredFields = this.form.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ff4444";
        field.style.boxShadow = "0 0 0 3px rgba(255, 68, 68, 0.1)";
        isValid = false;
      } else {
        field.style.borderColor = "";
        field.style.boxShadow = "";
      }
    });

    return isValid;
  }

  showLoading() {
    this.submitButton.classList.add("loading");
    this.loadingOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  hideLoading() {
    this.submitButton.classList.remove("loading");
    this.loadingOverlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  animateProgress() {
    const progressFill = document.querySelector(".progress-fill");
    progressFill.style.animation = "none";
    progressFill.offsetHeight; // Trigger reflow
    progressFill.style.animation = "progressFill 3s ease-in-out infinite";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  showError(message) {
    // Create and show error notification
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-notification";
    errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4444, #cc0000);
            color: white;
            padding: 1rem;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideInRight 0.3s ease-out;
        `;

    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.remove();
      }
    }, 5000);
  }

  getStressLevel(stressLevelText) {
    const stressMap = {
      "No Stress": { level: 0, color: "stress-no", width: "5%" },
      "Mild Stress": { level: 1, color: "stress-mild", width: "60%" },
      "High Stress": { level: 2, color: "stress-high", width: "100%" },
    };
    return (
      stressMap[stressLevelText]
    );
  }

  animateStressMeter(stressInfo) {
    const stressFill = document.querySelector(".stress-fill");
    if (!stressFill) return;

    // Start from 0%
    stressFill.style.width = "0%";
    stressFill.style.transition = "width 2s ease-in-out"; // smooth animation

    // Animate to the locked width
    setTimeout(() => {
      stressFill.style.width = stressInfo.width; // locked width
    }, 100);
  }

  getTreatmentRecommendations(stressLevel, userAge, hasFamily) {
    const recommendations = {
      0: {
        professional: "Regular wellness check-ups recommended",
        therapy: "Preventive counseling available",
        lifestyle: "Maintain current healthy practices",
        medication: "No medication needed",
      },
      1: {
        professional: "Consider counseling sessions",
        therapy: "Cognitive Behavioral Therapy (CBT) recommended",
        lifestyle: "Stress management techniques",
        medication: "Consult doctor if symptoms persist",
      },
      2: {
        professional: "Professional evaluation recommended",
        therapy: "Intensive therapy and support groups",
        lifestyle: "Immediate stress reduction measures",
        medication: "Medical consultation strongly advised",
      },
    };

    return recommendations[stressLevel] || recommendations[0];
  }

  displayResults(result, userData) {
    const stressInfo = this.getStressLevel(result["Stress Level"]);

    // Animate stress meter
    this.animateStressMeter(stressInfo);
    const treatmentRec = this.getTreatmentRecommendations(
      stressInfo.level,
      userData.age,
      userData.family_history === "yes"
    );

    console.log(result["Treatment"]);

    // Create comprehensive results HTML
    const resultsHTML = `
            <div class="result-card">
                <h3>
                    <i class="fas fa-chart-line"></i>
                    Stress Level Assessment
                </h3>
                <div class="stress-indicator">
                    <div class="stress-level ${stressInfo.color}">
                        ${result["Stress Level"]}
                    </div>
                    <div class="stress-meter">
                        <div class="stress-fill ${
                          stressInfo.color
                        }" style="width: ${stressInfo.width}"></div>
                    </div>
                </div>
                <p class="result-description">
                    Based on your responses, our AI analysis indicates <strong>${result[
                      "Stress Level"
                    ].toLowerCase()}</strong> 
                    in your current mental health state.
                </p>
            </div>

            <div class="result-card">
                <h3>
                    <i class="fas fa-medical-bag"></i>
                    Treatment Recommendation
                </h3>
                <div class="treatment-status">
                    <span class="treatment-badge ${
                      result["Treatment"] === "Structured Therapeutic Plan Needed"
                        ? "urgent"
                        : result["Treatment"] === "Preventive Measures Required"
                        ? "moderate"
                        : "good"
                    }">
                        ${result["Treatment"]}
                    </span>
                </div>
                <div class="treatment-info">
                    <div class="treatment-card">
                        <h4><i class="fas fa-user-md"></i> Professional Support</h4>
                        <p>${treatmentRec.professional}</p>
                    </div>
                    <div class="treatment-card">
                        <h4><i class="fas fa-comments"></i> Therapy Options</h4>
                        <p>${treatmentRec.therapy}</p>
                    </div>
                    <div class="treatment-card">
                        <h4><i class="fas fa-heart"></i> Lifestyle Changes</h4>
                        <p>${treatmentRec.lifestyle}</p>
                    </div>
                    <div class="treatment-card">
                        <h4><i class="fas fa-pills"></i> Medical Consultation</h4>
                        <p>${treatmentRec.medication}</p>
                    </div>
                </div>
            </div>

            <div class="result-card">
                <h3>
                    <i class="fas fa-lightbulb"></i>
                    Personalized Suggestions
                </h3>
                <ul class="suggestion-list">
                    ${result["Suggestions"]
                      .map((suggestion) => `<li>${suggestion}</li>`)
                      .join("")}
                </ul>
            </div>

            <div class="result-card">
                <h3>
                    <i class="fas fa-star"></i>
                    Extra Wellness Tips
                </h3>
                <ul class="tips-list">
                    ${result["Extra Tips"]
                      .map((tip) => `<li>${tip}</li>`)
                      .join("")}
                </ul>
            </div>

            <div class="result-card">
                <h3>
                    <i class="fas fa-phone"></i>
                    Emergency Resources
                </h3>
                <div class="emergency-resources">
                    <div class="resource-item">
                        <strong>Crisis Hotline:</strong> 988 (Suicide & Crisis Lifeline)
                    </div>
                    <div class="resource-item">
                        <strong>Text Support:</strong> Text HOME to 741741
                    </div>
                    <div class="resource-item">
                        <strong>Emergency:</strong> Call 911 for immediate help
                    </div>
                </div>
            </div>

            <div class="result-card">
                <h3>
                    <i class="fas fa-calendar-check"></i>
                    Next Steps
                </h3>
                <div class="next-steps">
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <strong>Save your results</strong> - Download or print this report for your records
                        </div>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <strong>Share with healthcare provider</strong> - Discuss these findings with a mental health professional
                        </div>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <strong>Follow recommendations</strong> - Implement the suggested lifestyle changes and seek appropriate support
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Add additional CSS for new elements
    this.addResultsCSS();

    this.resultContent.innerHTML = resultsHTML;
    this.resultsSection.classList.add("show");

    // Smooth scroll to results
    this.resultsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Animate result cards
    this.animateResultCards();

    // Store results for sharing/downloading
    this.currentResults = {
      result,
      userData,
      timestamp: new Date().toISOString(),
    };
  }

  addResultsCSS() {
    if (document.getElementById("results-additional-css")) return;

    const style = document.createElement("style");
    style.id = "results-additional-css";
    style.textContent = `
            .treatment-badge {
                display: inline-block;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-weight: 600;
                font-size: 1.1rem;
                margin-bottom: 1rem;
            }

            .treatment-badge.good {
                background: linear-gradient(135deg, #00c851, #00e676);
                color: white;
            }

            .treatment-badge.moderate {
                background: linear-gradient(135deg, #ffbb33, #ff9500);
                color: white;
            }

            .treatment-badge.urgent {
                background: linear-gradient(135deg, #ff4444, #cc0000);
                color: white;
            }

            .emergency-resources {
                display: grid;
                gap: 1rem;
            }

            .resource-item {
                background: rgba(255, 68, 68, 0.1);
                border: 1px solid rgba(255, 68, 68, 0.3);
                border-radius: 10px;
                padding: 1rem;
                color: #ff6b6b;
            }

            .next-steps {
                display: grid;
                gap: 1rem;
            }

            .step-item {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 1rem;
            }

            .step-number {
                background: var(--primary-gradient);
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
            }

            .step-content {
                flex: 1;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(style);
  }

  animateResultCards() {
    const cards = document.querySelectorAll(".result-card");
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.2}s`;
      card.style.animation = "fadeInUp 0.6s ease-out forwards";
    });
  }
}

// Download Results Functionality
// Make sure jsPDF is included in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

async function downloadResults() {
  if (!window.predictor?.currentResults) {
    alert("No results to download. Please complete the assessment first.");
    return;
  }

  const { result, userData, timestamp } = window.predictor.currentResults;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20; // vertical start position

  doc.setFontSize(18);
  doc.text("MENTAL HEALTH ASSESSMENT REPORT", 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date(timestamp).toLocaleString()}`, 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("=== ASSESSMENT RESULTS ===", 14, y);
  y += 8;

  doc.setFontSize(12);
  doc.text(`Stress Level: ${result["Stress Level"]}`, 14, y);
  y += 7;
  doc.text(`Treatment Recommendation: ${result["Treatment"]}`, 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("=== PERSONALIZED SUGGESTIONS ===", 14, y);
  y += 8;

  doc.setFontSize(12);
  result["Suggestions"].forEach((s, i) => {
    if (y > 270) { doc.addPage(); y = 20; } // handle page overflow
    doc.text(`${i + 1}. ${s}`, 14, y);
    y += 6;
  });
  y += 4;

  doc.setFontSize(14);
  doc.text("=== WELLNESS TIPS ===", 14, y);
  y += 8;
  doc.setFontSize(12);
  result["Extra Tips"].forEach((t, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${t}`, 14, y);
    y += 6;
  });
  y += 6;

  doc.setFontSize(14);
  doc.text("=== EMERGENCY RESOURCES ===", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text("- Crisis Hotline: 988 (Suicide & Crisis Lifeline)", 14, y);
  y += 6;
  doc.text("- Text Support: Text HOME to 741741", 14, y);
  y += 6;
  doc.text("- Emergency: Call 911 for immediate help", 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.text("=== ASSESSMENT DATA ===", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`Age: ${userData.age}`, 14, y); y += 6;
  doc.text(`Gender: ${userData.gender}`, 14, y); y += 6;
  doc.text(`Work Environment: ${userData.work_interfere}`, 14, y); y += 6;
  doc.text(`Family History: ${userData.family_history}`, 14, y); y += 6;
  doc.text(`Remote Work: ${userData.remote_work}`, 14, y); y += 10;

  doc.setFontSize(10);
  doc.text("=== DISCLAIMER ===", 14, y); y += 6;
  doc.text("This assessment is for informational purposes only and does not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.", 14, y, { maxWidth: 180 });
  y += 15;

  doc.save(`mental-health-report-${new Date(timestamp).toISOString().split("T")[0]}.pdf`);

  showNotification("PDF report downloaded successfully!", "success");
}


// Share Results Functionality
function shareResults() {
  if (!window.predictor?.currentResults) {
    alert("No results to share. Please complete the assessment first.");
    return;
  }

  const { result } = window.predictor.currentResults;

  const shareText = `I just completed a mental health assessment. My stress level is: ${result["Stress Level"]} with ${result["Treatment"]} treatment recommendation. 

Take your own assessment at: ${window.location.href}

#MentalHealth #Wellness #SelfCare`;

  if (navigator.share) {
    navigator
      .share({
        title: "Mental Health Assessment Results",
        text: shareText,
        url: window.location.href,
      })
      .catch(console.error);
  } else {
    // Fallback - copy to clipboard
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        showNotification("Results copied to clipboard!", "success");
      })
      .catch(() => {
        // Final fallback - show share modal
        showShareModal(shareText);
      });
  }
}

// Print Results Functionality
function printResults() {
  if (!window.predictor?.currentResults) {
    alert("No results to print. Please complete the assessment first.");
    return;
  }

  window.print();
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  const colors = {
    success: "linear-gradient(135deg, #00c851, #00e676)",
    error: "linear-gradient(135deg, #ff4444, #cc0000)",
    info: "linear-gradient(135deg, #667eea, #764ba2)",
  };

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;

  notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${
              type === "success"
                ? "check-circle"
                : type === "error"
                ? "exclamation-triangle"
                : "info-circle"
            }"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; margin-left: auto; cursor: pointer;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Share Modal for fallback
function showShareModal(text) {
  const modal = document.createElement("div");
  modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  modal.innerHTML = `
        <div style="background: var(--glass-bg); backdrop-filter: var(--blur); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; max-width: 500px; width: 90%;">
            <h3 style="margin-bottom: 1rem; color: white;">Share Your Results</h3>
            <textarea readonly style="width: 100%; height: 150px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; padding: 1rem; color: white; resize: none;">${text}</textarea>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: flex-end;">
                <button onclick="navigator.clipboard.writeText('${text.replace(
                  /'/g,
                  "\\'"
                )}'); showNotification('Copied to clipboard!', 'success'); this.closest('[style*=\"position: fixed\"]').remove();" style="background: var(--primary-gradient); border: none; padding: 0.5rem 1rem; border-radius: 8px; color: white; cursor: pointer;">Copy Text</button>
                <button onclick="this.closest('[style*=\"position: fixed\"]').remove();" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.5rem 1rem; border-radius: 8px; color: white; cursor: pointer;">Close</button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);
}

// Smooth scroll to assessment
function scrollToAssessment() {
  document.getElementById("assessment").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.predictor = new MentalHealthPredictor();

  // Add some additional interactive effects
  addInteractiveEffects();
});

function addInteractiveEffects() {
  // Add hover effects to form sections
  const formSections = document.querySelectorAll(".form-section");
  formSections.forEach((section) => {
    section.addEventListener("mouseenter", () => {
      section.style.transform = "translateY(-2px)";
      section.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.15)";
    });

    section.addEventListener("mouseleave", () => {
      section.style.transform = "translateY(0)";
      section.style.boxShadow = "";
    });
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.addEventListener("click", createRipple);
  });
}

function createRipple(event) {
  const button = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
  circle.classList.add("ripple");

  const rippleCSS = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;

  if (!document.getElementById("ripple-css")) {
    const style = document.createElement("style");
    style.id = "ripple-css";
    style.textContent = rippleCSS;
    document.head.appendChild(style);
  }

  const existingRipple = button.querySelector(".ripple");
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(circle);
}
