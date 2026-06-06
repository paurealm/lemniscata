const setupFiles = () => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;

    fetch("https://webapi.lemniscata.net/static_lookup")
        .then(response => response.body.files)
        .then(files => {
            for (let file of files) {
                console.log(file);
                
                const fileEntry = document.createElement("p");
                fileEntry.innerHTML = file;
                fileContainer.appendChild(fileEntry)

            }
        })
        
}

setupFiles();