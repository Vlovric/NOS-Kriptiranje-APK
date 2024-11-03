const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    setupDropArea('drop-area', (file) => {
        handleFile(file, 'input-textarea');
    });

    document.getElementById('decrypt-button').addEventListener('click', async () => {
        const inputText = document.getElementById('input-textarea').value;
        try {
            const decryptedText = await decryptText(inputText);
            document.getElementById('output-textarea').value = decryptedText;
        } catch (error) {
            console.error('Error decrypting text:', error);
        }
    });

    function decryptText(text) {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('read-from-file', { fileType: 'tajni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    const key = Buffer.from(data.trim(), 'hex');
                    const parts = text.split(':');
                    const iv = Buffer.from(parts[0], 'hex');
                    const encryptedText = parts[1];
                    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    resolve(decrypted);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});