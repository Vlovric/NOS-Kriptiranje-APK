function setupDropArea(dropAreaId, handleFileCallback) {
    const dropArea = document.getElementById(dropAreaId);

    dropArea.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            handleFileCallback(file);
            dropArea.textContent = file.name;
        };
        fileInput.click();
    });

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = 'var(--color-20)';
        dropArea.style.color = 'white';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.backgroundColor = 'var(--color-10)';
        dropArea.style.color = 'var(--color-30)';
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = 'var(--color-10)';
        dropArea.style.color = 'var(--color-30)';
        const file = event.dataTransfer.files[0];
        handleFileCallback(file);
        dropArea.textContent = file.name;
    });
}

function handleFile(file, textareaId) {
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById(textareaId).value = event.target.result;
    };
    reader.readAsText(file);
}