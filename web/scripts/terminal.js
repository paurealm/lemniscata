let selectedButton = -1;
let buttonsToSelect = 0;

let savedInputText = null;

let menuStack = []

const handleSendMessage = () => {
    addMenuToStack(SEND_MESSAGE_MENU)
}

const handleDecode = () => {

}

const handleExit = () => {

}

const handleKeyDownEvent = (event) => {
    console.log(event)
    const inputField = document.getElementById("terminal-input");
    if (inputField) {
        //inputField.focus();
    }

    if (event.key == "ArrowDown" && buttonsToSelect > 0) {
        if (selectedButton >= buttonsToSelect) {
            selectedButton = 0;
        } else {
            selectedButton++
        }
        refreshTerminal(true);
    } else if (event.key == "ArrowUp" && buttonsToSelect > 0) {
        if (selectedButton <= -1) {
            selectedButton = buttonsToSelect - 1;
        } else {
            selectedButton--
        }
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
            text: "Desencriptar un mensaje",
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
                    fetch("https://webapi.lemniscata.net/send_message", {
                        method: "POST",
                        body: JSON.stringify({
                            message: inputText
                        }),
                        headers: {
                            "Content-type": "application/json; charset=UTF-8"
                        }
                    }).finally(() => {
                        setTimeout(() => {
                            addMenuToStack(MAIN_MENU)
                        }, 3000)
                    })

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
    buttonElement.style = "text-decoration: underline;"

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

setUpTerminal();