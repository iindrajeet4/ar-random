const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const sceneEl = document.querySelector('a-scene');

button.addEventListener("click", async () => {
    status.innerText = "กำลังสุ่มรางวัล...";
    button.disabled = true;

    try {
        const response = await fetch(API);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("API Data:", data);

        if (!data.success) {
            status.innerText = (data.message === "FULL") ? "ครบ 30 คนแล้ว" : data.message;
            button.disabled = false;
            return;
        }

        const imageName = String(data.image).trim().toUpperCase();
        const imagePath = `./images/${imageName}.png`; // ปรับนามสกุลไฟล์ตามจริง เช่น .jpg หรือ .png

        const testImage = new Image();
        testImage.onload = function () {
            console.log("IMAGE LOADED:", imagePath);

            // เริ่มเปิดกล้องและระบบ AR หลังจากสุ่มสำเร็จ
            sceneEl.systems["mindar-image-system"].start();

            // แสดงรูปภาพใน A-Frame
            reward.setAttribute("src", imagePath);
            reward.setAttribute("visible", "true");

            status.innerText = `ยินดีด้วย! คุณได้รับภาพรางวัล: ${imageName}`;
            button.style.display = "none";
        };

        testImage.onerror = function () {
            console.error("IMAGE LOAD FAILED:", imagePath);
            status.innerText = `ไม่พบไฟล์ภาพ ${imageName}`;
            button.disabled = false;
        };

        testImage.src = imagePath;

    } catch (error) {
        console.error("API ERROR:", error);
        status.innerText = "ไม่สามารถเชื่อมต่อระบบสุ่มได้";
        button.disabled = false;
    }
});
