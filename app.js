// ============================================================
// THE BREAKFAST INDEX — Interactive App Logic
// Scroll animations, Chart.js charts, counter effects, simulator
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initProgressBar();
    initScrollReveal();
    initNavDots();
    initCountUp();
    initCharts();
    initComponentCards();
    initSimulator();
});

// ========================= TAB NAVIGATION =========================

function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const storyTab = document.getElementById("storyTab");
    const notebookTab = document.getElementById("notebookTab");
    const navDots = document.getElementById("navDots");

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.dataset.tab;
            if (tab === "story") {
                storyTab.classList.add("active");
                notebookTab.classList.remove("active");
                if (navDots) navDots.style.display = "";
            } else {
                storyTab.classList.remove("active");
                notebookTab.classList.add("active");
                if (navDots) navDots.style.display = "none";
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });
}

// ========================= PROGRESS BAR =========================

function initProgressBar() {
    const bar = document.getElementById("progressBar");
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + "%";
    }, { passive: true });
}

// ========================= SCROLL REVEAL =========================

function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px",
    });

    reveals.forEach((el) => observer.observe(el));
}

// ========================= NAV DOTS =========================

function initNavDots() {
    const dots = document.querySelectorAll(".nav-dot");
    const sections = document.querySelectorAll(".section");

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const idx = parseInt(dot.dataset.section);
            sections[idx].scrollIntoView({ behavior: "smooth" });
        });
    });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const idx = id.replace("sec-", "");
                dots.forEach((d) => d.classList.remove("active"));
                const activeDot = document.querySelector(`[data-section="${idx}"]`);
                if (activeDot) activeDot.classList.add("active");
            }
        });
    }, { threshold: 0.4 });

    sections.forEach((sec) => sectionObserver.observe(sec));
}

// ========================= COUNT-UP ANIMATION =========================

function initCountUp() {
    const metrics = document.querySelectorAll(".metric-value[data-count]");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.dataset.animated) return;
                el.dataset.animated = "true";

                const target = parseFloat(el.dataset.count);
                const isDecimal = el.dataset.decimal === "true";
                const unit = el.querySelector(".unit");
                const unitText = unit ? unit.textContent : "";
                const duration = 1500;
                const startTime = performance.now();

                function update(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = target * eased;

                    if (isDecimal) {
                        el.textContent = current.toFixed(2);
                    } else {
                        el.innerHTML = Math.round(current) + (unitText ? `<span class="unit">${unitText}</span>` : "");
                    }

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    metrics.forEach((m) => observer.observe(m));
}

// ========================= CHART.JS CONFIG =========================

const CHART_DEFAULTS = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 1200,
        easing: "easeOutQuart",
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            titleFont: { family: "'Space Mono', monospace", size: 11 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            padding: 12,
            cornerRadius: 8,
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            displayColors: true,
            boxPadding: 4,
        },
    },
    scales: {
        x: {
            ticks: {
                color: "rgba(255,255,255,0.4)",
                font: { family: "'Space Mono', monospace", size: 10 },
                maxTicksLimit: 8,
            },
            grid: {
                color: "rgba(255,255,255,0.04)",
                drawBorder: false,
            },
        },
        y: {
            ticks: {
                color: "rgba(255,255,255,0.4)",
                font: { family: "'Space Mono', monospace", size: 10 },
            },
            grid: {
                color: "rgba(255,255,255,0.04)",
                drawBorder: false,
            },
        },
    },
};

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getMonth()] + " " + d.getFullYear();
}

// ========================= CHARTS =========================

let chartsInitialized = false;

function initCharts() {
    const chartSection = document.getElementById("sec-2");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !chartsInitialized) {
                chartsInitialized = true;
                createTrendChart();
                createLagChart();
                createComponentChart();
                createSparklines();
                observer.unobserve(chartSection);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(chartSection);
}

// ---- Trend Chart ----
function createTrendChart() {
    const ctx = document.getElementById("trendChart").getContext("2d");
    const labels = DATES.map(formatDate);

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Breakfast Index",
                    data: BREAKFAST_NORM,
                    borderColor: "#f71414",
                    backgroundColor: "rgba(215, 25, 33, 0.08)",
                    borderWidth: 2.5,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#f71414",
                    tension: 0.3,
                },
                {
                    label: "CPI",
                    data: CPI_NORM,
                    borderColor: "rgba(255, 255, 255, 0.55)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#ffffff",
                    tension: 0.3,
                    borderDash: [6, 3],
                },
            ],
        },
        options: {
            ...CHART_DEFAULTS,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                ...CHART_DEFAULTS.plugins,
                tooltip: {
                    ...CHART_DEFAULTS.plugins.tooltip,
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) =>
                            ` ${item.dataset.label}: ${item.parsed.y.toFixed(2)} σ`,
                    },
                },
            },
        },
    });
}

// ---- Lag Chart ----
function createLagChart() {
    const ctx = document.getElementById("lagChart").getContext("2d");
    const labels = LAG_CORRELATIONS.map((d) => d.lag + " mo");
    const values = LAG_CORRELATIONS.map((d) => d.correlation);
    const peakIdx = values.indexOf(Math.max(...values));

    const pointColors = values.map((_, i) =>
        i === peakIdx ? "#D71921" : "rgba(255,255,255,0.3)"
    );
    const pointSizes = values.map((_, i) => (i === peakIdx ? 8 : 4));

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Correlation",
                    data: values,
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    borderWidth: 2,
                    fill: {
                        target: "origin",
                        above: "rgba(215, 25, 33, 0.06)",
                    },
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointColors,
                    pointRadius: pointSizes,
                    pointHoverRadius: 8,
                    tension: 0.3,
                },
            ],
        },
        options: {
            ...CHART_DEFAULTS,
            plugins: {
                ...CHART_DEFAULTS.plugins,
                tooltip: {
                    ...CHART_DEFAULTS.plugins.tooltip,
                    callbacks: {
                        title: (items) => `Lag: ${items[0].label}`,
                        label: (item) => ` r = ${item.parsed.y.toFixed(4)}`,
                    },
                },
            },
            scales: {
                ...CHART_DEFAULTS.scales,
                y: {
                    ...CHART_DEFAULTS.scales.y,
                    min: 0.7,
                    max: 1.0,
                },
            },
        },
    });
}

// ---- Component Overlay Chart ----
function createComponentChart() {
    const ctx = document.getElementById("componentChart").getContext("2d");
    const labels = DATES.map(formatDate);

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Eggs",
                    data: EGGS_NORM,
                    borderColor: "#FF6B35",
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    tension: 0.3,
                },
                {
                    label: "Bread",
                    data: BREAD_NORM,
                    borderColor: "#FFD166",
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    tension: 0.3,
                },
                {
                    label: "CPI",
                    data: CPI_NORM,
                    borderColor: "rgba(255, 255, 255, 0.45)",
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    tension: 0.3,
                    borderDash: [5, 3],
                },
            ],
        },
        options: {
            ...CHART_DEFAULTS,
            interaction: { mode: "index", intersect: false },
        },
    });
}

// ---- Sparklines ----
function createSparklines() {
    createSparkline("eggsSparkline", EGGS_RAW, "#FF6B35");
    createSparkline("breadSparkline", BREAD_RAW, "#FFD166");
}

function createSparkline(canvasId, data, color) {
    const ctx = document.getElementById(canvasId).getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: DATES,
            datasets: [
                {
                    data,
                    borderColor: color,
                    borderWidth: 2,
                    fill: {
                        target: "origin",
                        above: color.replace(")", ", 0.08)").replace("rgb", "rgba").replace("#", ""),
                    },
                    backgroundColor: hexToRgba(color, 0.06),
                    pointRadius: 0,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 800 },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false },
            },
        },
    });
}

function hexToRgba(hex, alpha) {
    if (hex.startsWith("#")) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
}

// ========================= COMPONENT CARD VALUES =========================

function initComponentCards() {
    const lastEggs = EGGS_RAW[EGGS_RAW.length - 1];
    const lastBread = BREAD_RAW[BREAD_RAW.length - 1];
    const prevEggs = EGGS_RAW[EGGS_RAW.length - 2];
    const prevBread = BREAD_RAW[BREAD_RAW.length - 2];

    document.getElementById("eggsPrice").textContent = "$" + lastEggs.toFixed(2);
    document.getElementById("breadPrice").textContent = "$" + lastBread.toFixed(2);

    const eggsChangeVal = ((lastEggs - prevEggs) / prevEggs * 100).toFixed(1);
    const breadChangeVal = ((lastBread - prevBread) / prevBread * 100).toFixed(1);

    const eggsEl = document.getElementById("eggsChange");
    const breadEl = document.getElementById("breadChange");

    eggsEl.textContent = (eggsChangeVal >= 0 ? "+" : "") + eggsChangeVal + "%";
    eggsEl.className = "component-change " + (eggsChangeVal >= 0 ? "up" : "down");

    breadEl.textContent = (breadChangeVal >= 0 ? "+" : "") + breadChangeVal + "%";
    breadEl.className = "component-change " + (breadChangeVal >= 0 ? "up" : "down");
}

// ========================= SIMULATOR =========================

function initSimulator() {
    const slider = document.getElementById("priceSlider");
    const display = document.getElementById("sliderValueDisplay");
    const gaugeValue = document.getElementById("gaugeValue");
    const gaugeFill = document.getElementById("gaugeFill");
    const simInput = document.getElementById("simInput");
    const simOutput = document.getElementById("simOutput");

    const circumference = 2 * Math.PI * 85; // ~534
    const maxInflation = 4; // scale gauge to max 4%

    function updateSimulator(val) {
        const spike = parseInt(val);
        const inflation = spike * 0.08;

        display.textContent = spike;
        gaugeValue.textContent = inflation.toFixed(2);
        simInput.textContent = spike + "%";
        simOutput.textContent = inflation.toFixed(2) + "%";

        // Update gauge arc
        const fraction = Math.min(inflation / maxInflation, 1);
        const offset = circumference * (1 - fraction);
        gaugeFill.style.strokeDashoffset = offset;

        // Color intensity
        if (inflation > 2.5) {
            gaugeValue.style.color = "#f71414";
        } else if (inflation > 1.5) {
            gaugeValue.style.color = "#f71414";
        } else {
            gaugeValue.style.color = "#f71414";
        }
    }

    slider.addEventListener("input", (e) => updateSimulator(e.target.value));
    updateSimulator(slider.value);
}
