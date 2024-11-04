const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    setupDropArea('drop-area', (file) => {
        handleFile(file, 'invisible-textarea');
    });

    document.getElementById('sign-button').addEventListener('click', async () => {
        const inputText = document.getElementById('invisible-textarea').value;
        try {
            const {hash, signature} = await signText(inputText);
            document.getElementById('input-textarea').value = hash;
            document.getElementById('output-textarea').value = signature;
        } catch (error) {
            console.error('Error encrypting text:', error);
        }
    });

    function signText(text) {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('read-from-file', { fileType: 'privatni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    const privateKey = data.trim(); // Ensure the private key is correctly formatted

                    // Create a hash of the text
                    const hash = crypto.createHash('sha256').update(text).digest('hex');
                    console.log("Hash teksta je: " + hash);
                    ipcRenderer.send('write-to-file', { fileType: 'sazetak', data: hash });

                    // Sign the hash with the private key
                    const sign = crypto.createSign('SHA256');
                    sign.update(hash);
                    sign.end();
                    const signature = sign.sign(privateKey, 'hex');
                    console.log("Potpis je: " + signature);

                    ipcRenderer.send('write-to-file', { fileType: 'potpis', data: signature });
                    resolve({hash, signature});
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});