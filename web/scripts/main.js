const HALLOWEEN_THEME_DATA = {
    from: "01/10",
    to: "02/11",
    css: "css/event/halloween.css"
}

const appendCssFile = url => {
    const head = document.getElementsByTagName("head")[0]
    const link = document.createElement("link")
    head.appendChild(link)

    link.type = "text/css"
    link.rel = "stylesheet"
    link.href = url
}

const isTodayBetween = (from, to) => {
    const [fromDay, fromMonth] = from.split("/")
    const [toDay, toMonth] = to.split("/")
    const now = new Date()

    return new Date(now.getFullYear(), parseInt(fromMonth) - 1, fromDay) < now && now < new Date(now.getFullYear(), parseInt(toMonth) - 1, toDay)
}

const halloweenCheck = () => {
    if (isTodayBetween(HALLOWEEN_THEME_DATA.from, HALLOWEEN_THEME_DATA.to)) {
        appendCssFile(HALLOWEEN_THEME_DATA.css)
    }
}

const setupPage = () => {
    halloweenCheck()
}
setupPage()