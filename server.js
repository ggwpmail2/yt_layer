const express = require('express');
const { spawn } = require('child_process');
const PORT = 3000;

const app = express();

app.get('/stream', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('URL видео не указан');
    }

    // Запускаем yt-dlp с параметрами для выбора разрешения, видеокодека и аудиокодека
  //  const process = spawn('yt-dlp', ['-f', 'bv*+ba/b', '-S', 'res:720,vcodec:h264,acodec:aac', '-o', '-', videoUrl]);
    const process = spawn('yt-dlp', ['-f', 'bv+ba', '-o', '-', videoUrl]);

    // Устанавливаем заголовок для передачи видео в формате MP4
    res.setHeader('Content-Type', 'video/mp4');

    // Передаем поток данных от yt-dlp клиенту
    process.stdout.pipe(res);

    process.stderr.on('data', (data) => {
        console.error(`Ошибка: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`Процесс завершён с кодом ${code}`);
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
