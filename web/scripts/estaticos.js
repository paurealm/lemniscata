const extensionColorMap = new Map();

const imageColor = "rgb(30, 66, 143)";
extensionColorMap.set("png", imageColor)
extensionColorMap.set("webp", imageColor)
extensionColorMap.set("jpg", imageColor)
extensionColorMap.set("jpeg", imageColor)
extensionColorMap.set("jpe", imageColor)
extensionColorMap.set("gif", imageColor)

const videoColor = "rgb(124, 30, 143)"
extensionColorMap.set("mp4", videoColor)
extensionColorMap.set("mov", videoColor)
extensionColorMap.set("webm", videoColor)
extensionColorMap.set("mkv", videoColor)

const textFileColor = "rgb(30, 143, 105)"
extensionColorMap.set("txt", textFileColor)
extensionColorMap.set("json", textFileColor)
extensionColorMap.set("log", textFileColor)

const audioColor = "rgb(143, 30, 45)"
extensionColorMap.set("mp3", audioColor)
extensionColorMap.set("wav", audioColor)
extensionColorMap.set("m4a", audioColor)
extensionColorMap.set("wma", audioColor)

const zipColor = "rgb(59, 31, 12)"
extensionColorMap.set("zip", zipColor)
extensionColorMap.set("7z", zipColor)
extensionColorMap.set("rar", zipColor)
extensionColorMap.set("gz", zipColor)
extensionColorMap.set("tar", zipColor)

const executableColor = "rgb(151, 141, 0)"
extensionColorMap.set("exe", executableColor)
extensionColorMap.set("msi", executableColor)
extensionColorMap.set("deb", executableColor)
extensionColorMap.set("dmg", executableColor)
extensionColorMap.set("jar", executableColor)

const miscColor = "rgb(27, 128, 52)"
extensionColorMap.set("torrent", miscColor)
extensionColorMap.set("pdf", miscColor)
extensionColorMap.set("bbmodel", miscColor)

const extractFileName = name => {
    const parts = name.split(".")

    if (parts.length === 1) {
        return parts[0]
    } else {
        parts.pop()
        return parts.join(".")
    }

}

const extractFileExtension = name => {
    const parts = name.split(".")
    if (parts.length < 2) {
        return ""
    } else {
        return parts[parts.length - 1]
    }
}

const createFileEntries = fileList => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;

    for (let file of fileList) {
        if (file === "index.html") continue;
        const link = `https://static.lemniscata.net/${file}`

        const fileEntry = document.createElement("a");
        fileEntry.className = "file-entry"
        fileEntry.href = link
        fileEntry.target = "_blank"

        const fileName = extractFileName(file)
        const fileExtension = extractFileExtension(file)

        fileEntry.innerHTML = `${fileName}${fileExtension ? "<span class=\"file-extension\" style=\"" + (extensionColorMap.has(fileExtension) ? "background-color: " + extensionColorMap.get(fileExtension) : "") + "\">." + fileExtension + "</span>" : ""}`;
        fileContainer.appendChild(fileEntry)

        fileEntry.addEventListener("click", event => {
            console.log(event)
            event.preventDefault();
            navigator.clipboard.writeText(link)
        })
    }
}

const setupFiles = () => {

    fetch("https://webapi.lemniscata.net/static_lookup", {
        method: "GET",
        redirect: "follow"
    })
    .then(response => response.json())
    .then(data => createFileEntries(data.files))
    .catch(error => console.error(error))
}

setupFiles();