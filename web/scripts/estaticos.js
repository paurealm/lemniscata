const setupFiles = () => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;

    fetch("https://webapi.lemniscata.net/static_lookup", {
        method: "GET",
        redirect: "follow"
    })
    .then(response => response.json().files)
    .then(files => {
        for (let file of files) {
            console.log(file);
            
            const fileEntry = document.createElement("p");
            fileEntry.innerHTML = file;
            fileContainer.appendChild(fileEntry)

        }
    })
    .catch(error => console.error(error))
        
}

setupFiles();