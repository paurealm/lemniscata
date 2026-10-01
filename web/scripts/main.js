const formatEmojis = emojiString => {
    const segmenter = new Intl.Segmenter(undefined, {
        granularity: "grapheme"
    });

    return [...segmenter.segment(emojiString)].map(element => element.segment);
}

const HALLOWEEN_THEME_DATA = {
    from: "01/10",
    to: "02/11",
    css: "css/event/halloween.css",
    emojis: formatEmojis("🎃👻🍬🦇💀🧡🕸️🪦🧟🐈‍⬛🕯️🔮🌙"),
    decoratedTexts: [
        "#links > *",
        "#content-windows > div > span"
    ]
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

const randomEmojiOfList = list => {
    return list[Math.floor(Math.random() * list.length)]
}

const appendEmojiBeforeAndAfter = (query, emojiList) => {
    for (let element of document.querySelectorAll(query)) {
        const emoji = randomEmojiOfList(emojiList);
        element.innerHTML = `${emoji}${element.innerHTML}${emoji}`
    }
}

const halloweenCheck = () => {
    if (isTodayBetween(HALLOWEEN_THEME_DATA.from, HALLOWEEN_THEME_DATA.to) || new URLSearchParams(location.search).has("spooky")) {
        appendCssFile(HALLOWEEN_THEME_DATA.css)

        for (let text of HALLOWEEN_THEME_DATA.decoratedTexts) {
            appendEmojiBeforeAndAfter(text, HALLOWEEN_THEME_DATA.emojis)
        }

        if (document.title.startsWith("Lemniscata")) {
            document.title = document.title.replace("Lemniscata", `${randomEmojiOfList(HALLOWEEN_THEME_DATA.emojis)} Lemniscata ${randomEmojiOfList(HALLOWEEN_THEME_DATA.emojis)}`) 
        } else {
            document.title = `${randomEmojiOfList(HALLOWEEN_THEME_DATA.emojis)} ${document.title}`
        }
    }
}

const setupPage = () => {
    halloweenCheck()
}
setupPage()