// server.js
const express = require('express');
const multer = require('multer');
const cv = require('@u4/opencv4nodejs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Configurar armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Função para comparar gabaritos
const compareGabaritos = (gabaritoPath, userImagePath) => {
  const gabarito = cv.imread(gabaritoPath);
  const userImage = cv.imread(userImagePath);

  // Pré-processamento, como redimensionamento e conversão para escala de cinza
  const gabaritoGray = gabarito.bgrToGray();
  const userImageGray = userImage.bgrToGray();

  // Aqui, você pode adicionar algoritmos de comparação de imagem, como correspondência de características
  const diff = gabaritoGray.absdiff(userImageGray);
  const score = diff.countNonZero();
  
  // Exemplo simples: retornar o número de pixels diferentes
  return score;
};

app.post('/upload', upload.single('image'), (req, res) => {
  const gabaritoPath = path.join(__dirname, 'gabarito.png'); 
  const userImagePath = path.join(__dirname, req.file.path);

  const score = compareGabaritos(gabaritoPath, userImagePath);

  // Retornar o resultado da comparação
  res.json({ score });

  // Limpeza dos arquivos temporários
  fs.unlinkSync(userImagePath);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
