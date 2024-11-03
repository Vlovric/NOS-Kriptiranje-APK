const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    generateSecretKey();
    generatePublicPrivateKeys();

});

function generateSecretKey(){
    var secretKey = crypto.randomBytes(32).toString('hex');
    var secretKeyTextArea = document.getElementById('tajniKljuc');
    secretKeyTextArea.value = secretKey;
    ipcRenderer.send('write-to-file', { fileType: 'tajni_kljuc', data: secretKey });
}

function generatePublicPrivateKeys(){
    crypto.generateKeyPair('rsa', {
        modulusLength: 2048,
        publicKeyEncoding:{
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding:{
            type: 'pkcs8',
            format: 'pem'
        }
    }, (err, publicKey, privateKey) => {
        if(err) throw err;
        document.getElementById('javniKljuc').value = publicKey;
        document.getElementById('privatniKljuc').value = privateKey;
        ipcRenderer.send('write-to-file', { fileType: 'javni_kljuc', data: publicKey });
        ipcRenderer.send('write-to-file', { fileType: 'privatni_kljuc', data: privateKey });
    });
}

