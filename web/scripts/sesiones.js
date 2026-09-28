const CLOSED_LEMNISCATA_PATH = "M 0 0 C 10 -20 40 -20 40 0 C 40 20 10 20 0 0 C -10 -20 -40 -20 -40 0 C -40 20 -10 20 0 0"
const OPEN_LEMNISCATA_PATH = "M 2 -2 C 19 -19 40 -20 40 0 C 40 20 10 20 0 0 C -10 -20 -40 -20 -40 0 C -38 19 -21 20 -2 2";

const setupPlaylist = playlist => {
    const titleElement = document.getElementById("page-audio-title");
    const descriptionElement = document.getElementById("page-audio-description");

    if (titleElement && descriptionElement) {
        titleElement.innerHTML = playlist.name;
        descriptionElement.innerHTML = ""
    }

    const backgroundElement = document.getElementById("music-background");
    const backgroundSource = document.getElementById("music-background-source")
    if (backgroundElement) {
        backgroundSource.setAttribute("src", playlist.backgroundVideo)
        backgroundElement.load();
    }

    const documentStyle = document.documentElement.style;
    documentStyle.setProperty("--music-color-primary-light", playlist.colors.primaryLight)
    documentStyle.setProperty("--music-color-primary-dark", playlist.colors.primaryDark)
    documentStyle.setProperty("--music-color-secondary-light", playlist.colors.secondaryLight)
    documentStyle.setProperty("--music-color-secondary-dark", playlist.colors.secondaryDark)
    documentStyle.setProperty("--music-color-detail", playlist.colors.detail)

    const audioList = document.getElementById("audio-list")
    audioList.innerHTML = ""
    for (let audio of playlist.audios) {
        const audioElement = document.createElement("div");
        audioElement.className = "audio-element";
        audioList.appendChild(audioElement);

        const imageElement = document.createElement("img")
        imageElement.setAttribute("height", "100%");
        imageElement.setAttribute("src", audio.image);
        audioElement.appendChild(imageElement);

        const dataElement = document.createElement("div");
        dataElement.className = "audio-data";
        audioElement.appendChild(dataElement);

        const audioTitleElement = document.createElement("h4")
        audioTitleElement.innerHTML = audio.name;
        dataElement.appendChild(audioTitleElement);

        const audioArtistElement = document.createElement("p")
        audioArtistElement.innerHTML = audio.artists.join(" - ")
        dataElement.appendChild(audioArtistElement);

        const audioDescriptionElement = document.createElement("p")
        audioDescriptionElement.innerHTML = audio.description
        dataElement.appendChild(audioDescriptionElement);

        audioElement.addEventListener("click", () => {
            MUSIC_PLAYER.setPlayingAudio(audio.url)
            MUSIC_PLAYER.setPause(false);
            updatePlayButton()

            descriptionElement.innerHTML = `${audio.name} - ${audio.artists.join(" - ")}`
        })

    }

}

const MUSIC_PLAYER = {
    isVideoPaused: () => {
        const background = document.getElementById("music-background")
        return background.style.opacity
    },
    isPlaying: () => MUSIC_PLAYER.audio && !MUSIC_PLAYER.audio.paused && !MUSIC_PLAYER.audio.ended,
    canPlay: () => MUSIC_PLAYER.audio && !MUSIC_PLAYER.paused,
    /** @type {Audio} */ audio: null,
    colors: {
        primary: "#FFC800",
        secondary: "#685100"
    },
    loops: 0,
    volume: 0.5,
    shouldLoop: () => {
        const loopButton = document.getElementById("loop-icon")
        return loopButton && (loopButton.hasAttribute("enabled"))
    },
    setPlayingAudio: url => {
        const audio = new Audio(url);
        audio.load();
        audio.pause();
        audio.preservesPitch = false;

        audio.volume = MUSIC_PLAYER.volume;

        audio.addEventListener("ended", () => {
            if (MUSIC_PLAYER.shouldLoop()) {
            MUSIC_PLAYER.loops++;
                audio.load()
                audio.play()
            } else {
                audio.pause();
                updatePlayButton();
            }
        })
        MUSIC_PLAYER.loops = 0;

        if (MUSIC_PLAYER.audio) {
            MUSIC_PLAYER.audio.pause()
        }

        MUSIC_PLAYER.audio = audio;
    },
    setPause: pause => {
        if (pause) {
            MUSIC_PLAYER.audio.pause()
        } else {
            MUSIC_PLAYER.audio.play()
        }
    },
    setVolume: percentage => {
        if (MUSIC_PLAYER.audio) {
            MUSIC_PLAYER.audio.volume = percentage;
        }

        MUSIC_PLAYER.volume = percentage
    },
    restartAudio: () => {
        if (MUSIC_PLAYER.audio) {
            MUSIC_PLAYER.setPause(true);
            MUSIC_PLAYER.audio.load();
        }
    },
    setSpeed: speed => {
        if (MUSIC_PLAYER.audio) {
            MUSIC_PLAYER.audio.playbackRate = speed
        }
    },
    addTime: time => {
        if (MUSIC_PLAYER.audio) {
            MUSIC_PLAYER.audio.currentTime = Math.max(0, Math.min(MUSIC_PLAYER.audio.currentTime + time, MUSIC_PLAYER.audio.duration))
        }
    }
}

const setupPlayButton = () => {
    const playButton = document.getElementById("play-button");
    if (!playButton) return

    playButton.addEventListener("click", async event => {
        if (MUSIC_PLAYER.isPlaying()) {
            MUSIC_PLAYER.setPause(true)
        } else if (MUSIC_PLAYER.canPlay()) {
            MUSIC_PLAYER.setPause(false)
        }

        updatePlayButton()
        
    })
}

const updatePlayButton = () => {
    const playIcon = document.getElementById("play-icon")
    const pauseIcon = document.getElementById("pause-icon")

    playIcon.style.display  = MUSIC_PLAYER.isPlaying() ? "none" : "inline-block"
    pauseIcon.style.display = MUSIC_PLAYER.isPlaying() ? "inline-block" : "none"
}

const updateProgressBar = () => {
    if (MUSIC_PLAYER.audio) {
        const percentage = MUSIC_PLAYER.audio.currentTime / MUSIC_PLAYER.audio.duration;
        const percentageString = `${parseInt(10000 * percentage) / 100}%`;

        const foregroundBar = document.getElementById("foreground-progress-bar");
        const backgroundBar = document.getElementById("background-progress-bar");
        if (!foregroundBar || !backgroundBar) return;

        const barLength = foregroundBar.getTotalLength()
        foregroundBar.style.strokeDasharray = barLength;

        if (MUSIC_PLAYER.loops % 2 == 0) {
            foregroundBar.style.strokeDashoffset = Math.min(barLength * (1 - percentage), barLength * 0.998)
        } else {
            foregroundBar.style.strokeDashoffset = Math.max(-barLength * (percentage), -barLength * 0.998)
        }
    }

    requestAnimationFrame(updateProgressBar)
}

const setVolume = percentage => {
        MUSIC_PLAYER.setVolume(percentage);

        for (let step of document.getElementsByClassName("volume-slider-step")) {
            step.setAttribute("offset", `${parseInt(percentage * 10000) / 100}%`)
        }
}

const setupVolumeSlider = () => {
    const volumeSlider = document.getElementById("volume-slider");
    if (!volumeSlider) return;

    let dragging = false

    const updatePercentage = event => {
        const box = volumeSlider.getBoundingClientRect();
        const x = event.clientX - box.left;+
        setVolume(Math.max(0, Math.min(1, x / box.width)))
    }

    volumeSlider.addEventListener("pointerdown", event => {
        dragging = true;
        volumeSlider.setPointerCapture(event.pointerId)
        updatePercentage(event)
    })

    volumeSlider.addEventListener("pointermove", event => {
        if (dragging) {
            updatePercentage(event)
        }
    })

    volumeSlider.addEventListener("pointerup", event => {
        dragging = false;
        volumeSlider.releasePointerCapture(event.pointerId);
    })

    volumeSlider.addEventListener("pointercancel", () => {
        dragging = false;
    })

}

const setupBackgroundToggle = () => {
    const toggle = document.getElementById("background-toggle");
    const background = document.getElementById("music-background")
    if (!toggle || !background) return;

    toggle.addEventListener("click", () => {
        if (MUSIC_PLAYER.isVideoPaused()){
            background.play()
            background.style.removeProperty("opacity")
            background.setAttribute("stopped", false)
        } else {
            background.pause();
            background.style.opacity = "0%"
            background.setAttribute("stopped", true)
        }
    })
}

const setupRestartButton = () => {
    const restartButton = document.getElementById("restart-button");
    if (!restartButton) return;

    restartButton.addEventListener("click", () => {
        MUSIC_PLAYER.restartAudio();
        updatePlayButton()
    })
}

const setupLoopButton = () => {
    const loopButton = document.getElementById("loop-icon")
    if (!loopButton) return;

    const updateProgressBarVisual = () => {
        for (let path of document.getElementsByClassName("progress-bar-path")) {
            console.log(path)
            if (loopButton.hasAttribute("enabled")) {
                path.setAttribute("d", CLOSED_LEMNISCATA_PATH)
            } else {
                path.setAttribute("d", OPEN_LEMNISCATA_PATH)
            }
        }
    }

    loopButton.addEventListener("click", () => {
        if (loopButton.hasAttribute("enabled")) {
            loopButton.removeAttribute("enabled")
        } else {
            loopButton.setAttribute("enabled", "")
        }

        updateProgressBarVisual()
    })

    updateProgressBarVisual()
}

const setupAdvanceButton = () => {
    const advanceButton = document.getElementById("advance-button")
    if (!advanceButton) return

    let pressStartTime = 0;
    let hasAdvanced = false;

    const onRelease = () => {
        pressStartTime = -1;
        if (!hasAdvanced) {
            MUSIC_PLAYER.addTime(5)
        }

        hasAdvanced = false;
    }

    advanceButton.addEventListener("pointerdown", event => {
        advanceButton.setPointerCapture(event.pointerId)
        pressStartTime = Date.now();
    })

    advanceButton.addEventListener("pointerup", event => {
        advanceButton.releasePointerCapture(event.pointerId);
        onRelease()
    })

    advanceButton.addEventListener("pointercancel", () => {
        onRelease()
    })

    setInterval(() => {
        if (pressStartTime > 0) {
            const delay = 500;

            const pressingTime = Math.max(0, Date.now() - pressStartTime - delay)
            if (pressingTime > 0) {
                const timePassed = pressingTime / 1000;
                const speed = 1 + Math.min(timePassed / (timePassed / 10 + 3) * 3, 6);
                MUSIC_PLAYER.setSpeed(speed)
                hasAdvanced = true;
            }
        } else {
            const audio = MUSIC_PLAYER.audio
            if (audio) {
                audio.playbackRate = Math.max(1.0, audio.playbackRate - audio.playbackRate * 0.01)
            }
        }
    }, 5)

}

const setupRewindButton = () => {
    const rewindButton = document.getElementById("rewind-button")
    if (!rewindButton) return

    let pressStartTime = 0;
    let hasRewinded = false;

    const onRelease = () => {
        pressStartTime = -1

        if (!hasRewinded) {
            MUSIC_PLAYER.addTime(-5)
        }
        hasRewinded = false;
    }

    rewindButton.addEventListener("pointerdown", event => {
        rewindButton.setPointerCapture(event.pointerId)
        pressStartTime = Date.now();
    })

    rewindButton.addEventListener("pointerup", event => {
        rewindButton.releasePointerCapture(event.pointerId);
        onRelease()
    })

    rewindButton.addEventListener("pointercancel", () => {
        onRelease()
    })

    setInterval(() => {
        if (pressStartTime > 0) {
            const delay = 500;

            const pressingTime = Math.max(0, Date.now() - pressStartTime - delay)
            if (pressingTime > 0) {
                const timePassed = pressingTime / 1000;
                const speed = 1 + Math.min(timePassed / (timePassed / 10 + 3) * 3, 6);

                MUSIC_PLAYER.addTime(-0.01 * speed)
                MUSIC_PLAYER.setSpeed(speed)
                hasRewinded = true
            }
        } else {
            const audio = MUSIC_PLAYER.audio
            if (audio) {
                audio.playbackRate = Math.max(1.0, audio.playbackRate - audio.playbackRate * 0.01)
            }
        }
    }, 5)

}

const setupPlaylists = async () => {
    const response = await fetch("https://lemniscata.net/resources/data/playlists.json")
    const data = await response.json()
    const playlistContainer = document.getElementById("playlist-container")

    console.log(data)
    let listSelected = false;
    for (let playlistKey in data.playlists) {
        const list = data.playlists[playlistKey]

        if (!listSelected) {
            listSelected = true;
            setupPlaylist(list)
        }

        const playlistElement = document.createElement("div")
        playlistElement.className = "playlist-element"
        playlistContainer.appendChild(playlistElement)

        const image = document.createElement("img")
        image.setAttribute("src", list.cover)
        playlistElement.appendChild(image)

        const dataElement = document.createElement("div")
        dataElement.className = "playlist-data"
        playlistElement.appendChild(dataElement)

        const titleElement = document.createElement("h4")
        titleElement.innerHTML = list.name
        dataElement.appendChild(titleElement)

        const sizeElement = document.createElement("p")
        const size = list.audios.length;
        if (size == 0) {
            sizeElement.innerHTML = "Sin elementos" 
        } else if (size == 1) {
            sizeElement.innerHTML = "1 elemento" 
        } else {
            sizeElement.innerHTML = `${size} elementos` 
        }
        dataElement.appendChild(sizeElement)

        playlistElement.addEventListener("click", () => {
            MUSIC_PLAYER.restartAudio();
            updatePlayButton();
            updateProgressBar();
            setupPlaylist(list)
        })
    }
}

setupPlayButton();
setupVolumeSlider()
setVolume(0.5)
setupBackgroundToggle()
setupRestartButton()
setupLoopButton()
setupAdvanceButton()
setupRewindButton()
setupPlaylists()
requestAnimationFrame(updateProgressBar)