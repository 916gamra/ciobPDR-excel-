const fs = require('fs');
const file = 'src/presentation/pages/warehouse/EntrepotView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { EntrepotItem }")) {
  content = content.replace(
    /import \{ storageService \} from '\.\.\/\.\.\/\.\.\/utils\/storageService';/g,
    "import { storageService } from '../../../utils/storageService';\nimport { EntrepotItem } from '../../../core/domain';"
  );
}

content = content.replace(
  /displayedData\.map\(\(item, idx\) => \{/g,
  `displayedData.map((item, idx) => {
                  const domainItem = new EntrepotItem(item);`
);

content = content.replace(
  /\{item\.stockActuel \!= null \? item\.stockActuel : \(item\.stockInitial \|\| 1\)\} u/g,
  "{domainItem.getStockActuel()} u"
);

fs.writeFileSync(file, content);
