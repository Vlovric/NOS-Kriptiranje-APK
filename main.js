const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs-extra')

const files = [
  'kriptirani_tekst.txt',
  'potpis.txt',
  'sazetak.txt',
  'javni_kljuc.txt',
  'privatni_kljuc.txt',
  'tajni_kljuc.txt',
];

const fileMap = {
  kriptirani_tekst: 'kriptirani_tekst.txt',
  potpis: 'potpis.txt',
  sazetak: 'sazetak.txt',
  javni_kljuc: 'javni_kljuc.txt',
  privatni_kljuc: 'privatni_kljuc.txt',
  tajni_kljuc: 'tajni_kljuc.txt',
};

const filesToClear = [
  'kriptirani_tekst.txt',
  'potpis.txt',
  'sazetak.txt',
];

const dir = path.join(app.getPath('userData'), 'datoteke');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  win.loadFile('Pocetni/index.html')
}

function initializeFiles(){
  fs.ensureDirSync(dir);

  filesToClear.forEach((file) => {
    const filePath = path.join(dir, file);
    fs.writeFileSync(filePath, ''); // Clear the file content
  });

  // Ensure other files exist without clearing them
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, ''); // Create the file only if it doesn't exist
    }
  });
}

function writeToFile(){
  ipcMain.on('write-to-file', (event, { fileType, data }) => {

    const fileName = fileMap[fileType];
    if(!fileName){
      event.reply('write-to-file-reply', 'ne postoji takav file');
      return;
    }
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, data);
    event.reply('write-to-file-reply', 'uspjesno');
  });
}

function readFromFile(){
  ipcMain.on('read-from-file', (event, { fileType }) => {
    const fileName = fileMap[fileType];
    if(!fileName){
      event.reply('read-from-file-reply', 'ne postoji takav file');
      return;
    }
    const filePath = path.join(dir, fileName);
    const data = fs.readFileSync(filePath);
    event.reply('read-from-file-reply', data);
  });
}

app.whenReady().then(() => {
  createWindow()
  initializeFiles();
  writeToFile();
  readFromFile();

  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})