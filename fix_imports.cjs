const fs = require('fs');

const views = [
  'ZonesView.jsx', 'OperationsView.jsx', 'FamilyView.jsx', 
  'TypeView.jsx', 'TemplatesView.jsx', 'TechniciansView.jsx', 
  'DesignationView.jsx', 'MachinesRegisteredView.jsx'
];

for (const file of views) {
  let content = fs.readFileSync(`src/components/${file}`, 'utf8');
  const missingImports = ['ChevronLeft', 'ChevronRight', 'SlidersHorizontal', 'ArrowUpDown', 'ChevronDown', 'ArrowUp', 'ArrowDown'];
  
  let changed = false;
  
  // check if lucide-react import contains them
  const match = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
  if (match) {
    let imported = match[1];
    for (const mi of missingImports) {
      if (!imported.includes(mi)) {
        imported += `, ${mi}`;
        changed = true;
      }
    }
    if (changed) {
      content = content.replace(match[0], `import { ${imported} } from 'lucide-react'`);
      fs.writeFileSync(`src/components/${file}`, content);
      console.log(`Fixed imports in ${file}`);
    }
  }
}
