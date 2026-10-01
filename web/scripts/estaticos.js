const extensionColorMap = new Map();

const setupTypes = () => {
    const imageTypes = [
        "png", "webp", "jpg", "jpeg", "jpe", "jfif", "gif",
        "bmp", "dib", "tif", "tiff", "avif", "heic", "heif",
        "ico", "cur", "svg", "svgz", "raw", "cr2", "cr3",
        "nef", "nrw", "arw", "orf", "rw2", "dng", "raf",
        "pef", "srw", "x3f", "3fr", "erf", "kdc", "mrw",
        "psd", "psb", "xcf", "ai", "eps", "indd", "kra",
        "clip", "kra", "ase", "aseprite", "dds", "exr", "hdr",
        "tga", "pcx", "ppm", "pgm", "pbm", "pnm", "qoi"
    ];
    imageTypes.forEach(type => extensionColorMap.set(type, "rgb(30, 66, 143)"));

    const videoTypes = [
        "mp4", "m4v", "mov", "webm", "mkv", "avi", "wmv",
        "flv", "f4v", "f4p", "mpeg", "mpg", "mpe", "mpv",
        "m2v", "m2ts", "mts", "ts", "vob", "ogv", "ogg",
        "3gp", "3g2", "asf", "rm", "rmvb", "divx", "xvid",
        "mxf", "dv", "qt", "yuv", "amv", "nsv", "mjpg",
        "mjpeg", "hevc", "h264", "h265", "av1", "ivf"
    ];
    videoTypes.forEach(type => extensionColorMap.set(type, "rgb(124, 30, 143)"));

    const textFileTypes = [
        "txt", "text", "md", "markdown", "mdown", "mkd",
        "json", "json5", "jsonl", "ndjson", "log", "log1",
        "log2", "csv", "tsv", "xml", "xhtml", "html", "htm",
        "css", "scss", "sass", "less", "js", "mjs", "cjs",
        "jsx", "ts", "tsx", "java", "kt", "kts", "scala",
        "c", "h", "cpp", "cc", "cxx", "hpp", "cs", "fs",
        "fsx", "vb", "go", "rs", "swift", "m", "mm",
        "py", "pyw", "rb", "php", "pl", "pm", "lua",
        "r", "dart", "ex", "exs", "erl", "hrl", "hs",
        "lhs", "clj", "cljs", "groovy", "sh", "bash", "zsh",
        "fish", "bat", "cmd", "ps1", "psm1", "sql", "graphql",
        "gql", "yaml", "yml", "toml", "ini", "cfg", "conf",
        "config", "env", "properties", "editorconfig", "gitignore",
        "dockerfile", "makefile", "cmake", "tex", "latex",
        "rst", "org", "rtf", "diff", "patch"
    ];
    textFileTypes.forEach(type => extensionColorMap.set(type, "rgb(30, 143, 105)"));

    const audioTypes = [
        "mp3", "wav", "m4a", "wma", "aac", "flac", "ogg",
        "oga", "opus", "aiff", "aif", "aifc", "alac", "ape",
        "wv", "tta", "tak", "dsf", "dff", "mka", "mid",
        "midi", "kar", "amr", "awb", "au", "snd", "voc",
        "ac3", "dts", "eac3", "m4b", "m4p", "mp2", "mpa",
        "ra", "ram", "spx", "caf", "3ga", "gsm", "mod",
        "xm", "s3m", "it", "mtm", "umx"
    ];
    audioTypes.forEach(type => extensionColorMap.set(type, "rgb(143, 30, 45)"));

    const zipTypes = [
        "zip", "7z", "rar", "gz", "gzip", "tar", "tgz",
        "bz", "bz2", "tbz", "tbz2", "xz", "txz", "z",
        "zst", "lz", "lz4", "lzma", "lzh", "cab", "arj",
        "ace", "arc", "pak", "sit", "sitx", "jar", "war",
        "ear", "apk", "ipa", "xpi", "crx", "deb", "rpm",
        "pkg", "dmg", "msix", "appx", "whl", "egg", "gem",
        "nupkg", "vsix", "aar"
    ];
    zipTypes.forEach(type => extensionColorMap.set(type, "rgb(59, 31, 12)"));

    const executableTypes = [
        "exe", "msi", "msix", "msp", "com", "scr", "bat",
        "cmd", "ps1", "psm1", "dll", "sys", "drv", "ocx",
        "cpl", "efi", "bin", "run", "appimage", "deb", "rpm",
        "pkg", "dmg", "app", "apk", "ipa", "jar", "war",
        "ear", "class", "dex", "so", "dylib", "a", "lib",
        "elf", "out", "elf32", "elf64", "axf", "hex", "img"
    ];
    executableTypes.forEach(type => extensionColorMap.set(type, "rgb(151, 141, 0)"));

    const miscTypes = [
        "torrent", "pdf", "bbmodel", "epub", "mobi", "azw",
        "azw3", "fb2", "djvu", "cbr", "cbz", "cb7", "cbt",
        "doc", "docx", "docm", "dot", "dotx", "xls", "xlsx",
        "xlsm", "xlsb", "xlt", "xltx", "ppt", "pptx", "pptm",
        "pps", "ppsx", "odt", "ods", "odp", "odg", "odf",
        "pages", "numbers", "key", "pub", "vsd", "vsdx",
        "dwg", "dxf", "stl", "obj", "fbx", "blend", "3ds",
        "max", "ma", "mb", "dae", "gltf", "glb", "3mf",
        "step", "stp", "iges", "igs", "skp", "unitypackage",
        "pak", "sav", "save", "rom", "iso", "img", "bin",
        "cue", "nrg", "toast", "vmdk", "vdi", "vhd", "vhdx",
        "ova", "ovf", "bak", "backup", "old", "tmp", "temp",
        "dat", "db", "sqlite", "sqlite3", "db3", "mdb", "accdb"
    ];
    miscTypes.forEach(type => extensionColorMap.set(type, "rgb(27, 128, 52)"));
}
setupTypes()

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

const listFile = fileData => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;

    const link = `https://static.lemniscata.net/${fileData.name}`

    const fileEntry = document.createElement("a");
    fileEntry.className = "file-entry"
    fileEntry.href = link
    fileEntry.target = "_blank"

    const fileName = extractFileName(fileData.name)
    const fileExtension = extractFileExtension(fileData.name)

    fileEntry.innerHTML = `${fileName}${fileExtension ? "<span class=\"file-extension\" style=\"" + (extensionColorMap.has(fileExtension) ? "background-color: " + extensionColorMap.get(fileExtension) : "") + "\">." + fileExtension + "</span>" : ""}`;
    fileContainer.appendChild(fileEntry)

    fileEntry.addEventListener("click", event => {
        event.preventDefault();
        navigator.clipboard.writeText(link)
    })
}

const renderDirectory = (name, link) => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;

    const directoryEntry = document.createElement("a");
    directoryEntry.className = "file-entry directory"
    directoryEntry.href = link

    directoryEntry.innerHTML = `${name}`;
    fileContainer.appendChild(directoryEntry)

    directoryEntry.addEventListener("click", event => {
        event.preventDefault();
        history.pushState({}, '', link)
        setupFiles()
    })
}

const addParentDirectoryIfSubfolder = () => {
    const subfolder = new URLSearchParams(location.search).get("subfolder");
    if (subfolder) {
        const result = subfolder?.split("/").slice(0, -1).join("/") ?? "";
        const link = result == "" ? "?" : "?subfolder=" + result

        renderDirectory("⮤ ..", link)
    }
}

const listDirectory = directoryData => {
    const subfolder = new URLSearchParams(location.search).get("subfolder")
    const link = `?subfolder=${subfolder ? subfolder + "/" : ""}${directoryData.name}`
    renderDirectory(directoryData.name, link)
}

const createEntries = response => {
    const fileContainer = document.getElementById("file-list")
    if (!fileContainer) return;
    fileContainer.innerHTML = ''

    const groups = compileFilter(activeFilter)(response)

    for (let groupName in groups) {
        const group = groups[groupName]
        const fileList = group.filter(entry => entry.type == "file")
        const directoryList = group.filter(entry => entry.type == "directory")
        
        addParentDirectoryIfSubfolder()

        for (let directoryData of directoryList) {
            listDirectory(directoryData)
        }

        for (let fileData of fileList) {
            if (fileData.name === "index.html") continue;
            listFile(fileData)
        }
    }

}

const setupSearchBar = () => {
    const searchBar = document.getElementById("file-search-bar")
    if (!searchBar) return

    searchBar.addEventListener("input", event => {
        const value = event.target.value

        const newFilter = activeFilter
        if (value && value.length > 0) {
            newFilter.filters["name"] = {
                execute: filters.filterBy.name,
                argument: value
            }
        } else {
            delete newFilter.filters?.["name"]
            setFilter(newFilter)
        }
        setFilter(newFilter)
    })
}

const filters = {
    filterBy: {
        "extension": (file, allowedExtensions) => allowedExtensions.contains(extractFileExtension(file.name)),
        "name": (file, allowedName) => file.name.includes(allowedName)
    },
    sortBy: {
        "date": (a, b) => a.type == "directory" ? b.type == "directory" ? 0 : -1 : b.type == "directory" ? 1 : a.modTime > b.modTime ? -1 : 1,
        "name": (a, b) => a.name.localeCompare(b.name)
    },
    groupBy: {
        "extension": files => {
            const groups = {}
            files.forEach(file => {
                const extension = file.type == "directory" ? ".dir" : extractFileExtension(file.name)
                groups[extension] = [...groups[extension], file]
            })
            return groups
        }
    }
}

const compileFilter = ({
    filters,
    sorters,
    grouper
}) => contents => {

    const groups = grouper ? grouper(contents) : {".": contents}
    console.log(groups)

    for (let groupName in groups) {
        let groupContent = groups[groupName];

        for (let filterName in filters) {
            const filter = filters[filterName]
            groupContent = groupContent.filter(item => filter.execute(item, filter.argument))
        }

        for (let sorterName in sorters) {
            const sorter = sorters[sorterName]
            groupContent = groupContent.sort((a, b) => sorter(a, b))
        }

        groups[groupName] = groupContent
    }

    return groups;
    
}

const setFilter = filter => {
    activeFilter = filter;
    createEntries(cachedData)
}

let cachedData = {}
const defaultFilter = {
    filters: {},
    sorters: {
        "name": filters.sortBy.name
    },
    grouper: null
}
let activeFilter = {
    filters: {...defaultFilter.filters},
    sorters: {...defaultFilter.sorters},
    grouper: defaultFilter.grouper
}

const setupFiles = () => {
    const subfolder = new URLSearchParams(location.search).get("subfolder");

    fetch(`https://webapi.lemniscata.net/static_lookup${subfolder ? "?subfolder=" + subfolder : ""}`, {
        method: "GET",
        redirect: "follow"
    })
        .then(response => response.json())
        .then(data => {
            cachedData = data.contents
            createEntries(data.contents)
        })
        .catch(error => console.error(error))
}

const setupFilterButtons = () => {
    const clearFiltersButton = document.getElementById("clear-filters-button")
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
            setFilter({
                filters: {...defaultFilter.filters},
                sorters: {...defaultFilter.sorters},
                grouper: defaultFilter.grouper
            })
            document.getElementById("file-search-bar").value = ""
        })
    }

    const orderByButton = document.getElementById("order-by-button")
    if (orderByButton) {
        orderByButton.addEventListener("click", () => {
            const newFilter = {...activeFilter}
            delete newFilter.sorters["name"]
            delete newFilter.sorters["date"]

            if (orderByButton.value == "name") {
                orderByButton.value = "date"
                orderByButton.innerHTML = "Fecha"
            } else {
                orderByButton.value = "name"
                orderByButton.innerHTML = "Nombre"
            }

            const value = orderByButton.value

            newFilter.sorters[value] = filters.sortBy[value]
            setFilter(newFilter)

        })
    }
}

window.onload = () => {
    setupFiles()
    setupSearchBar()
    setupFilterButtons()
};