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

                    
                    const hash = crypto.createHash('sha256').update(text).digest('hex');
                    ipcRenderer.send('write-to-file', { fileType: 'sazetak', data: hash });

                    const signature = crypto.privateEncrypt(privateKey, Buffer.from(hash, 'hex')).toString('hex');


                    
                    /*
                    const sign = crypto.createSign('SHA256');
                    sign.update(hash);
                    sign.end();
                    const signature = sign.sign(privateKey, 'hex');
                    */

                    ipcRenderer.send('write-to-file', { fileType: 'potpis', data: signature });
                    resolve({hash, signature});
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
});