const fs = require('fs');
const file = 'src/presentation/pages/machines/BlueprintMachineView.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { Blueprint }")) {
  content = content.replace(
    /import \{ CubeIcon \} from '\.\.\/\.\.\/components\/common\/icons\/CubeIcon';/g,
    "import { CubeIcon } from '../../components/common/icons/CubeIcon';\nimport { Blueprint } from '../../../core/domain';"
  );
}

content = content.replace(
  /\/\/ Map of machine counts per blueprint[\s\S]*?\}, \[machines\]\);/g,
  `// Map of machine counts per blueprint (using Domain model)
  const blueprintMachineCountMap = useMemo(() => {
    const counts = {};
    blueprints.forEach((b) => {
      const bp = new Blueprint(b);
      counts[b.id_blueprint] = bp.getMachinesLieesCount(machines);
    });
    return counts;
  }, [blueprints, machines]);`
);

fs.writeFileSync(file, content);
