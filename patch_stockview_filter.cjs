const fs = require('fs');
const file = 'src/presentation/pages/stock/StockView.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(stockAlertOnly && domainItem\.getCriticite\(\) === 'OK'\) \{/g,
  `const domainItem = new StockItem(item);
      if (stockAlertOnly && domainItem.getCriticite() === 'OK') {`
);

fs.writeFileSync(file, content);
