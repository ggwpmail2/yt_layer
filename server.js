const express = require('express');
const { spawn } = require('child_process');
const PORT = 3000;

const app = express();

app.get('/stream', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) {
        return res.status(400).send('URL видео не указан');
    }

    // Устанавливаем заголовок Accept-Ranges для поддержки диапазонов
    res.setHeader('Accept-Ranges', 'bytes');

    // Запускаем yt-dlp с настройкой качества и выводом в stdout
    const process = spawn('yt-dlp', ['-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]', '-o', '-', videoUrl]);

    // Обрабатываем диапазон запроса, чтобы поддерживать перемотку
    req.on('range', (range) => {
        const rangeHeader = range.split('=')[1];
        const [start, end] = rangeHeader.split('-');
        res.setHeader('Content-Range', `bytes ${start}-${end}`);
    });

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
