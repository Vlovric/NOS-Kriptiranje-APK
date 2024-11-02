const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    // generirat tajni kljuc, prikazat u textarea i zapisat u file
    var secretKey = generateSecretKey();
    var secretKeyTextArea = document.getElementById('tajniKljuc');
    secretKeyTextArea.value = secretKey;
    ipcRenderer.send('write-to-file', { fileType: 'tajni_kljuc', data: secretKey });

    //generirat javni i privatni kljuc, prikazat u textarea i zapisat u file
    
});

function generateSecretKey(){
    return crypto.randomBytes(32).toString('hex');
}

