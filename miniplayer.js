if ("miniplayer" in window) {
    throw new Error("miniplayer.js has already been loaded.");
}
window.miniplayer = {};
window.miniplayer.internal = {};
window.miniplayer.isInit = false;
window.miniplayer.isSetup = false;

window.miniplayer.Init = async function (initData) {
    const private = window.miniplayer.internal;
    const public = window.miniplayer;

    if (public.isInit) {
        throw new Error("miniplayer.Init has already been called.");
    }
    public.isInit = true;
    private.initData = initData;

    if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", async () => {
            await private.Setup();
        });
    } else {
        await private.Setup();
    }
}

window.miniplayer.internal.Setup = async function () {
    const private = window.miniplayer.internal;
    const public = window.miniplayer;

    if (public.isSetup) {
        throw new Error("miniplayer.setup has already been called.");
    }
    if (document.readyState == "loading") {
        throw new Error("miniplayer.setup may not be called until the dom content has loaded.");
    }
    public.isSetup = true;

    private.player = document.querySelector("#miniplayer_player");
    const playerSource = document.createElement("source");
    playerSource.src = private.initData.sourceUrl;
    private.player.appendChild(playerSource);

    private.FetchImage = async function (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const image = new Image();
        image.src = blobUrl;
        return await new Promise(resolve => {
            image.onload = () => {
                resolve(image);
            };
        });
    }

    private.scrubSheet = await private.FetchImage(private.initData.scrubSheetUrl);
    private.scrubs = {};
    private.GetScrub = async function (index) {
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
    private.renderrer = document.querySelector("#miniplayer_renderrer");
    private.renderrerContext = private.renderrer.getContext("2d");
    private.MouseToSeekTime = function (event) {
        const scrubBarRect = private.scrubBar.getBoundingClientRect();
        return ((event.clientX - scrubBarRect.left) * private.player.duration) / scrubBarRect.width;
    }

    private.scrubShowing = false;
    private.scrubBar.addEventListener("mouseenter", async (event) => {
        if (!private.scrubShowing) {
            private.scrub.style.display = "block";
            private.scrubShowing = true;
        }
    });

    private.scrubBar.addEventListener("mouseleave", async (event) => {
        if (private.scrubShowing) {
            private.scrub.style.display = "none";
            private.scrubShowing = false;
        }
    });

    private.scrubBar.addEventListener("click", async (event) => {
        private.player.currentTime = private.MouseToSeekTime(event);
    });

    private.currentScrubIndex = -1;
    private.loadingScrub = false;
    private.scrubBar.addEventListener("mousemove", async (event) => {
        if (private.loadingScrub) {
            return;
        }
        private.loadingScrub = true;

        const scrubBarRect = private.scrubBar.getBoundingClientRect();
        private.scrub.style.top = `${scrubBarRect.top - 25 - private.scrub.height}px`;
        private.scrub.style.left = `${event.clientX - (private.scrub.width / 2)}px`;

        const seekTime = private.MouseToSeekTime(event);
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
        }

        /*
        Any + Space: Toggle Play/Pause
        Any + M: Toggle Mute
        Any + F: Toggle fullscreen
        Any + L: Toggle Loop

        Any + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]: Skip To Percentage Through Video
        
        None + [Up Arrow, W]: Volume Up 5%
        None + [Down Arrow, S]: Volume Down 5%
        None + [Right Arrow, D]: Skip Forward 5 Seconds
        None + [Left Arrow, A]: Skip Backward 5 Seconds
        
        Shift + [Right Arrow, D]: Next Video
        Shift + [Left Arrow, A]: Previous Video
        Shift + [Up Arrow, W]: Speed Up 0.5 Times
        Shift + [Down Arrow, S]: Speed Down 0.5 Times
        
        Ctrl + [Right Arrow, D]: Skip Forward 1 Frame When Paused
        Ctrl + [Left Arrow, A]: Skip Backwards 1 Frame When Paused
        */
        if (event.code == "KeyD" || event.code == "ArrowRight") {
            if (!event.ctrlKey && !event.shiftKey) {
                private.player.currentTime = private.player.currentTime + 5;
            } else if (!event.ctrlKey && event.shiftKey) {
                // TODO next video
            } else if (private.player.paused) {
                // TODO skip forward one frame
            }
        } else if (event.code == "KeyA" || event.code == "ArrowLeft") {
            if (!event.ctrlKey && !event.shiftKey) {
                private.player.currentTime = private.player.currentTime - 5;
            } else if (!event.ctrlKey && event.shiftKey) {
                // TODO previous video
            } else if (private.player.paused) {
                // TODO skip back one frame
            }
        } else if (event.code == "KeyW" || event.code == "ArrowUp") {
            if (!event.ctrlKey && !event.shiftKey) {
                // TODO volume up 5%
            } else if (!event.ctrlKey && event.shiftKey) {
                // TODO speed up 0.5
            }
        } else if (event.code == "KeyS" || event.code == "ArrowDown") {
            if (!event.ctrlKey && !event.shiftKey) {
                // TODO volume down 5%
            } else if (!event.ctrlKey && event.shiftKey) {
                // TODO speed down 0.5
            }
        }
    });
}