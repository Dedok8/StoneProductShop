const path = require('path');

const dotenv = require('dotenv');

// Указываем путь к .env файлу в корне проекта
dotenv.config({ path: path.resolve(__dirname, '../.env') });
