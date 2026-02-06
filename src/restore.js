const fs = require('fs');

const content = `/* TimeCal Styles - SCSS */

// ============ LIGHT THEME VARIABLES ============
\$light: (
  primary: #1585e1,
  primary-dark: #0f5daa,
  success: #4caf50,
  danger: #f44336,
  warning: #ff9800,
  bg-weekend: #f7bfbf,
  bg-urlaub: #bdd7ee,
  bg-krank: #ffe699,
  bg-kindkrank: #ffc585,
  bg-feiertag: #2f75b5,
  text-feiertag: #ffffff,
  border: #ddd,
  shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
  font: #0c0c0c,
  bg-input: transparent,
  bg-body: #f5f5f5,
  bg-card: white,
);

// ============ DARK THEME VARIABLES ============
\$dark: (
  primary: #533681,
  primary-dark: #3a2660,
  success: #90ee90,
  danger: #ff6b6b,
  warning: #ffa500,
  bg-weekend: #6d4545,
  bg-urlaub: #456d8d,
  bg-krank: #8d7d45,
  bg-kindkrank: #8d6d45,
  bg-feiertag: #533681,
  text-feiertag: #ffffff,
  border: #5d5d75,
  shadow: 0 2px 8px rgba(0, 0, 0, 0.5),
  font: #f5f5fa,
  bg-input: #3d3d5d,
  bg-body: #27273d,
  bg-card: #2f2f47,
);

// ============ MIXINS ============
@mixin dark-mode {
  @media (prefers-color-scheme: dark) {
    @content;
  }
}

@mixin row-color(\$bg-key) {
  background: map-get(\$light, \$bg-key) !important;

  @include dark-mode {
    background: map-get(\$dark, \$bg-key) !important;
  }
}

@mixin button-style {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@mixin focus-ring {
  outline: none;
  border-color: map-get(\$light, primary);
  box-shadow: 0 0 0 2px rgba(21, 133, 225, 0.2);

  @include dark-mode {
    border-color: map-get(\$dark, primary);
    box-shadow: 0 0 0 2px rgba(83, 54, 129, 0.3);
  }
}

// ============ GLOBAL STYLES ============
:root {
  --primary: #{map-get(\$light, primary)};
  --primary-dark: #{map-get(\$light, primary-dark)};
  --success: #{map-get(\$light, success)};
  --danger: #{map-get(\$light, danger)};
  --warning: #{map-get(\$light, warning)};
  --bg-weekend: #{map-get(\$light, bg-weekend)};
  --bg-urlaub: #{map-get(\$light, bg-urlaub)};
  --bg-krank: #{map-get(\$light, bg-krank)};
  --bg-kindkrank: #{map-get(\$light, bg-kindkrank)};
  --bg-feiertag: #{map-get(\$light, bg-feiertag)};
  --text-feiertag: #{map-get(\$light, text-feiertag)};
  --border: #{map-get(\$light, border)};
  --shadow: #{map-get(\$light, shadow)};
  --font: #{map-get(\$light, font)};
  --bg-input: #{map-get(\$light, bg-input)};
  --bg-body: #{map-get(\$light, bg-body)};
  --bg-card: #{map-get(\$light, bg-card)};

  @include dark-mode {
    --primary: #{map-get(\$dark, primary)};
    --primary-dark: #{map-get(\$dark, primary-dark)};
    --success: #{map-get(\$dark, success)};
    --danger: #{map-get(\$dark, danger)};
    --warning: #{map-get(\$dark, warning)};
    --bg-weekend: #{map-get(\$dark, bg-weekend)};
    --bg-urlaub: #{map-get(\$dark, bg-urlaub)};
    --bg-krank: #{map-get(\$dark, bg-krank)};
    --bg-kindkrank: #{map-get(\$dark, bg-kindkrank)};
    --bg-feiertag: #{map-get(\$dark, bg-feiertag)};
    --text-feiertag: #{map-get(\$dark, text-feiertag)};
    --border: #{map-get(\$dark, border)};
    --shadow: #{map-get(\$dark, shadow)};
    --font: #{map-get(\$dark, font)};
    --bg-input: #{map-get(\$dark, bg-input)};
    --bg-body: #{map-get(\$dark, bg-body)};
    --bg-card: #{map-get(\$dark, bg-card)};
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    sans-serif;
  background: map-get(\$light, bg-body);
  color: map-get(\$light, font);
  line-height: 1.5;

  @include dark-mode {
    background: map-get(\$dark, bg-body);
    color: map-get(\$dark, font);
  }
}

// ============ APP CONTAINER ============
.app {
  width: 100%;
  max-width: 1600px;
  padding: 20px;
  box-sizing: border-box;
  margin: 0 auto;
}

// ============ HEADER ============
.header {
  background: map-get(\$light, primary);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow);

  @include dark-mode {
    background: map-get(\$dark, primary);
  }

  h1 {
    font-size: 1.8rem;
  }
}

.breadcrumb {
  display: flex;
  gap: 10px;
  align-items: center;

  a,
  span {
    color: white;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

// ============ BUTTONS ============
.btn {
  @include button-style;

  &.btn-primary {
    background: map-get(\$light, primary);
    color: white;

    @include dark-mode {
      background: map-get(\$dark, primary);
    }

    &:hover {
      background: map-get(\$light, primary-dark);

      @include dark-mode {
        background: map-get(\$dark, primary-dark);
      }
    }
  }

  &.btn-success {
    background: map-get(\$light, success);
    color: white;

    &:hover {
      background: #43a047;
    }
  }

  &.btn-danger {
    background: map-get(\$light, danger);
    color: white;

    &:hover {
      background: #e53935;
    }
  }

  &.btn-outline {
    background: map-get(\$light, bg-card);
    border: 2px solid map-get(\$light, primary);
    color: map-get(\$light, primary);

    @include dark-mode {
      background: map-get(\$dark, bg-input);
      border-color: map-get(\$dark, primary);
      color: map-get(\$dark, primary);
    }

    &:hover {
      background: map-get(\$light, primary);
      color: map-get(\$light, bg-card);

      @include dark-mode {
        background: map-get(\$dark, primary);
        color: map-get(\$dark, bg-card);
      }
    }
  }

  &.btn-sm {
    padding: 6px 12px;
    font-size: 0.85rem;
  }

  &.btn-icon {
    padding: 6px 10px;
    min-width: auto;
  }
}

// ============ CARDS ============
.card {
  background: map-get(\$light, bg-card);
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 20px;

  @include dark-mode {
    background: map-get(\$dark, bg-card);
    border-top: 2px solid map-get(\$dark, primary);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--font);
}

// ============ KPI STATS ============
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.kpi-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: map-get(\$light, primary);

  @include dark-mode {
    color: map-get(\$dark, success);
  }

  &.kpi-positive {
    color: map-get(\$light, success);

    @include dark-mode {
      color: map-get(\$dark, success);
    }
  }

  &.kpi-negative {
    color: map-get(\$light, danger);

    @include dark-mode {
      color: map-get(\$dark, danger);
    }
  }

  &.kpi-neutral {
    color: #666;

    @include dark-mode {
      color: #b8b8d0;
    }
  }
}

.kpi-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;

  @include dark-mode {
    color: #b8b8d0;
  }
}

// ============ TABLES ============
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  padding: 2px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  background: #f8f9fa;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  color: var(--font);

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }
}

tr:hover {
  background: #f5f5f5;

  @include dark-mode {
    background: #35354f;
  }
}

// ============ ROW COLORS ============
tr.weekend {
  @include row-color(bg-weekend);
  font-weight: bold;
}

tr.urlaub {
  @include row-color(bg-urlaub);
}

tr.krank {
  @include row-color(bg-krank);
}

tr.kindkrank {
  @include row-color(bg-kindkrank);
}

tr.feiertag {
  @include row-color(bg-feiertag);
  color: white;

  input {
    color: white;
    background: transparent;
  }
}

// ============ INPUTS ============
input,
select {
  padding: 8px 10px;
  border: 1px solid var(--border);
  color: var(--font);
  background: var(--bg-input, white);
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;

  &:focus {
    @include focus-ring;
  }
}

// ============ TIME INPUT GROUP ============
.time-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.time-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: inherit;
  opacity: 0.7;

  @include dark-mode {
    color: map-get(\$dark, success);
    opacity: 0.9;
  }
}

input.time-input {
  width: 100%;
  text-align: center;
  color: var(--font);
  border: 1px solid var(--border);
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

input.comment-input {
  width: 100%;
  min-width: 120px;

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }
}

// ============ DIFF COLORS ============
.diff-positive {
  color: map-get(\$light, success);
  font-weight: 600;

  @include dark-mode {
    color: map-get(\$dark, success);
  }
}

.diff-negative {
  color: map-get(\$light, danger);
  font-weight: 600;

  @include dark-mode {
    color: map-get(\$dark, danger);
  }
}

.diff-neutral {
  color: #666;

  @include dark-mode {
    color: #b8b8d0;
  }
}

// ============ CODE SELECT ============
.code-select {
  width: 60px;
  padding: 5px;
}

// ============ WEEK SUMMARY ============
.week-summary {
  background: #e3f2fd;
  padding: 8px 12px;
  border-radius: 4px;
  font-weight: 600;
  text-align: right;

  @include dark-mode {
    background: rgba(83, 54, 129, 0.3);
    border-color: map-get(\$dark, primary);
  }
}

// ============ YEAR LIST ============
.year-list {
  display: grid;
  gap: 15px;
}

.year-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }

  &:hover {
    background: #e3f2fd;
    transform: translateX(5px);

    @include dark-mode {
      background: #4d4d6d;
    }
  }
}

.year-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: map-get(\$light, primary);

  @include dark-mode {
    color: map-get(\$dark, success);
  }
}

.year-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.year-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.year-stat-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.year-stat-label {
  font-size: 0.75rem;
  color: #666;

  @include dark-mode {
    color: #b8b8d0;
  }
}

// ============ MONTH GRID ============
.month-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 15px;
}

.month-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }

  &:hover {
    border-color: map-get(\$light, primary);
    transform: translateY(-2px);

    @include dark-mode {
      border-color: map-get(\$dark, primary);
      background: #4d4d6d;
    }
  }
}

.month-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.month-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.month-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 0.85rem;
}

.month-stat {
  display: flex;
  justify-content: space-between;
}

// ============ MODAL ============
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  @include dark-mode {
    background: rgba(0, 0, 0, 0.8);
  }
}

.modal {
  background: map-get(\$light, bg-card);
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  color: var(--font);

  @include dark-mode {
    background: map-get(\$dark, bg-card);
  }

  h2 {
    margin-bottom: 20px;
  }
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

// ============ LOADING ============
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;

  @include dark-mode {
    color: #b8b8d0;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid map-get(\$light, primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 15px;

  @include dark-mode {
    border: 4px solid #4d4d6d;
    border-top: 4px solid map-get(\$dark, primary);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// ============ SAVE INDICATOR ============
.save-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: map-get(\$light, success);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: var(--shadow);
  animation: fadeInOut 2s ease-in-out;
  z-index: 1000;

  @include dark-mode {
    background: map-get(\$dark, success);
    color: map-get(\$dark, bg-body);
  }
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
  20%,
  80% {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============ SCROLLBAR ============
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;

  @include dark-mode {
    background: map-get(\$dark, bg-input);
  }
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;

  @include dark-mode {
    background: map-get(\$dark, primary);
  }

  &:hover {
    background: #a1a1a1;

    @include dark-mode {
      background: #6d5ca3;
    }
  }
}

// ============ RESPONSIVE ============
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .year-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .year-stats {
    justify-content: center;
  }

  table {
    font-size: 0.8rem;
  }

  .time-input-group {
    flex-direction: column;
    gap: 4px;
  }

  .time-icon {
    width: 16px;
    height: 16px;
  }

  input.time-input {
    width: 100%;
    padding: 5px;
  }
}`;

fs.writeFileSync('styles.scss', content, 'utf-8');
console.log('✓ styles.scss restored to working version');
