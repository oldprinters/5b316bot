import { dbConfig, ftpConfig, pool } from './mariadb.js'
import { getDateTimeBD } from '../utils.js'
import fs from 'fs'
import archiver from 'archiver'
import { spawn } from 'node:child_process'
import Client from 'ftp'
//npm install archiver --save
//npm install ftp
//------------------------------------------------------
const backup = async () => {
    const connection = await pool.getConnection()
    // Удаляем записи с active = 0 и cycle = 0
    await connection.query('DELETE FROM ivanych_bot.events_class WHERE active = 0 AND cycle = 0');
    // Формируем имя файла дампа
        const filename = `./ivanych_bot/ivanych_bot_${getDateTimeBD()}.sql`
        // Создаем файловый поток для записи дампа
        const writeStream = fs.createWriteStream(filename)
        // Формируем команду для создания дампа
        // Запускаем процесс создания дампа и записи его в файл
        const mysqldump = spawn('mysqldump', [ '-u', dbConfig.user, `-p${dbConfig.password}`, dbConfig.database ])
        mysqldump
        .stdout
        .pipe(writeStream)
        .on('finish', () => {
            // Создаем подключение к FTP-серверу
            const ftpClient = new Client()
            ftpClient.connect(ftpConfig)

            // Ожидаем события соединения к FTP-серверу
            ftpClient.on('ready', async () => {
                // Загружаем файл дампа на FTP-сервер
                const filenameFtp = `ivanych_bot_${getDateTimeBD()}.zip`
                try {
                    const fnZip = filename.slice(0, filename.lastIndexOf('.')) + '.zip'
                    const output = fs.createWriteStream(fnZip)
                    const archive = archiver('zip', {
                        zlib: { level: 9 } // уровень сжатия
                    });
                    // добавляем файл в архив
                    archive.file(filename, {name: 'ivanych_bot.sql'})
                    // завершаем архивирование
                    archive.finalize();
                    // обработка событий архивирования
                    archive.on('error', (err) => {
                        console.log("!!!CATCH fileToArch:", err)
                    });
                
                    output.on('close', () => {
                        ftpClient.put(fnZip, filenameFtp, (err) => {
                            if (err) {
                                console.error('Ошибка загрузки файла на FTP-сервер:', err);
                            }
                            // Закрываем соединение с FTP-сервером и удаляем файл дампа
                            ftpClient.end((err) => {
                                if (err) {
                                    console.error('Ошибка закрытия соединения с FTP-сервером:', err);
                                }
                            });
                            fs.unlink(filename, (err) => {
                                if (err) {
                                    console.error('Ошибка удаления файла дампа:', err);
                                } 
                            });
                            fs.unlink(fnZip, (err) => {
                                if (err) {
                                    console.error('Ошибка удаления файла дампа:', err);
                                } 
                            });
                        });
                    });
                
                    output.on('end', () => {
                        console.log('Соединение потока закрыто');
                    });
                
                    archive.pipe(output);
                    
                } catch(err){
                    console.log("!!!CATCH:", err)
                }
            });

            // Ожидаем события ошибки соединения к FTP-серверу
            ftpClient.on('error', (err) => {
                console.error('Ошибка подключения к FTP-серверу:', err);
            });
        })
        .on('error', (err) => {
          console.log(err)
        })
        connection.end();
}

export default backup