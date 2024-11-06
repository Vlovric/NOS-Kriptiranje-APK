const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    setupDropArea('drop-area', (file) => {
        handleFile(file, 'input-textarea');
    });

    document.getElementById('encrypt-button').addEventListener('click', async () => {
        const inputText = document.getElementById('input-textarea').value;
        try {
            const encryptedText = await encryptText(inputText);
            document.getElementById('output-textarea').value = encryptedText;
        } catch (error) {
            console.error('Error encrypting text:', error);
        }
    });

    function encryptText(text) {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('read-from-file', { fileType: 'tajni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    const key = Buffer.from(data.trim(), 'hex');
                    const iv = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
                    let encrypted = cipher.update(text, 'utf8', 'hex');
                    encrypted += cipher.final('hex');
                    const encryptedText = iv.toString('hex') + ':' + encrypted;
                    ipcRenderer.send('write-to-file', { fileType: 'kriptirani_tekst', data: encryptedText });
                    resolve(encryptedText);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});