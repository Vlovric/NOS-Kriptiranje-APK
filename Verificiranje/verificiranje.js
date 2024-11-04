const { ipcRenderer } = require('electron');
const crypto = require('crypto');

document.addEventListener("DOMContentLoaded", function() {
    setupDropArea('drop-area-1', (file) => {
        handleFile(file, 'invisible-textarea-1');
    });
    setupDropArea('drop-area-2', (file) => {
        handleFile(file, 'invisible-textarea-2');
    });

    document.getElementById('verify-button').addEventListener('click', async () => {
        document.getElementById('invisible-textarea-1').innerText = '';
        document.getElementById('invisible-textarea-2').innerText = '';
        const inputText = document.getElementById('invisible-textarea-1').value;
        const signature = document.getElementById('invisible-textarea-2').value;
        try {
            const {realHash, givenHash, result} = await signText(inputText, signature);
            document.getElementById('input-textarea').value = realHash;
            document.getElementById('output-textarea').value = givenHash;
            writeMessage(result);
        } catch (error) {
            console.error('Error encrypting text:', error);
            writeMessage(false);
        }
    });

    function signText(text, signature) {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('read-from-file', { fileType: 'javni_kljuc' });
            ipcRenderer.once('read-from-file-reply', (event, data) => {
                try {
                    const publicKey = data.trim();
                    const realHash = crypto.createHash('sha256').update(text).digest('hex');
                    console.log("Hash teksta je: " + realHash);
                    console.log("Potpis je: " + signature);
                    console.log("Javni ključ je: " + publicKey);

                    const givenHash = crypto.publicDecrypt(publicKey, Buffer.from(signature, 'hex')).toString('hex');
                    const result = realHash === givenHash;
                    
                    /*
                    const verify = crypto.createVerify('SHA256');
                    verify.update(realHash);
                    verify.end();
                    const result = verify.verify(publicKey, signature, 'hex');
                    */

                    ipcRenderer.send('write-to-file', { fileType: 'verif_sazetak', data: givenHash });
                    resolve({realHash, givenHash, result});
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    function writeMessage(result){
        const messageElement = document.getElementById('poruka');
        const message = result ? 'Potpis je valjan!' : 'Potpis nije valjan!';
        messageElement.innerText = message;
        messageElement.style.color = result ? 'green' : 'red';
    }
});
/*
trenutno ako je tekst mijenjan onda se hashevi ne poklapaju i vrati false
ako je potpis mijenjan onda baci error i sve ostane
*/

/* TODO
Nakon button pressa clearat oba text area
Ako je error onda ispisat da je potpis mijenjan


*/