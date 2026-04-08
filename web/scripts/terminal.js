let selectedButton = -1;
let buttonsToSelect = 0;

let savedInputText = null;

let menuStack = []

const SFX = {
    TERMINAL_START: "terminal_start.wav",
    TERMINAL_STARTUP: "terminal_startup.wav",
    TERMINAL_SHUTDOWN: "",

    BUTTON_SELECT: "button_select.wav",
    BUTTON_PRESS: "button_press.wav",

    BACK_PRESS: "back_press.wav",
    BACK_BLOCKED_PRESS: "back_blocked_press.wav",

    ERROR: "error.wav",

    INPUT_KEY: "input_key.wav",

    SEND_MESSAGE_CONFIRMATION: "send_message_confirmation.wav",
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

}

const handleExit = () => {

}

const handleKeyDownEvent = (event) => {
    const inputField = document.getElementById("terminal-input");

    if (event.key == "ArrowDown" && buttonsToSelect > 0) {
        if (selectedButton >= buttonsToSelect) {
            selectedButton = 0;
        } else {
            selectedButton++
        }
        playSound(SFX.BUTTON_SELECT)
        refreshTerminal(true);
    } else if (event.key == "ArrowUp" && buttonsToSelect > 0) {
        if (selectedButton <= -1) {
            selectedButton = buttonsToSelect - 1;
        } else {
            selectedButton--
        }
        playSound(SFX.BUTTON_SELECT)
        refreshTerminal(true);
    } else if (event.key == "Enter") {
        const onEnter = menuStack[menuStack.length - 1].onEnter;
        if (onEnter) {
            onEnter();
        }
    } else if ((event.key == "Q" || event.key == "q") && event.ctrlKey) {
        console.log("control q", menuStack[menuStack.length - 1])
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
    onEnter: () => pressCurrentButton()
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
    onEnter: () => {
        playSound(SFX.SEND_MESSAGE_CONFIRMATION)
        const inputText = document.getElementById("terminal-input").innerHTML.trim()
        if (inputText.length > 0) {
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
                        })
                        .catch(() => {
                            playSound(SFX.ERROR)
                            addMenuToStack({
                                id: "message_sent_and_failed",
                                elements: [
                                    {
                                        id: "confirmation_text",
                                        type: "text",
                                        text: "Upsi, parece que algo ha fallado :("
                                    },
                                    {
                                        id: "confirmation_text",
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
                        id: "message_sent",
                        elements: [
                            {
                                id: "confirmation_text",
                                type: "text",
                                text: "Gracias por dejar un mensaje :3"
                            }
                        ],
                        onBack: () => {}
                    })
                },
                onBack: () => {
                    savedInputText = inputText
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

    inputElement.innerHTML = savedInputText && savedInputText.length > 0 ? savedInputText : ""
    savedInputText = null;

    terminal.appendChild(inputElement);
    inputElement.focus()

    inputElement.addEventListener("input", (event) => playSound(SFX.INPUT_KEY))
}

const refreshTerminal = (keepSelectedButton) => {
    const terminal = document.getElementById("terminal-content");
    terminal.innerHTML = ''

    if (!keepSelectedButton){
        selectedButton = -1;
    } 
    buttonsToSelect = 0;

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
            }
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

    addMenuToStack(null);
    addMenuToStack(MAIN_MENU)
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