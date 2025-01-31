if ("miniplayer" in window) {
    throw new Error("miniplayer.js has already been loaded.");
}
window.miniplayer = {};
window.miniplayer.internal = {};

window.miniplayer.Init = function (initData) {
    const private = window.miniplayer.internal;
    const public = window.miniplayer;

    if ("initData" in private) {
        throw new Error("miniplayer.Init has already been called.");
    }
    if (!initData) {
        throw new Error("No value given for required parameter initData.");
    }
    if (!("sourceUrl" in initData)) {
        throw new Error("No value given for required parameter initData.sourceUrl.");
    }
    private.initData = initData;

    if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            private.Setup();
        });
    } else {
        private.Setup();
    }
}

window.miniplayer.internal.Setup = function () {
    const private = window.miniplayer.internal;
    const public = window.miniplayer;

    private.player = document.querySelector("#miniplayer_player");
    const playerSource = document.createElement("source");
    playerSource.src = private.initData.sourceUrl;
    private.player.appendChild(playerSource);

    // Scrubs
    private.scrubs = {};
    private.renderrer = document.querySelector("#miniplayer_renderrer");
    private.renderrerContext = private.renderrer.getContext("2d");
    private.GetScrub = async function (index) {
        if (!("scrubSheet" in private)) {
            const response = await fetch(private.initData.scrubSheetUrl, { priority: "high" });
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const image = new Image();
            image.src = blobUrl;
            private.scrubSheet = await new Promise(resolve => {
                image.onload = () => {
                    resolve(image);
                };
            });
        }
        if (index in private.scrubs) {
            return private.scrubs[index];
        } else {
            const duration = private.player.duration;
            const size = Math.ceil(Math.sqrt(duration));
            const y = Math.floor(index / size);
            const x = index - (y * size);
            const width = private.scrubSheet.width / size;
            const height = private.scrubSheet.height / size;
            private.renderrer.width = width;
            private.renderrer.height = height;
            private.renderrerContext.drawImage(private.scrubSheet, width * x, height * y, width, height, 0, 0, width, height);
            const newScrub = private.renderrer.toDataURL("image/jpeg");
            private.scrubs[index] = newScrub;
            return newScrub;
        }
    }
    private.scrubBar = document.querySelector("#miniplayer_scrubBar");
    private.scrub = document.querySelector("#miniplayer_scrub");
    private.scrubShowing = false;
    private.scrubBar.addEventListener("mouseenter", () => {
        if (!private.scrubShowing) {
            private.scrub.style.display = "block";
            private.scrubShowing = true;
        }
    });
    private.scrubBar.addEventListener("mouseleave", () => {
        if (private.scrubShowing) {
            private.scrub.style.display = "none";
            private.scrubShowing = false;
        }
    });
    private.currentScrubIndex = -1;
    private.loadingScrub = false;
    private.scrubBar.addEventListener("mousemove", async (event) => {
        if (private.loadingScrub) {
            return;
        }
        private.loadingScrub = true;

        const scrubBarRect = private.scrubBar.getBoundingClientRect();
        private.scrub.style.top = `${scrubBarRect.top - 15 - private.scrub.height}px`;
        private.scrub.style.left = `${event.clientX - (private.scrub.width / 2)}px`;

        const seekTime = ((event.clientX - scrubBarRect.left) * private.player.duration) / scrubBarRect.width;
        const scrubIndex = Math.floor(seekTime);
        if (private.currentScrubIndex == scrubIndex) {
            private.loadingScrub = false;
        }

        const newScrub = await private.GetScrub(scrubIndex);
        private.scrub.src = newScrub;
        await new Promise(resolve => {
            private.scrub.onload = () => {
                resolve(undefined);
            };
        });
        private.currentScrubIndex = scrubIndex;

        private.loadingScrub = false;
    });

    // Keybinds
    window.addEventListener("keydown", async (event) => {
        if (event.code == "Space") {
            if (private.player.paused) {
                await private.player.play();
            } else {
                private.player.pause();
            }
        } else if (event.code == "KeyM") {
            private.player.muted = !private.player.muted;
        } else if (event.code == "KeyF") {
            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                if (private.player.requestFullscreen) {
                    private.player.requestFullscreen();
                } else if (private.player.mozRequestFullScreen) {
                    private.player.mozRequestFullScreen();
                } else if (private.player.webkitRequestFullscreen) {
                    private.player.webkitRequestFullscreen();
                } else if (private.player.msRequestFullscreen) {
                    private.player.msRequestFullscreen();
                } else {
                    throw new Error("Fullscreen not supported.");
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else {
                    throw new Error("Fullscreen not supported.");
                }
            }
        } else if (event.code == "KeyL") {
            private.player.loop = !private.player.loop;
        } else if (event.code == "Digit0" || event.code == "Numpad0") {
            private.player.currentTime = (private.player.duration * 0) / 10;
        } else if (event.code == "Digit1" || event.code == "Numpad1") {
            private.player.currentTime = (private.player.duration * 1) / 10;
        } else if (event.code == "Digit2" || event.code == "Numpad2") {
            private.player.currentTime = (private.player.duration * 2) / 10;
        } else if (event.code == "Digit3" || event.code == "Numpad3") {
            private.player.currentTime = (private.player.duration * 3) / 10;
        } else if (event.code == "Digit4" || event.code == "Numpad4") {
            private.player.currentTime = (private.player.duration * 4) / 10;
        } else if (event.code == "Digit5" || event.code == "Numpad5") {
            private.player.currentTime = (private.player.duration * 5) / 10;
        } else if (event.code == "Digit6" || event.code == "Numpad6") {
            private.player.currentTime = (private.player.duration * 6) / 10;
        } else if (event.code == "Digit7" || event.code == "Numpad7") {
            private.player.currentTime = (private.player.duration * 7) / 10;
        } else if (event.code == "Digit8" || event.code == "Numpad8") {
            private.player.currentTime = (private.player.duration * 8) / 10;
        } else if (event.code == "Digit9" || event.code == "Numpad9") {
            private.player.currentTime = (private.player.duration * 9) / 10;
        } else if (event.code == "KeyD" || event.code == "ArrowRight") {
            if (!event.ctrlKey && !event.shiftKey) {
                const newTime = private.player.currentTime + 5;
                private.player.currentTime = Math.min(newTime, private.player.duration);
            }
        } else if (event.code == "KeyA" || event.code == "ArrowLeft") {
            if (!event.ctrlKey && !event.shiftKey) {
                const newTime = private.player.currentTime - 5;
                private.player.currentTime = Math.max(newTime, 0);
            }
        } else if (event.code == "KeyW" || event.code == "ArrowUp") {
            if (!event.ctrlKey && !event.shiftKey) {
                const newVolume = private.player.volume + 0.05;
                private.player.volume = Math.min(newVolume, 1);
            } else if (!event.ctrlKey && event.shiftKey) {
                const newSpeed = private.player.playbackRate + 0.1;
                private.player.playbackRate = Math.min(newSpeed, 4.0);
            }
        } else if (event.code == "KeyS" || event.code == "ArrowDown") {
            if (!event.ctrlKey && !event.shiftKey) {
                const newVolume = private.player.volume - 0.05;
                private.player.volume = Math.max(newVolume, 0);
            } else if (!event.ctrlKey && event.shiftKey) {
                const newSpeed = private.player.playbackRate - 0.1;
                private.player.playbackRate = Math.max(newSpeed, 0.1);
            }
        }
    });

    // Mouse Controls
    private.scrubBar.addEventListener("click", (event) => {
        const scrubBarRect = private.scrubBar.getBoundingClientRect();
        private.player.currentTime = ((event.clientX - scrubBarRect.left) * private.player.duration) / scrubBarRect.width;
    });
    private.playerCover = document.querySelector("#miniplayer_playerCover");
    private.playerCover.addEventListener("click", async () => {
        if (private.player.paused) {
            await private.player.play();
        } else {
            private.player.pause();
        }
    });

    // Progress and buffer bars
    private.bufferBars = document.querySelectorAll(".miniplayer_bufferBar");
    private.progressBar = document.querySelector("#miniplayer_progressBar");
    private.player.addEventListener("progress", function () {
        for (let i = 0; i < private.bufferBars.length; i++) {
            if (i < private.player.buffered.length) {
                const start = (private.player.buffered.start(i) / private.player.duration) * 100.0;
                const end = (private.player.buffered.end(i) / private.player.duration) * 100.0;
                private.bufferBars[i].style.left = `${start}%`;
                private.bufferBars[i].style.width = `${end - start}%`;
            } else {
                private.bufferBars[i].style.left = `0%`;
                private.bufferBars[i].style.width = `0%`;
            }
        }
    });
    private.player.addEventListener("timeupdate", function () {
        private.progressBar.style.width = `${private.player.currentTime / private.player.duration * 100.0}%`;
    });
}