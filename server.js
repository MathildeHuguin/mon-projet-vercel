// Importer les modules nécessaires
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser'); // Pour lire le CSV
const bodyParser = require('body-parser'); // Pour gérer les données des formulaires
const fastCsv = require('fast-csv'); // Pour écrire dans un CSV
const path = require('path'); // Pour gérer les chemins de fichiers

// Créer une instance de l'application Express
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Pour traiter les données des formulaires

// Définir le moteur de vues à EJS
app.set('view engine', 'ejs'); // On va utiliser EJS pour rendre le HTML dynamique

// Route pour afficher le tableau
app.get('/', (req, res) => {
  let results = [];
  const filePath = path.join(__dirname, 'data.csv'); // Utiliser __dirname pour le chemin du fichier

  // Lire le fichier CSV avec le point-virgule comme séparateur
  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' })) // Spécifie le séparateur
    .on('data', (data) => results.push(data)) // Ajouter chaque ligne dans le tableau results
    .on('end', () => {
      // Envoyer les données CSV à la vue
      res.render('index', { data: results }); // Rendre la vue 'index.ejs'
    })
    .on('error', (err) => {
      console.error('Erreur lors de la lecture du fichier CSV:', err);
      res.status(500).send('Erreur lors de la lecture du fichier CSV.');
    });
});

// Route pour mettre à jour une ligne du CSV
app.post('/update-row', (req, res) => {
  const { index, updatedData } = req.body; // Récupérer l'index et les données modifiées
  let results = [];
  const filePath = path.join(__dirname, 'data.csv'); // Utiliser __dirname pour le chemin du fichier

  // Lire le fichier CSV actuel
  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' })) // Spécifie le séparateur
    .on('data', (data) => results.push(data)) // Ajouter chaque ligne dans le tableau results
    .on('end', () => {
      // Vérifier que l'index est valide
      if (index < 0 || index >= results.length) {
        console.error('Index invalide:', index);
        return res.status(400).json({ success: false, message: 'Index invalide.' });
      }

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
      const ws = fs.createWriteStream(path.join(__dirname, 'data_modifie.csv')); // Utiliser __dirname
      fastCsv
        .write(results, { headers: true, delimiter: ';' }) // Écrire les résultats dans data_modifie.csv avec le point-virgule comme délimiteur
        .pipe(ws)
        .on('finish', () => {
          res.json({ success: true }); // Répondre avec succès
        })
        .on('error', (err) => {
          console.error('Erreur lors de l\'écriture du fichier CSV:', err);
          res.status(500).json({ success: false, message: 'Erreur lors de l\'écriture du fichier CSV.' });
        });
    })
    .on('error', (err) => {
      console.error('Erreur lors de la lecture du fichier CSV:', err);
      res.status(500).send('Erreur lors de la lecture du fichier CSV.');
    });
});

// Route pour télécharger le fichier CSV modifié
app.get('/download-csv', (req, res) => {
  const file = path.join(__dirname, 'data_modifie.csv'); // Utiliser __dirname pour le chemin du fichier modifié
  res.download(file); // Lien de téléchargement pour le fichier modifié
});

// Lancer le serveur sur le port spécifié
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
