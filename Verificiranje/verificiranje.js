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
        document.getElementById('input-textarea').innerText = '';
        document.getElementById('output-textarea').innerText = '';
        const inputText = document.getElementById('invisible-textarea-1').value;
        const signature = document.getElementById('invisible-textarea-2').value;
        try {
            const {realHash, givenHash, result} = await signText(inputText, signature);
            document.getElementById('input-textarea').value = realHash;
            document.getElementById('output-textarea').value = givenHash;
            writeMessage(result);
        } catch (error) {
            console.error('Error encrypting text:', error);
            if(error.message == '3'){
                writeMessage(3);
            } else if(error.message == '4'){
                writeMessage(4);
            }
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
                    const compare = realHash === givenHash;
                    const result = compare ? 1 : 0;

                    
                    /*
                    const verify = crypto.createVerify('SHA256');
                    verify.update(realHash);
                    verify.end();
                    const result = verify.verify(publicKey, signature, 'hex');
                    */

                    ipcRenderer.send('write-to-file', { fileType: 'verif_sazetak', data: givenHash });
                    resolve({realHash, givenHash, result});
                } catch (error) {
                    if (error.message.includes('OPENSSL_internal:BLOCK_TYPE_IS_NOT_01')) {
                        reject(new Error('3'));
                    } else if (error.message.includes('DATA_LEN_NOT_EQUAL_TO_MOD_LEN')) {
                        reject(new Error('4'));
                    } else {
                        reject(error);
                    }
                }
            });
        });
    }

    function writeMessage(result){
        const messageElement = document.getElementById('poruka');
        var message;
        switch(result){
            case 0:
                message = 'Tekst je manipuliran!';
                messageElement.style.color = 'red';
                break;
            case 1:
                message = 'Potpis je valjan!';
                messageElement.style.color = 'green';
                break;
            case 3:
                message = 'Potpis je manipuliran!';
                messageElement.style.color = 'red';
                break;
            case 4:
                message = 'Krivi broj znakova u potpisu!';
                messageElement.style.color = 'red';
            default: break;
        }
        messageElement.innerText = message;
    }
});
/*
OPENSSL_internal:BLOCK_TYPE_IS_NOT_01 - 3
    ako dobar tekst sa novim potpisom
    ako promijenjena datoteka sa potpisom al isti broj charactera
DATA_LEN_NOT_EQUAL_TO_MOD_LEN - 3
    ako krivi broj charactera u potpisu
*/

/* TODO
Ako je error onda ispisat da je potpis mijenjan


*/