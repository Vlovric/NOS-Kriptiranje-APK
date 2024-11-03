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
            ipcRenderer.send('read-from-file', { fileType: 'privatni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    const privKey = data.trim();
                    const parts = text.split(':');
                    const encryptedSymKey = Buffer.from(parts[0], 'hex');
                    const iv = Buffer.from(parts[1], 'hex');
                    const encryptedText = parts[2];

                    const symKey = crypto.privateDecrypt(privKey, encryptedSymKey);

                    const decipher = crypto.createDecipheriv('aes-256-cbc', symKey, iv);
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