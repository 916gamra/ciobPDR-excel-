const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

code = code.replace(
`  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create Automatic Dated Backup before overwriting data`,
`  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Restrict file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast("Fichier trop volumineux. La taille maximale est de 10 MB.", "error");
      return;
    }

    // Restrict file extensions and MIME types
    const validExtensions = ['.json', '.xlsx'];
    const validMimeTypes = ['application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExt) || (file.type && !validMimeTypes.includes(file.type))) {
      showToast("Format de fichier non supporté. Seuls les fichiers JSON et XLSX sont autorisés.", "error");
      return;
    }

    // Create Automatic Dated Backup before overwriting data`
);

fs.writeFileSync('src/App.jsx', code);
