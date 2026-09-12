const fs = require('fs');
const file = 'src/presentation/pages/stock/StockView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { StockItem }")) {
  content = content.replace(
    /import \{ useSpareParts \} from '\.\.\/\.\.\/hooks\/useSpareParts';/g,
    "import { useSpareParts } from '../../hooks/useSpareParts';\nimport { StockItem } from '../../../core/domain';"
  );
}

// Replace the table row rendering to map to a Domain model
content = content.replace(
  /\{paginatedItems\.map\(\(item\) => \(/g,
  `{paginatedItems.map((item) => {
    const domainItem = new StockItem(item);
    return (`
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

// Fix the end of the map function
content = content.replace(
  /                  \)\}\n                \<\/tbody\>/g,
  `                  );
                  })}
                </tbody>`
);

fs.writeFileSync(file, content);
