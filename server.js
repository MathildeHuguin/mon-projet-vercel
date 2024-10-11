// Importer les modules nécessaires
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser'); // Pour lire le CSV
const bodyParser = require('body-parser'); // Pour gérer les données des formulaires
const fastCsv = require('fast-csv'); // Pour écrire dans un CSV
const path = require('path'); // Pour gérer les chemins

// Créer une instance de l'application Express
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Pour traiter les données des formulaires

// Définir le moteur de vues à EJS
app.set('view engine', 'ejs'); // On va utiliser EJS pour rendre le HTML dynamique
app.set('views', path.join(__dirname, 'views')); // Indique où se trouve le dossier des vues

// Route pour afficher le tableau
app.get('/', (req, res) => {
  let results = [];

  // Lire le fichier CSV avec le point-virgule comme séparateur
  fs.createReadStream('data.csv')
    .pipe(csv({ separator: ';' })) // Spécifie le séparateur
    .on('data', (data) => results.push(data)) // Ajouter chaque ligne dans le tableau results
    .on('end', () => {
      // Envoyer les données CSV à la vue
      res.render('index', { data: results }); // Rendre la vue 'index.ejs'
    });
});

// Route pour mettre à jour une ligne du CSV
app.post('/update-row', (req, res) => {
  const { index, updatedData } = req.body; // Récupérer l'index et les données modifiées

  let results = [];

  // Lire le fichier CSV actuel
  fs.createReadStream('data.csv')
    .pipe(csv({ separator: ';' })) // Spécifie le séparateur
    .on('data', (data) => results.push(data)) // Ajouter chaque ligne dans le tableau results
    .on('end', () => {
      // Modifier la ligne correspondant à l'index
      results[index]['Terme anglais'] = updatedData[0]; // Mettre à jour l'anglais
      results[index]['Terme français'] = updatedData[1]; // Mettre à jour le français
      results[index]['Variant anglais'] = updatedData[2]; // Mettre à jour variant anglais
      results[index]['Variant français'] = updatedData[3]; // Mettre à jour variant français
      results[index]['Definition anglaise'] = updatedData[4]; // Mettre à jour définition anglaise
      results[index]['Définition française'] = updatedData[5]; // Mettre à jour définition française
      results[index]['Note anglaise'] = updatedData[6]; // Mettre à jour note anglaise
      results[index]['Note française'] = updatedData[7]; // Mettre à jour note française
      results[index]['Terme lié'] = updatedData[8]; // Mettre à jour terme lié

      // Créer un nouveau CSV contenant uniquement les lignes modifiées
      const ws = fs.createWriteStream('data_modifie.csv');
      fastCsv
        .write(results, { headers: true, delimiter: ';' }) // Écrire les résultats dans data_modifie.csv avec le point-virgule comme délimiteur
        .pipe(ws);

      res.json({ success: true }); // Répondre avec succès
    });
});

// Route pour télécharger le fichier CSV modifié
app.get('/download-csv', (req, res) => {
  const file = `${__dirname}/data_modifie.csv`; // Chemin du fichier modifié
  res.download(file); // Lien de téléchargement pour le fichier modifié
});

// Lancer le serveur sur le port spécifié
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
