let uploadingTexts = ["Subiendo el archivo"]

const setupUploadingImage = () => {
    const uploadingImageElement = document.getElementById("uploading-image");
    if (!uploadingImageElement) return;

    uploadingImageElement.src = `resources/media/cornamusa/traveling_pat_${Math.ceil(Math.random() * 6)}.gif`
}

const setupUploadingTexts = () => {
    fetch("https://static.lemniscata.net/uploading_file_texts.txt", {
        method: "GET",
        redirect: "follow"
    })
    .then(response => response.text())
    .then(data => data.split("\n"))
    .then(data => uploadingTexts = data)
    .catch(error => console.error(error))
}

const updateUploadingText = () => {
    const selectedText = uploadingTexts[Math.floor(Math.random() * uploadingTexts.length)]

    const uploadingSplashElement = document.getElementById("uploading-splash")
    if (!uploadingSplashElement) return;

    uploadingSplashElement.innerHTML = selectedText
}

const setupSubmitListener = () => {
    const formElement = document.getElementById("upload-form")
    if (!formElement) return;

    formElement.addEventListener("submit", event => {
        event.preventDefault()

        const fileInputElement = document.getElementById("file-input")
        const codeInputElement = document.getElementById("code-input")
        if (!fileInputElement || !codeInputElement) return;

        if (fileInputElement.files.length == 1) {
            showUploading()

            setTimeout(() => sendFile(codeInputElement.value, event.target), 2000)
        }
    })
}

const sendFile = async (code, form) => {
    console.log("sending file...")

    fetch("https://webapi.lemniscata.net/cornamusa/code?code=" + code, {
        method: "GET",
        redirect: "follow"
    })
        .then(response => {
            if (response.status === 200) {
                fetch("https://webapi.lemniscata.net/cornamusa/file", {
                    method: "POST",
                    body: new FormData(form)
                })
                    .then(uploadResponse => {
                        if (uploadResponse.status == 200) {
                            uploadResponse.json()
                                .then(result => {
                                    const resultUrl = result.url;
                                    showUploadSuccess(resultUrl);
                                })
                                .catch(error => {
                                    showUploadFailed("Fallo de red, posiblemente")
                                    console.log("Error parseando json de /cornamusa/file:", error)
                                })
                        } else {
                            showUploadFailed(response.status)
                            console.log("Respuesta de /cornamusa/file con código " + code + ":", response.status)
                        }
                    })
                    .catch(error => {
                        console.log("Fallo al subir el archivo:", error)
                        showUploadFailed("Fallo de red, seguramente")
                    })
            } else {
                showUploadFailed(response.status)
                console.log("Respuesta de /cornamusa/code con código " + code + ":", response.status)
            }
        })
        .catch(error => {
            console.log("Fallo al comprobar el código:", error)
            showUploadFailed("Fallo de red, probablemente")
        })

    
}

const hideAllSections = () => {
    const uploadForm = document.getElementById("upload-container")
    const uploading = document.getElementById("uploading-container")
    const uploadSuccess = document.getElementById("upload-success-container")
    const uploadFailed = document.getElementById("upload-failed-container")

    uploadForm.style.display = 'none'
    uploading.style.display = 'none'
    uploadSuccess.style.display = 'none'
    uploadFailed.style.display = 'none'
}

const showUploadForm = () => {
    hideAllSections()
    const section = document.getElementById("upload-container")
    section.style.display = ''
}

const showUploading = () => {
    hideAllSections()
    const section = document.getElementById("uploading-container")
    section.style.display = ''
}

const showUploadSuccess = url => {
    hideAllSections()
    const section = document.getElementById("upload-success-container")
    section.style.display = ''

    if (url) {
        const linkField = document.getElementById("result-link");
        linkField.innerHTML = url

        const copyConfirm = document.getElementById("link-copy-confirmation");

        linkField.addEventListener("click", event => {
            navigator.clipboard.writeText(url)
            copyConfirm.style = ""

            setTimeout(() => {
                copyConfirm.style = "display: none;"
            }, 1500)
        })
    }
}

const showUploadFailed = reason => {
    hideAllSections()
    const section = document.getElementById("upload-failed-container")
    section.style.display = ''

    if (reason) {
        const failField = document.getElementById("fail-reason");
        failField.innerHTML = reason

        failField.addEventListener("click", event => {
            navigator.clipboard.writeText(url)
        })
    }
}

showUploadForm()

setupSubmitListener()
setupUploadingTexts()
setupUploadingImage()
setInterval(updateUploadingText, 7500)