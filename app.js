const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";
const PROXY_API = `https://api.allorigins.win/raw?url=${encodeURIComponent(API)}`;

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const sceneEl = document.querySelector('a-scene');
const targetEl = document.getElementById("ar-target");

let hasFetched = false;

// 1. Click button to start AR camera immediately
button.addEventListener("click", () => {
    status.innerText = "Opening camera... Please scan the marker";
    button.style.display = "none";

    if (sceneEl && sceneEl.systems["mindar-image-system"]) {
        sceneEl.systems["mindar-image-system"].start();
    }
});

// 2. Fetch random reward from Google Sheets ONLY when marker is found
targetEl.addEventListener("targetFound", async () => {
    if (hasFetched) return;
    hasFetched = true;

    status.innerText = "Randomizing your reward...";

    try {
        const response = await fetch(PROXY_API);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("API Data:", data);

        if (!data.success) {
            status.innerText = (data.message === "FULL") ? "30 Participants Completed" : data.message;
            return;
        }

        const imageName = String(data.image).trim().toUpperCase();
        const imagePath = `./images/${imageName}.png`;

        reward.setAttribute("src", imagePath);
        reward.setAttribute("visible", "true");

        status.innerText = `Congratulations! You got: ${imageName}`;

    } catch (error) {
        console.error("API ERROR:", error);
        status.innerText = "Unable to connect to the random system.";
        hasFetched = false;
    }
});
