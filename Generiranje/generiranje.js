const { ipcRenderer } = require('electron');

document.getElementById('saveButton').addEventListener('click', () => {
  const inputText = document.getElementById('inputText').value;
  const fileType = 'tajni_kljuc';
  ipcRenderer.send('write-to-file', { fileType, data: inputText });
});

ipcRenderer.on('write-to-file-response', (event, response) => {
  console.log(response);
});