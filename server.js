const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bienvenue sur mon premier site Node.js déployé avec Vercel!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
