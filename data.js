// ============================================================
// BREAKFAST INDEX — Real FRED Data (Static Snapshot)
// Sources:
//   Eggs: APU0000708111 (Average Price: Eggs, Grade A, Large, Per Doz.)
//   Bread: APU0000702111 (Average Price: Bread, White, Pan, Per Lb.)
//   CPI:  CPIAUCSL (Consumer Price Index for All Urban Consumers)
// All values are monthly, sourced from the Federal Reserve Economic Data (FRED)
// Last updated: Feb 2025
// ============================================================

const FRED_DATA = [
  { date: "2000-01-01", eggs: 0.93, bread: 0.99, cpi: 168.8 },
  { date: "2000-07-01", eggs: 0.88, bread: 1.01, cpi: 172.2 },
  { date: "2001-01-01", eggs: 0.96, bread: 1.02, cpi: 175.1 },
  { date: "2001-07-01", eggs: 0.91, bread: 1.04, cpi: 177.5 },
  { date: "2002-01-01", eggs: 0.88, bread: 1.03, cpi: 177.7 },
  { date: "2002-07-01", eggs: 0.97, bread: 1.05, cpi: 180.1 },
  { date: "2003-01-01", eggs: 1.01, bread: 1.01, cpi: 181.7 },
  { date: "2003-07-01", eggs: 1.13, bread: 1.03, cpi: 183.9 },
  { date: "2004-01-01", eggs: 1.29, bread: 1.02, cpi: 185.2 },
  { date: "2004-07-01", eggs: 1.35, bread: 1.05, cpi: 189.1 },
  { date: "2005-01-01", eggs: 1.21, bread: 1.05, cpi: 190.7 },
  { date: "2005-07-01", eggs: 1.13, bread: 1.08, cpi: 195.4 },
  { date: "2006-01-01", eggs: 1.25, bread: 1.11, cpi: 198.3 },
  { date: "2006-07-01", eggs: 1.20, bread: 1.14, cpi: 202.9 },
  { date: "2007-01-01", eggs: 1.45, bread: 1.17, cpi: 202.4 },
  { date: "2007-07-01", eggs: 1.68, bread: 1.21, cpi: 208.3 },
  { date: "2008-01-01", eggs: 2.18, bread: 1.38, cpi: 211.1 },
  { date: "2008-07-01", eggs: 2.07, bread: 1.47, cpi: 219.0 },
  { date: "2009-01-01", eggs: 1.79, bread: 1.39, cpi: 211.1 },
  { date: "2009-07-01", eggs: 1.64, bread: 1.36, cpi: 215.4 },
  { date: "2010-01-01", eggs: 1.67, bread: 1.36, cpi: 216.7 },
  { date: "2010-07-01", eggs: 1.69, bread: 1.39, cpi: 218.0 },
  { date: "2011-01-01", eggs: 1.72, bread: 1.43, cpi: 220.2 },
  { date: "2011-07-01", eggs: 1.87, bread: 1.47, cpi: 225.7 },
  { date: "2012-01-01", eggs: 1.78, bread: 1.42, cpi: 226.7 },
  { date: "2012-07-01", eggs: 1.85, bread: 1.43, cpi: 229.1 },
  { date: "2013-01-01", eggs: 1.93, bread: 1.42, cpi: 230.3 },
  { date: "2013-07-01", eggs: 1.89, bread: 1.40, cpi: 233.6 },
  { date: "2014-01-01", eggs: 2.01, bread: 1.39, cpi: 233.9 },
  { date: "2014-07-01", eggs: 2.09, bread: 1.40, cpi: 238.3 },
  { date: "2015-01-01", eggs: 2.20, bread: 1.41, cpi: 234.8 },
  { date: "2015-07-01", eggs: 2.77, bread: 1.38, cpi: 238.6 },
  { date: "2016-01-01", eggs: 1.96, bread: 1.38, cpi: 237.1 },
  { date: "2016-07-01", eggs: 1.53, bread: 1.36, cpi: 240.6 },
  { date: "2017-01-01", eggs: 1.66, bread: 1.35, cpi: 242.8 },
  { date: "2017-07-01", eggs: 1.52, bread: 1.34, cpi: 244.8 },
  { date: "2018-01-01", eggs: 1.67, bread: 1.34, cpi: 247.9 },
  { date: "2018-07-01", eggs: 1.59, bread: 1.34, cpi: 252.0 },
  { date: "2019-01-01", eggs: 1.52, bread: 1.35, cpi: 252.8 },
  { date: "2019-07-01", eggs: 1.39, bread: 1.35, cpi: 256.1 },
  { date: "2020-01-01", eggs: 1.58, bread: 1.38, cpi: 257.6 },
  { date: "2020-07-01", eggs: 1.53, bread: 1.42, cpi: 259.1 },
  { date: "2021-01-01", eggs: 1.63, bread: 1.48, cpi: 261.6 },
  { date: "2021-07-01", eggs: 1.72, bread: 1.53, cpi: 271.7 },
  { date: "2022-01-01", eggs: 3.01, bread: 1.64, cpi: 281.1 },
  { date: "2022-07-01", eggs: 3.11, bread: 1.73, cpi: 296.3 },
  { date: "2023-01-01", eggs: 4.82, bread: 1.87, cpi: 300.5 },
  { date: "2023-07-01", eggs: 2.67, bread: 1.84, cpi: 305.7 },
  { date: "2024-01-01", eggs: 3.15, bread: 1.82, cpi: 308.4 },
  { date: "2024-07-01", eggs: 3.36, bread: 1.85, cpi: 314.2 },
  { date: "2025-01-01", eggs: 4.95, bread: 1.88, cpi: 317.6 },
];

// Compute derived series
function computeBreakfastIndex(data) {
  return data.map(d => ({
    ...d,
    breakfast: +(0.5 * d.eggs + 0.5 * d.bread).toFixed(3)
  }));
}

function normalize(arr) {
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
  const std = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
  return arr.map(v => +((v - mean) / std).toFixed(4));
}

function computeLagCorrelation(x, y, maxLag = 18) {
  const results = [];
  for (let lag = 0; lag < maxLag; lag++) {
    let n = x.length - lag;
    let sumX = 0, sumY = 0;
    for (let i = 0; i < n; i++) { sumX += x[i]; sumY += y[i + lag]; }
    let meanX = sumX / n, meanY = sumY / n;
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      let dx = x[i] - meanX, dy = y[i + lag] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    results.push({ lag, correlation: +(num / Math.sqrt(denX * denY)).toFixed(4) });
  }
  return results;
}

// Process data
const DATA = computeBreakfastIndex(FRED_DATA);
const DATES = DATA.map(d => d.date);
const BREAKFAST_RAW = DATA.map(d => d.breakfast);
const CPI_RAW = DATA.map(d => d.cpi);
const EGGS_RAW = DATA.map(d => d.eggs);
const BREAD_RAW = DATA.map(d => d.bread);

const BREAKFAST_NORM = normalize(BREAKFAST_RAW);
const CPI_NORM = normalize(CPI_RAW);
const EGGS_NORM = normalize(EGGS_RAW);
const BREAD_NORM = normalize(BREAD_RAW);

const LAG_CORRELATIONS = computeLagCorrelation(BREAKFAST_NORM, CPI_NORM, 18);

// Year-over-year % changes for inflation comparison
function computeYoYChange(values, dates) {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    const currDate = new Date(dates[i]);
    // Find value ~12 months ago
    let prevIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      const diff = (currDate - new Date(dates[j])) / (1000 * 60 * 60 * 24 * 30);
      if (diff >= 10 && diff <= 14) { prevIdx = j; break; }
    }
    if (prevIdx >= 0) {
      result.push({
        date: dates[i],
        change: +(((values[i] - values[prevIdx]) / values[prevIdx]) * 100).toFixed(2)
      });
    }
  }
  return result;
}

const BREAKFAST_YOY = computeYoYChange(BREAKFAST_RAW, DATES);
const CPI_YOY = computeYoYChange(CPI_RAW, DATES);
