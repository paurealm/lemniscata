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

            const file = fileInputElement.files[0]
            const reader = new FileReader()

            reader.addEventListener("loadend", event => {
                sendFile(codeInputElement.value, event.target.result)
            })

            reader.readAsArrayBuffer(file)
        }
    })
}

const sendFile = (code, file) => {
    console.log("sending file...")

    fetch("https://webapi.lemniscata.net/upload_cornamusa_file", {
        method: "POST",
        body: [],
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
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
}

const showUploadFailed = reason => {
    hideAllSections()
    const section = document.getElementById("upload-failed-container")
    section.style.display = ''
}

showUploadForm()

setupSubmitListener()
setupUploadingTexts()
setupUploadingImage()
setInterval(updateUploadingText, 7500)