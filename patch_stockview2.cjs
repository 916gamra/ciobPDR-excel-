const fs = require('fs');
const file = 'src/presentation/pages/stock/StockView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { StockItem }")) {
  content = content.replace(
    /import \{ useSpareParts \} from '\.\.\/\.\.\/hooks\/useSpareParts';/g,
    "import { useSpareParts } from '../../hooks/useSpareParts';\nimport { StockItem } from '../../../core/domain';"
  );
}

content = content.replace(
  /displayedStock\.map\(\(item, idx\) => \{/g,
  `displayedStock.map((item, idx) => {
                  const domainItem = new StockItem(item);`
);

content = content.replace(
  /\{item\.stockActuel\}/g,
  "{domainItem.getActuel()}"
);

content = content.replace(
  /\{item\.seuil\}/g,
  "{domainItem.getSeuilAlerte()}"
);

content = content.replace(
  /item\.alerte === 'RUPTURE'/g,
  "domainItem.getCriticite() === 'RUPTURE'"
);

content = content.replace(
  /item\.alerte === 'ALERTE'/g,
  "domainItem.getCriticite() === 'ALERTE'"
);

content = content.replace(
  /item\.alerte === 'OK'/g,
  "domainItem.getCriticite() === 'OK'"
);

fs.writeFileSync(file, content);
