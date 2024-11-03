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
            ipcRenderer.send('read-from-file', { fileType: 'javni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                publicKey = data.trim();
                const { encryptedText, symmetricKey, iv } = symEncryptText(text);
                const encryptedSymKey = crypto.publicEncrypt(publicKey, symmetricKey).toString('hex');
                const finalEncryptedText = encryptedSymKey + ':' + iv.toString('hex') + ':' + encryptedText;
                ipcRenderer.send('write-to-file', { fileType: 'kriptirani_tekst', data: finalEncryptedText });
                resolve(finalEncryptedText);
            });
        });
    }

    function symEncryptText(text) {
        const symmetricKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
        let encryptedText = cipher.update(text, 'utf8', 'hex');
        encryptedText += cipher.final('hex');
        return { encryptedText, symmetricKey, iv };
    }
});