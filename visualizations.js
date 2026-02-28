// ============================================================
// VISUALIZATIONS — Heatmap, Sankey, Regression, Shock Timeline,
// Global Comparison, Radar Chart
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    initVisualizationObservers();
});

function initVisualizationObservers() {
    const vizSections = [
        { id: "sec-5", init: () => drawHeatmap("heatmapCanvas"), done: false },
        { id: "sec-6", init: () => drawSankey("sankeyContainer"), done: false },
        { id: "sec-7", init: () => drawRegression("regressionCanvas"), done: false },
        { id: "sec-8", init: () => drawShockTimeline("shockCanvas"), done: false },
        { id: "sec-9", init: () => drawGlobalComparison("globalCanvas"), done: false },
        { id: "sec-10", init: () => drawRadarChart("radarCanvas"), done: false },

        // Notebook charts
        { id: "heatmapCanvasNotebook", init: () => drawHeatmap("heatmapCanvasNotebook"), done: false },
        { id: "sankeyContainerNotebook", init: () => drawSankey("sankeyContainerNotebook"), done: false },
        { id: "regressionCanvasNotebook", init: () => drawRegression("regressionCanvasNotebook"), done: false },
        { id: "shockCanvasNotebook", init: () => drawShockTimeline("shockCanvasNotebook"), done: false },
        { id: "globalCanvasNotebook", init: () => drawGlobalComparison("globalCanvasNotebook"), done: false },
        { id: "radarCanvasNotebook", init: () => drawRadarChart("radarCanvasNotebook"), done: false },
    ];

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const viz = vizSections.find((v) => v.id === entry.target.id);
                    if (viz && !viz.done) {
                        viz.done = true;
                        viz.init();
                    }
                }
            });
        },
        { threshold: 0.1 }
    );

    vizSections.forEach((v) => {
        const el = document.getElementById(v.id);
        if (el) observer.observe(el);
    });
}

// ============================================================
// 1. HEATMAP — Correlation across time lags
// ============================================================

function drawHeatmap(canvasId = "heatmapCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const data = HEATMAP_DATA;
    const rows = data.categories.length;
    const cols = data.lags.length;

    const labelWidth = 120;
    const topMargin = 30;
    const bottomMargin = 30;
    const rightMargin = 20;
    const cellW = (w - labelWidth - rightMargin) / cols;
    const cellH = (h - topMargin - bottomMargin) / rows;

    // Color interpolation: #380303 → #8f0d0d → #f71414
    function getColor(val) {
        // Normalize val to 0–1 range (values range ~0.5–0.95)
        const min = 0.5, max = 0.95;
        let t = (val - min) / (max - min);
        t = Math.max(0, Math.min(1, t));

        let r, g, b;
        if (t < 0.5) {
            const s = t / 0.5;
            r = 56 + (143 - 56) * s;
            g = 3 + (13 - 3) * s;
            b = 3 + (13 - 3) * s;
        } else {
            const s = (t - 0.5) / 0.5;
            r = 143 + (247 - 143) * s;
            g = 13 + (20 - 13) * s;
            b = 13 + (20 - 13) * s;
        }
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    // Column headers (lag months)
    ctx.font = "10px 'Space Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "center";
    for (let c = 0; c < cols; c++) {
        const x = labelWidth + c * cellW + cellW / 2;
        ctx.fillText(data.lags[c] + "", x, topMargin - 10);
    }

    // Draw cells
    for (let r = 0; r < rows; r++) {
        // Row label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.textAlign = "right";
        ctx.font = "11px 'Space Mono', monospace";
        const labelY = topMargin + r * cellH + cellH / 2 + 4;
        ctx.fillText(data.categories[r], labelWidth - 12, labelY);

        for (let c = 0; c < cols; c++) {
            const val = data.matrix[r][c];
            const x = labelWidth + c * cellW;
            const y = topMargin + r * cellH;

            // Cell fill
            ctx.fillStyle = getColor(val);
            ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

            // Highlight peak column
            if (c === data.peakLag) {
                ctx.strokeStyle = "rgba(247, 20, 20, 0.6)";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellW, cellH);
            }
        }
    }

    // Peak column label
    const peakX = labelWidth + data.peakLag * cellW + cellW / 2;
    ctx.font = "bold 10px 'Space Mono', monospace";
    ctx.fillStyle = "#f71414";
    ctx.textAlign = "center";
    ctx.fillText("▲ PEAK", peakX, h - 8);
}

// ============================================================
// 2. SANKEY — Economic transmission flow (custom SVG)
// ============================================================

function drawSankey(containerId = "sankeyContainer") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.width = "100%";
    svg.style.height = "100%";

    // Create gradient defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    // Define node positions (4 columns)
    const columns = [
        { x: 40, nodes: ["supply", "feed"] },
        { x: w * 0.3, nodes: ["food"] },
        { x: w * 0.6, nodes: ["wages", "expect", "services"] },
        { x: w - 140, nodes: ["cpi"] },
    ];

    const nodeWidth = 100;
    const nodeHeight = 40;
    const nodePositions = {};

    // Compute node Y positions
    columns.forEach((col) => {
        const totalH = col.nodes.length * nodeHeight + (col.nodes.length - 1) * 24;
        let startY = (h - totalH) / 2;
        col.nodes.forEach((nodeId) => {
            const node = SANKEY_DATA.nodes.find((n) => n.id === nodeId);
            nodePositions[nodeId] = {
                x: col.x,
                y: startY,
                cx: col.x + nodeWidth / 2,
                cy: startY + nodeHeight / 2,
                color: node.color,
                label: node.label,
            };
            startY += nodeHeight + 24;
        });
    });

    // Draw flows
    SANKEY_DATA.flows.forEach((flow, i) => {
        const from = nodePositions[flow.from];
        const to = nodePositions[flow.to];
        const thickness = flow.value * 0.4;

        // Create gradient
        const gradId = `flow-grad-${i}`;
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", gradId);
        grad.setAttribute("x1", "0%");
        grad.setAttribute("x2", "100%");
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", from.color);
        stop1.setAttribute("stop-opacity", "0.5");
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", to.color);
        stop2.setAttribute("stop-opacity", "0.5");
        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);

        // Bezier curve path
        const x1 = from.x + nodeWidth;
        const y1 = from.cy;
        const x2 = to.x;
        const y2 = to.cy;
        const cpx = (x1 + x2) / 2;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute(
            "d",
            `M ${x1} ${y1 - thickness / 2} C ${cpx} ${y1 - thickness / 2}, ${cpx} ${y2 - thickness / 2}, ${x2} ${y2 - thickness / 2} L ${x2} ${y2 + thickness / 2} C ${cpx} ${y2 + thickness / 2}, ${cpx} ${y1 + thickness / 2}, ${x1} ${y1 + thickness / 2} Z`
        );
        path.setAttribute("fill", `url(#${gradId})`);
        path.setAttribute("opacity", "0");
        path.style.transition = `opacity 0.8s ease ${0.3 + i * 0.1}s`;
        svg.appendChild(path);

        // Animate in
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                path.setAttribute("opacity", "1");
            });
        });
    });

    // Draw nodes
    Object.entries(nodePositions).forEach(([id, pos], i) => {
        // Node rectangle
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", pos.x);
        rect.setAttribute("y", pos.y);
        rect.setAttribute("width", nodeWidth);
        rect.setAttribute("height", nodeHeight);
        rect.setAttribute("rx", "8");
        rect.setAttribute("fill", pos.color);
        rect.setAttribute("fill-opacity", "0.15");
        rect.setAttribute("stroke", pos.color);
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("stroke-opacity", "0.4");
        rect.setAttribute("opacity", "0");
        rect.style.transition = `opacity 0.6s ease ${i * 0.08}s`;
        svg.appendChild(rect);

        // Node label
        const lines = pos.label.split("\n");
        lines.forEach((line, li) => {
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", pos.cx);
            text.setAttribute("y", pos.cy + (li - (lines.length - 1) / 2) * 13);
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "central");
            text.setAttribute("fill", "rgba(255,255,255,0.8)");
            text.setAttribute("font-family", "'Space Mono', monospace");
            text.setAttribute("font-size", "10");
            text.setAttribute("letter-spacing", "0.5");
            text.setAttribute("opacity", "0");
            text.style.transition = `opacity 0.6s ease ${i * 0.08 + 0.2}s`;
            text.textContent = line;
            svg.appendChild(text);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    text.setAttribute("opacity", "1");
                });
            });
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                rect.setAttribute("opacity", "1");
            });
        });
    });

    svg.insertBefore(defs, svg.firstChild);
    container.appendChild(svg);
}

// ============================================================
// 3. REGRESSION — Scatter + regression line + confidence band
// ============================================================

function drawRegression(canvasId = "regressionCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const data = REGRESSION_DATA;

    new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [
                {
                    label: "Data Points",
                    data: data.points,
                    backgroundColor: "rgba(143, 13, 13, 0.6)",
                    borderColor: "rgba(143, 13, 13, 0.8)",
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBorderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: "easeOutQuart" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    titleFont: { family: "'Space Mono', monospace", size: 11 },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (item) =>
                            `Breakfast: ${item.parsed.x.toFixed(2)} σ  |  CPI: ${item.parsed.y.toFixed(2)} σ`,
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Breakfast Index (Z-Score)",
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                    ticks: { color: "rgba(255,255,255,0.4)", font: { family: "'Space Mono', monospace", size: 10 } },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
                y: {
                    title: {
                        display: true,
                        text: "CPI (Z-Score, t+11)",
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                    ticks: { color: "rgba(255,255,255,0.4)", font: { family: "'Space Mono', monospace", size: 10 } },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
            },
        },
        plugins: [
            {
                id: "regressionLine",
                afterDatasetsDraw(chart) {
                    const { ctx: c, scales } = chart;
                    const xScale = scales.x;
                    const yScale = scales.y;

                    const x1 = xScale.getPixelForValue(data.line.x1);
                    const y1 = yScale.getPixelForValue(data.line.y1);
                    const x2 = xScale.getPixelForValue(data.line.x2);
                    const y2 = yScale.getPixelForValue(data.line.y2);

                    // Confidence band
                    const ciTop1 = yScale.getPixelForValue(data.line.y1 + data.ci95);
                    const ciBot1 = yScale.getPixelForValue(data.line.y1 - data.ci95);
                    const ciTop2 = yScale.getPixelForValue(data.line.y2 + data.ci95);
                    const ciBot2 = yScale.getPixelForValue(data.line.y2 - data.ci95);

                    c.save();
                    c.beginPath();
                    c.moveTo(x1, ciTop1);
                    c.lineTo(x2, ciTop2);
                    c.lineTo(x2, ciBot2);
                    c.lineTo(x1, ciBot1);
                    c.closePath();
                    c.fillStyle = "rgba(247, 20, 20, 0.08)";
                    c.fill();

                    // Regression line
                    c.beginPath();
                    c.moveTo(x1, y1);
                    c.lineTo(x2, y2);
                    c.strokeStyle = "#f71414";
                    c.lineWidth = 2.5;
                    c.stroke();
                    c.restore();
                },
            },
        ],
    });
}

// ============================================================
// 4. SHOCK TIMELINE — Line chart with shaded event regions
// ============================================================

function drawShockTimeline(canvasId = "shockCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const labels = DATES.map((d) => {
        const dt = new Date(d);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[dt.getMonth()] + " " + dt.getFullYear();
    });

    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Breakfast Index",
                    data: BREAKFAST_NORM,
                    borderColor: "#8f0d0d",
                    borderWidth: 2.5,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#f71414",
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: "easeOutQuart" },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    titleFont: { family: "'Space Mono', monospace", size: 11 },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => ` Z-Score: ${item.parsed.y.toFixed(2)} σ`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                        maxTicksLimit: 8,
                    },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
                y: {
                    ticks: {
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
            },
        },
        plugins: [
            {
                id: "shockRegions",
                beforeDatasetsDraw(chart) {
                    const { ctx: c, scales } = chart;
                    const xScale = scales.x;
                    const yScale = scales.y;

                    SHOCK_EVENTS.forEach((event) => {
                        // Find closest date indices
                        const startIdx = DATES.findIndex((d) => d >= event.startDate);
                        const endIdx = DATES.findIndex((d) => d >= event.endDate);
                        if (startIdx < 0) return;
                        const eIdx = endIdx >= 0 ? endIdx : DATES.length - 1;

                        const x1 = xScale.getPixelForValue(startIdx);
                        const x2 = xScale.getPixelForValue(eIdx);
                        const top = yScale.top;
                        const bottom = yScale.bottom;

                        c.save();
                        c.fillStyle = "rgba(56, 3, 3, 0.35)";
                        c.fillRect(x1, top, x2 - x1, bottom - top);

                        // Event label
                        c.font = "9px 'Space Mono', monospace";
                        c.fillStyle = "rgba(247, 20, 20, 0.6)";
                        c.textAlign = "center";
                        c.save();
                        c.translate((x1 + x2) / 2, top + 14);
                        c.fillText(event.label, 0, 0);
                        c.restore();
                        c.restore();
                    });
                },
            },
        ],
    });
}

// ============================================================
// 5. GLOBAL COMPARISON — Multi-line chart
// ============================================================

function drawGlobalComparison(canvasId = "globalCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const formatDate = (d) => {
        const dt = new Date(d);
        return dt.getFullYear() + "";
    };

    // Only show year labels
    const labels = GLOBAL_TIMELINE.map((d, i) => {
        const dt = new Date(d);
        return dt.getMonth() === 0 ? dt.getFullYear() + "" : "";
    });

    const datasets = GLOBAL_DATA.map((region) => ({
        label: region.name,
        data: region.data,
        borderColor: region.color,
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: region.color,
        tension: 0.35,
    }));

    new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: "easeOutQuart" },
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        color: "rgba(255,255,255,0.5)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                        boxWidth: 12,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "circle",
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    titleFont: { family: "'Space Mono', monospace", size: 11 },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (item) => ` ${item.dataset.label}: r = ${item.parsed.y.toFixed(3)}`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                        maxTicksLimit: 10,
                    },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
                y: {
                    min: 0.4,
                    max: 1.0,
                    title: {
                        display: true,
                        text: "Correlation (r)",
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                    ticks: {
                        color: "rgba(255,255,255,0.4)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                    grid: { color: "rgba(255,255,255,0.04)" },
                },
            },
        },
    });
}

// ============================================================
// 6. RADAR — Structural differences
// ============================================================

function drawRadarChart(canvasId = "radarCanvas") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const datasets = RADAR_DATA.regions.map((region) => ({
        label: region.name,
        data: region.values.map((v) => v * 100),
        borderColor: region.color,
        backgroundColor: region.bg,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: region.color,
        fill: true,
    }));

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: RADAR_DATA.labels,
            datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: "easeOutQuart" },
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    labels: {
                        color: "rgba(255,255,255,0.5)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                        boxWidth: 12,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "circle",
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    titleFont: { family: "'Space Mono', monospace", size: 11 },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                },
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        display: false,
                    },
                    grid: {
                        color: "rgba(255,255,255,0.06)",
                    },
                    angleLines: {
                        color: "rgba(255,255,255,0.06)",
                    },
                    pointLabels: {
                        color: "rgba(255,255,255,0.5)",
                        font: { family: "'Space Mono', monospace", size: 10 },
                    },
                },
            },
        },
    });
}
