const fs = require('fs');
const file = 'src/presentation/pages/system/NexusView.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /export const areBOMsIdentical[\s\S]*?export const areSpecsIdentical[\s\S]*?return JSON\.stringify\(cleanA\) === JSON\.stringify\(cleanB\);\n};\n/g,
  ''
);

content = content.replace(
  /import { LayersIcon } from '\.\.\/\.\.\/components\/common\/icons\/LayersIcon';/g,
  "import { LayersIcon } from '../../components/common/icons/LayersIcon';\nimport { Machine, Blueprint, Zone } from '../../../core/domain';"
);

content = content.replace(
  /const machinePdrHistory = useMemo\(\(\) => \{[\s\S]*?\}, \[selectedMachine, mouvements\]\);/g,
  `const machinePdrHistory = useMemo(() => {
    if (!selectedMachine) return [];
    
    // Domain-Driven Design: Let the Machine instance figure out its own PDR history
    const machineInstance = new Machine(selectedMachine);
    const relatedMvts = machineInstance.getPDRHistory(mouvements);

    const map = new Map();
    relatedMvts.forEach((m) => {
      const ref = m.ref || m.id_article || 'PDR-REF';
      const existing = map.get(ref) || { ref, count: 0, totalQty: 0, lastDate: m.date };
      existing.count += 1;
      existing.totalQty += Math.abs(Number(m.quantite || m.qte) || 1);
      if (m.date && m.date > existing.lastDate) existing.lastDate = m.date;
      map.set(ref, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [selectedMachine, mouvements]);`
);

content = content.replace(
  /const twinMachines = useMemo\(\(\) => \{[\s\S]*?return machines\.filter\([\s\S]*?\}\);[\s\S]*?\}, \[selectedMachine, machines\]\);/g,
  `const twinMachines = useMemo(() => {
    if (!selectedMachine) return [];
    // Domain-Driven Design: Let the Machine instance find its own twins
    const machineInstance = new Machine(selectedMachine);
    return machineInstance.findTwins(machines);
  }, [selectedMachine, machines]);`
);

fs.writeFileSync(file, content);
