// ============================================================
// VISUALIZATION DATA — Synthetic but realistic data for
// heatmap, Sankey, regression, shock timeline, global, radar
// ============================================================

// ---- HEATMAP: Cross-correlation matrix ----
// Rows: food categories, Columns: lag months 0–18
const HEATMAP_DATA = {
    categories: ["Eggs", "Bread", "Milk", "Breakfast Index"],
    lags: Array.from({ length: 19 }, (_, i) => i),
    peakLag: 11,
    // Each row: correlation values across lags
    matrix: [
        // Eggs — peaks around lag 10
        [0.61, 0.65, 0.69, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.89, 0.91, 0.89, 0.86, 0.82, 0.78, 0.73, 0.68, 0.63, 0.58],
        // Bread — peaks around lag 12
        [0.52, 0.55, 0.58, 0.61, 0.64, 0.67, 0.70, 0.73, 0.76, 0.79, 0.81, 0.83, 0.85, 0.83, 0.80, 0.76, 0.72, 0.67, 0.62],
        // Milk — peaks around lag 9
        [0.58, 0.62, 0.66, 0.70, 0.74, 0.78, 0.82, 0.85, 0.87, 0.89, 0.87, 0.84, 0.80, 0.76, 0.72, 0.67, 0.62, 0.57, 0.52],
        // Breakfast Index — peaks at lag 11
        [0.65, 0.68, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.89, 0.91, 0.92, 0.93, 0.91, 0.88, 0.84, 0.79, 0.74, 0.69, 0.64],
    ],
};

// ---- SANKEY: Economic transmission nodes & flows ----
const SANKEY_DATA = {
    nodes: [
        { id: "supply", label: "Supply Shocks", x: 0, color: "#f71414" },
        { id: "feed", label: "Feed & Input Costs", x: 0, color: "#c41010" },
        { id: "food", label: "Food Prices", x: 1, color: "#f71414" },
        { id: "wages", label: "Wage Pressure", x: 2, color: "#8f0d0d" },
        { id: "expect", label: "Consumer\nExpectations", x: 2, color: "#8f0d0d" },
        { id: "services", label: "Services &\nRestaurants", x: 2, color: "#8f0d0d" },
        { id: "cpi", label: "CPI / Inflation", x: 3, color: "#f71414" },
    ],
    flows: [
        { from: "supply", to: "food", value: 45 },
        { from: "feed", to: "food", value: 35 },
        { from: "food", to: "wages", value: 25 },
        { from: "food", to: "expect", value: 30 },
        { from: "food", to: "services", value: 25 },
        { from: "wages", to: "cpi", value: 25 },
        { from: "expect", to: "cpi", value: 30 },
        { from: "services", to: "cpi", value: 25 },
    ],
};

// ---- REGRESSION: Scatter points + fitted line ----
const REGRESSION_DATA = (function () {
    const points = [];
    const slope = 0.822;
    const intercept = 0.015;
    const noise = 0.35;

    for (let i = 0; i < BREAKFAST_NORM.length - 11; i++) {
        const x = BREAKFAST_NORM[i];
        const y = CPI_NORM[i + 11];
        points.push({ x: +x.toFixed(3), y: +y.toFixed(3) });
    }

    // Fitted line endpoints
    const xMin = Math.min(...points.map(p => p.x));
    const xMax = Math.max(...points.map(p => p.x));
    const line = {
        x1: xMin, y1: slope * xMin + intercept,
        x2: xMax, y2: slope * xMax + intercept,
    };

    // Standard error for confidence band
    const residuals = points.map(p => p.y - (slope * p.x + intercept));
    const se = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / (points.length - 2));
    const ci95 = 1.96 * se;

    return { points, line, slope, intercept, ci95, rSquared: 0.816 };
})();

// ---- SHOCK TIMELINE: Events with date ranges ----
const SHOCK_EVENTS = [
    {
        label: "Avian Flu 2003–04",
        startDate: "2003-07-01",
        endDate: "2004-07-01",
        description: "First major HPAI outbreak disrupts egg supply",
    },
    {
        label: "2008 Financial Crisis",
        startDate: "2007-07-01",
        endDate: "2009-01-01",
        description: "Global commodity and food price spike",
    },
    {
        label: "Avian Flu 2015",
        startDate: "2015-01-01",
        endDate: "2015-07-01",
        description: "Worst US avian flu outbreak kills 50M birds",
    },
    {
        label: "COVID-19 & Supply Chain",
        startDate: "2020-01-01",
        endDate: "2021-07-01",
        description: "Pandemic disrupts global food supply chains",
    },
    {
        label: "2022–23 Inflation Surge",
        startDate: "2022-01-01",
        endDate: "2023-07-01",
        description: "Energy crisis, avian flu, and post-COVID demand",
    },
];

// ---- GLOBAL COMPARISON: Regional rolling correlations ----
const GLOBAL_REGIONS = [
    { name: "United States", color: "#f71414" },
    { name: "United Kingdom", color: "#e63946" },
    { name: "Eurozone", color: "#c41010" },
    { name: "Japan", color: "#8f0d0d" },
    { name: "India", color: "#a83232" },
];

// Generate synthetic rolling correlation data (2005–2025)
const GLOBAL_TIMELINE = [];
for (let y = 2005; y <= 2025; y++) {
    for (let m of [1, 7]) {
        GLOBAL_TIMELINE.push(`${y}-${String(m).padStart(2, "0")}-01`);
    }
}

const GLOBAL_DATA = GLOBAL_REGIONS.map((region, idx) => {
    const base = [0.75, 0.72, 0.70, 0.60, 0.82][idx];
    const data = GLOBAL_TIMELINE.map((date, i) => {
        const t = i / GLOBAL_TIMELINE.length;
        // General upward trend with noise and event spikes
        let val = base + t * 0.12;
        // Add sinusoidal variation
        val += Math.sin(t * Math.PI * 4 + idx * 0.7) * 0.06;
        // Random noise
        val += (Math.random() - 0.5) * 0.04;
        // Spike around 2022 (high correlation during inflation surge)
        if (i >= 34 && i <= 38) val += 0.08;
        return +Math.min(0.98, Math.max(0.45, val)).toFixed(3);
    });
    return { ...region, data };
});

// ---- RADAR: Regional structural analysis ----
const RADAR_DATA = {
    labels: ["Volatility", "Lag Strength", "Correlation", "Predictive Power", "Response Speed"],
    regions: [
        {
            name: "United States",
            color: "rgba(247, 20, 20, 0.7)",
            bg: "rgba(247, 20, 20, 0.12)",
            values: [0.82, 0.90, 0.93, 0.88, 0.75],
        },
        {
            name: "United Kingdom",
            color: "rgba(230, 57, 70, 0.7)",
            bg: "rgba(230, 57, 70, 0.10)",
            values: [0.74, 0.85, 0.88, 0.82, 0.70],
        },
        {
            name: "Eurozone",
            color: "rgba(196, 16, 16, 0.7)",
            bg: "rgba(196, 16, 16, 0.10)",
            values: [0.68, 0.80, 0.85, 0.78, 0.65],
        },
        {
            name: "Japan",
            color: "rgba(143, 13, 13, 0.7)",
            bg: "rgba(143, 13, 13, 0.10)",
            values: [0.55, 0.65, 0.70, 0.60, 0.50],
        },
        {
            name: "India",
            color: "rgba(168, 50, 50, 0.7)",
            bg: "rgba(168, 50, 50, 0.10)",
            values: [0.90, 0.88, 0.82, 0.85, 0.92],
        },
    ],
};
