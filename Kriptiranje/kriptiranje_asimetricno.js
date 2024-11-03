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
            ipcRenderer.send('read-from-file', { fileType: 'privatni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    //logika
                    resolve(encryptedText);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});