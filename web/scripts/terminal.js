let selectedButton = -1;
let buttonsToSelect = 0;

let carrouselItems = 0;
let currentCarrouselOption = 0;

let savedInputText = null;

let menuStack = []

let libraryOptions = [
    "pepe luis",
    "la ramona",
    "J.C. bodoque",
    "pedro sánchez"
]

const COLORS = {
    PURPLE:    0,
    RED:      60,
    ORANGE:  110,
    GREEN:   170,
    CYAN:   -110,
    BLUE:   - 60
}

const setWallpaperColor = (color, brightness) => {
    const cover = document.getElementById("terminal-cover");
    cover.style.backdropFilter = `hue-rotate(${color}deg) brightness(${brightness ?? "100"}%)`
}

const SFX = {
    TERMINAL_START: "terminal_start.wav",
    TERMINAL_STARTUP: "terminal_startup.wav",
    TERMINAL_SHUTDOWN: "terminal_shutdown.wav",

    BUTTON_SELECT: "button_select.wav",
    BUTTON_PRESS: "button_press.wav",

    BACK_PRESS: "back_press.wav",
    BACK_BLOCKED_PRESS: "back_blocked_press.wav",

    ERROR: "error.wav",

    INPUT_KEY: "input_key.wav",

    SEND_MESSAGE_CONFIRMATION: "send_message_confirmation.wav",
    SEND_MESSAGE_DECLINE: "send_message_decline.wav",
    SEND_MESSAGE_CONFIRMED: "send_message_confirmed.wav",
    SEND_MESSAGE_SUCCESS: "send_message_success.wav",
}

const createAudio = (sound) => {
    const path = `./resources/media/terminal/sfx/${sound}`;
    return new Audio(path);
}

const playSound = (sound, volume) => {
    const audio = createAudio(sound);
    
    if (volume) {
        audio.volume = volume
    } else {
        audio.volume = sound == SFX.INPUT_KEY ? 0.1 : 0.3;
        audio.play()
    }
}

const handleSendMessage = () => {
    playSound(SFX.BUTTON_PRESS)
    addMenuToStack(SEND_MESSAGE_MENU)
}

const handleDecode = () => {
    playSound(SFX.BUTTON_PRESS)
    addMenuToStack(LIBRARY_MENU)
}

const handleExit = () => {
    playSound(SFX.TERMINAL_SHUTDOWN)
    addMenuToStack(TERMINAL_SHUTING_DOWN_SCREEN)
}

const handleKeyDownEvent = (event) => {
    //console.log(event)

    if (event.key == "ArrowDown") {

        if (buttonsToSelect > 0) {
            if (selectedButton >= buttonsToSelect) {
                selectedButton = 0;
            } else {
                selectedButton++
            }
            playSound(SFX.BUTTON_SELECT)
            refreshTerminal(true);
        } else if (currentCarrouselOption < (carrouselItems - 1)) {
            currentCarrouselOption ++;
            refreshCarrousel();
        }
        
    } else if (event.key == "ArrowUp") {

        if (buttonsToSelect > 0) {
            if (selectedButton <= -1) {
                selectedButton = buttonsToSelect - 1;
            } else {
                selectedButton--
            }
            playSound(SFX.BUTTON_SELECT)
            refreshTerminal(true);
        } else if (currentCarrouselOption > 0) {
            currentCarrouselOption --;
            refreshCarrousel();
        }
        
    } else if (event.key == "Enter" && !event.shiftKey) {
        const onEnter = menuStack[menuStack.length - 1].onEnter;
        if (onEnter) {
            onEnter();
        }
    } else if (event.key == "Escape" || ((event.key == "Q" || event.key == "q") && event.ctrlKey)) {
        const onBack = menuStack[menuStack.length - 1].onBack;
        if (onBack) {
            onBack();
        }
    }
}

const pressCurrentButton = () => {
    if (selectedButton >= 0 && selectedButton < buttonsToSelect) {
        const currentMenu = menuStack[menuStack.length - 1];
        const buttons = currentMenu.elements.filter(element => element.type === "button");
        if (buttons[selectedButton]) {
            buttons[selectedButton].action()
        }
    } else {

    }
}

const TERMINAL_OFF_SCREEN = {
    id: "idle",
    elements: [
        {
            id: "bios",
            type: "bios",
            text: "INSERTAR DISCO"
        }
    ],
    onEnter: () => {
        playSound(SFX.TERMINAL_START)
        setTimeout(() => {
            playSound(SFX.TERMINAL_STARTUP);
            addMenuToStack(MAIN_MENU)
        }, 3000)
        addMenuToStack({
            id: "starting",
            elements: [
                {
                    id: "loader",
                    type: "loader"
                }
            ]
        })
    },
    onShow: () => setWallpaperColor(COLORS.PURPLE, "0")
}

const TERMINAL_SHUTING_DOWN_SCREEN = {
    id: "shuting_down",
    elements: [],
    onShow: () => {
        setWallpaperColor(COLORS.PURPLE, 0)
        setTimeout(() => {
            addMenuToStack(TERMINAL_OFF_SCREEN)
        }, 5000)
    }
}

const MAIN_MENU = {
    id: "home",
    elements: [
        {
            id: "title",
            type: "title",
            text: "Terminal ∞"
        },
        {
            id: "sendMessage",
            type: "button",
            text: "Dejar una nota",
            action: handleSendMessage
        },
        {
            id: "notes",
            type: "button",
            text: "Biblioteca encriptada",
            action: handleDecode
        },
        {
            id: "exit",
            type: "button",
            text: "Apagar",
            action: handleExit
        }
    ],
    onEnter: () => pressCurrentButton(),
    onShow: () => setWallpaperColor(COLORS.PURPLE)
}

const SEND_MESSAGE_MENU = {
    id: "send_message",
    elements: [
        {
            id: "title",
            type: "title",
            text: "Dejar una nota"
        },
        {
            id: "description",
            type: "text",
            text: "Deja una nota para Paula. Escríbela anónimamente, o deja tu nombre al final, lo que prefieras !!"
        },
        {
            id: "message_input",
            type: "input"
        }
    ],
    onShow: () => setWallpaperColor(COLORS.BLUE),
    onEnter: () => {
        const inputText = document.getElementById("terminal-input").innerHTML.trim()
        if (inputText.length > 0) {
            
            playSound(SFX.SEND_MESSAGE_CONFIRMATION)
            addMenuToStack({
                id: "confirm_send_message",
                elements: [
                    {
                        id: "confirmation_text",
                        type: "text",
                        text: "¿Seguro que quieres enviar el mensaje? Pulsa intro de nuevo para confirmar."
                    }
                ],
                onEnter: () => {
                    playSound(SFX.SEND_MESSAGE_CONFIRMED)
                    
                    setTimeout(() => {
                        fetch("https://webapi.lemniscata.net/send_message", {
                            method: "POST",
                            body: JSON.stringify({
                                message: inputText
                            }),
                            headers: {
                                "Content-type": "application/json; charset=UTF-8"
                            }
                        })
                        .then(() => {
                            playSound(SFX.SEND_MESSAGE_SUCCESS)
                            addMenuToStack({
                                id: "message_sent",
                                elements: [
                                    {
                                        id: "success",
                                        type: "text",
                                        text: "Nota enviada !!"
                                    },
                                    {
                                        id: "thanks",
                                        type: "text",
                                        text: "Gracias por tu tiempo, toma un muac :3"
                                    }
                                ],
                                onBack: () => {}
                            })
                        })
                        .catch(() => {
                            playSound(SFX.ERROR)
                            addMenuToStack({
                                id: "message_sent_and_failed",
                                elements: [
                                    {
                                        id: "fail_report",
                                        type: "text",
                                        text: "Upsi, parece que algo ha fallado :("
                                    },
                                    {
                                        id: "ask_for_report",
                                        type: "text",
                                        text: "Coméntaselo a Paula, porfi"
                                    }
                                ],
                                onBack: () => {}
                            })
                        })
                        .finally(() => {
                            setTimeout(() => {
                                addMenuToStack(MAIN_MENU)
                            }, 3000)
                        })
                    }, 1000)

                    addMenuToStack({
                        id: "sending_message",
                        elements: [
                            {
                                id: "loader",
                                type: "loader"
                            },
                            {
                                id: "confirmation_text",
                                type: "text",
                                text: "Enviando mensaje"
                            }
                        ],
                        onBack: () => {}
                    })
                },
                onBack: () => {
                    savedInputText = inputText
                    playSound(SFX.SEND_MESSAGE_DECLINE)
                    popLastMenu();
                }
            })
        }
    },
    onBack: () => {
        playSound(SFX.BACK_PRESS)
        popLastMenu()
    }
}

const LIBRARY_MENU = {
    id: "library",
    elements: [
        {
            id: "title",
            type: "title",
            text: "Biblioteca encriptada"
        },
        {
            id: "description",
            type: "text",
            text: "Escritos para esas personitas especiales que me han hecho ser como soy hoy"
        },
        {
            id: "guide",
            type: "text",
            text: "Busca tu nombre y resuelve la clave en la siguiente pantalla para desencriptar tu carta :)"
        },
        {
            id: "selector",
            type: "carrousel",
            getOptions: () => libraryOptions
        }
    ],
    onShow: () => setWallpaperColor(COLORS.RED)
}

const renderTitle = (terminal, element) => {
    const titleElement = document.createElement("h3");
    titleElement.innerHTML = element.text;
    titleElement.className = "terminal-title"

    terminal.appendChild(titleElement);
}

const renderText = (terminal, element) => {
    const textElement = document.createElement("p");
    textElement.innerHTML = element.text;
    textElement.className = "terminal-text"

    terminal.appendChild(textElement);
}

const renderButton = (terminal, element, selected) => {
    const buttonElement = document.createElement("p");
    buttonElement.innerHTML = element.text;
    buttonElement.className = "terminal-button" + (selected ? " selected" : "");

    terminal.appendChild(buttonElement);
}

const renderInput = (terminal, element) => {
    const inputElement = document.createElement("p");
    inputElement.id = "terminal-input";
    inputElement.className = "terminal-input";
    inputElement.contentEditable = "plaintext-only";
    inputElement.spellcheck = false;

    if (savedInputText && savedInputText.length > 0) {
        inputElement.innerHTML = savedInputText
    }
    savedInputText = null;

    terminal.appendChild(inputElement);
    inputElement.focus()

    inputElement.addEventListener("input", (event) => playSound(SFX.INPUT_KEY))
}

const renderLoader = (terminal, element) => {
    const loaderElement = document.createElement("p");
    loaderElement.className = "terminal-loader";

    terminal.appendChild(loaderElement)
}

const renderBios = (terminal, element) => {
    const biosElement = document.createElement("p");
    biosElement.innerHTML = element.text;
    biosElement.className = "terminal-bios"

    terminal.appendChild(biosElement);
}

const renderCarrousel = (terminal, element) => {
    const options = element.getOptions();

    const carrouselContainer = document.createElement("div")
    carrouselContainer.id = "terminal-carrousel-container"
    carrouselContainer.className = "terminal-carrousel-container"

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const place = i - currentCarrouselOption;

        const optionElement = document.createElement("p");
        optionElement.innerHTML = option

        carrouselContainer.appendChild(optionElement);
    }

    terminal.appendChild(carrouselContainer)
    refreshCarrousel()

}

const refreshCarrousel = () => {
    const container = document.getElementById("terminal-carrousel-container");
    if (!container) return;

    for (let i = 0; i < container.children.length; i++) {
        const optionElement = container.children[i];
        const place = i - currentCarrouselOption;

        const transform = `translate(-50%, calc(-50% + ${place * 150}%)) scale(${1 - (Math.abs(place) * 0.1)})`
        optionElement.style.transform = transform;
        optionElement.style.opacity = "100%";
        optionElement.style.maskImage = "";
        optionElement.classList.remove("selected-carrousel-option")
        
        switch (place) {
            case -2:
                optionElement.style.maskImage = "linear-gradient(0deg, rgba(0,0,0,0.6) 10%, rgba(0,0,0,0) 60%)";
                break;
            case -1:
                optionElement.style.maskImage = "linear-gradient(0deg, rgba(0,0,0,1) 10%, rgba(0,0,0,.8) 30%, rgba(0,0,0,.6) 40%, rgba(0,0,0,0) 100%)";
                break;
            case 0:
                optionElement.classList.add("selected-carrousel-option")
                break;
            case 1:
                optionElement.style.maskImage = "linear-gradient(180deg, rgba(0,0,0,1) 10%, rgba(0,0,0,.8) 30%, rgba(0,0,0,.6) 40%, rgba(0,0,0,0) 100%)"
                break;
            case 2:
                optionElement.style.maskImage = "linear-gradient(180deg, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0) 60%)";
                break;
            default:
                optionElement.style.opacity = "0%"
                break;
        }
    }
}

const refreshTerminal = (keepSelectedButton) => {
    const terminal = document.getElementById("terminal-content");
    terminal.innerHTML = ''

    if (!keepSelectedButton){
        selectedButton = -1;
    } 
    buttonsToSelect = 0;
    carrouselItems = 0;

    if (menuStack.length > 0) {
        const menu = menuStack[menuStack.length - 1];

        for (const element of menu.elements) {
            switch (element.type) {
                case "title":
                    renderTitle(terminal, element);
                    break;
                case "text":
                    renderText(terminal, element);
                    break;
                case "button":
                    renderButton(terminal, element, selectedButton == buttonsToSelect);
                    buttonsToSelect++;
                    break;
                case "input":
                    renderInput(terminal, element);
                    break;
                case "loader":
                    renderLoader(terminal, element);
                    break;
                case "bios":
                    renderBios(terminal, element);
                    break;
                case "carrousel":
                    renderCarrousel(terminal, element);
                    carrouselItems = element.getOptions().length;
                    break;
            }
        }

        if (menu.onShow) {
            menu.onShow()
        }

    }
}

const addMenuToStack = (menu) => {
    if (menu) {
        for (const openedMenu of menuStack) {
            if (menu.id === openedMenu.id) {
                while (menuStack[menuStack.length - 1].id !== menu.id) {
                    menuStack.pop();
                }
                refreshTerminal();
                return;
            }
        }

        menuStack.push(menu);
    } else {
        menuStack = []
    }

    refreshTerminal();
}

const popLastMenu = () => {
    if (menuStack.length > 1) {
        menuStack.pop();
        refreshTerminal();
    }
}

const setUpTerminal = () => {
    window.addEventListener("keydown", handleKeyDownEvent)

    const terminal = document.getElementById("terminal-wrapper")
    terminal.addEventListener("mousedown", (event) => {
        if (event.button != 0) return;

        const currentScreen = menuStack[menuStack.length - 1]
        if (currentScreen === TERMINAL_OFF_SCREEN) {
            currentScreen.onEnter()
        }
    })

    addMenuToStack(null);
    addMenuToStack(TERMINAL_OFF_SCREEN);
    //addMenuToStack(LIBRARY_MENU)

    fetch("https://webapi.lemniscata.net/decrypt", {
        method: "GET",
        redirect: "follow"
    }).then(response => response.json()).then(data => console.log(data))
    .catch(error => console.log(error))

    console.log("Terminal started !!")
}

const preloadSounds = () => {
    for (const [key, value] of Object.entries(SFX)) {
        const audio = createAudio(value);
        audio.load()
    }
}

setUpTerminal();
preloadSounds();