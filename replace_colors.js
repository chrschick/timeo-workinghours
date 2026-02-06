const fs = require('fs');

const file = 'src/styles.scss';
let content = fs.readFileSync(file, 'utf8');

// Replace all variations
const colors = ['primary', 'primary-dark', 'success', 'danger', 'warning', 'bg-weekend', 'bg-urlaub', 'bg-krank', 'bg-kindkrank', 'bg-feiertag', 'text-feiertag', 'border', 'shadow', 'font', 'bg-input', 'bg-body', 'bg-card'];

colors.forEach(color => {
  // Replace map-get($light, color)
  const lightReg = new RegExp('map-get\\(\\s*\\$light,\\s*' + color.replace('-', '\\-') + '\\s*\\)', 'g');
  content = content.replace(lightReg, `var(--${color})`);
  
  // Replace map-get($dark, color)
  const darkReg = new RegExp('map-get\\(\\s*\\$dark,\\s*' + color.replace('-', '\\-') + '\\s*\\)', 'g');
  content = content.replace(darkReg, `var(--${color})`);
});

fs.writeFileSync(file, content, 'utf8');
console.log('✓ Updated styles.scss with CSS variables');
