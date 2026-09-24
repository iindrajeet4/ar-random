const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const sceneEl = document.querySelector('a-scene');

// --- AR system reference -------------------------------------------------
// sceneEl.systems["mindar-image-system"] can be undefined until the scene
// has actually finished loading (autoStart:false makes this worse, since
// nothing forces initialization early). Grab it once, off the "loaded"
// event, instead of hoping it exists whenever the button gets clicked.
let arSystem = null;
if (sceneEl.hasLoaded) {
    arSystem = sceneEl.systems["mindar-image-system"];
} else {
    sceneEl.addEventListener("loaded", () => {
        arSystem = sceneEl.systems["mindar-image-system"];
    });
}

let arStartTimeout = null;

function onArReady() {
    clearTimeout(arStartTimeout);
    status.innerText = status.innerText.replace(" — starting camera…", "");
    button.style.display = "none";
}

function onArError() {
    clearTimeout(arStartTimeout);
    status.innerText = "Camera failed to start. Check camera permission, close any other app/tab using the camera, then press Start AR again.";
    reward.setAttribute("visible", "false");
    button.disabled = false;
    button.style.display = "";
}

// THIS is the part that was missing. MindAR does not throw a JS error when
// the camera/engine fails to start — it fires an "arError" event on the
// scene. Nothing in the old app.js listened for it, and index.html has
// uiError:"no" (which turns off MindAR's own built-in error message too).
// Net result: any camera failure was 100% silent — black screen, and the
// button was already hidden because the old code hid it right after
// calling start(), without waiting to find out if start() actually worked.
sceneEl.addEventListener("arReady", onArReady);
sceneEl.addEventListener("arError", onArError);

function fetchJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gas_cb_' + Math.random().toString(36).substring(2, 9);
        window[callbackName] = function (data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        const script = document.createElement('script');
        script.src = `${url}?callback=${callbackName}`;
        script.onerror = function () {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error("Network error or script load failed"));
        };
        document.body.appendChild(script);
    });
}

button.addEventListener("click", async () => {
    status.innerText = "Random Group...";
    button.disabled = true;

    if (!arSystem) {
        status.innerText = "AR isn't ready yet, wait a second and try again.";
        button.disabled = false;
        return;
    }

    try {
        const data = await fetchJSONP(API);
        console.log("API Data:", data);

        if (!data.success) {
            status.innerText = (data.message === "FULL") ? "30 People completed" : data.message;
            button.disabled = false;
            return;
        }

        const imageName = String(data.image).trim().toUpperCase();
        const imagePath = `./images/${imageName}.png`;
        console.log("Image path to load:", imagePath);

        reward.setAttribute("src", imagePath);
        reward.setAttribute("visible", "true");
        status.innerText = `You got: ${imageName} — starting camera…`;

        // Start the AR engine, but don't declare victory yet — onArReady /
        // onArError (registered above) decide what actually happened.
        arSystem.start();

        // Safety net so a rare stuck state doesn't leave the user frozen
        // on "starting camera..." forever with no way to retry.
        arStartTimeout = setTimeout(() => {
            status.innerText = "Camera is taking too long to start. Reload the page and try again.";
            button.disabled = false;
            button.style.display = "";
        }, 8000);

    } catch (error) {
        console.error("API ERROR:", error);
        status.innerText = "Unable to connect to the random system.";
        button.disabled = false;
    }
});
