const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const sceneEl = document.querySelector('a-scene');

// ฟังก์ชัน JSONP สำหรับดึงข้อมูลจาก Google Apps Script ข้ามโดเมน
function fetchJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gas_cb_' + Math.random().toString(36).substring(2, 9);
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };

        const script = document.createElement('script');
        script.src = `${url}?callback=${callbackName}`;
        script.onerror = function() {
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

        // 1. สั่งเปิดกล้องและระบบ AR ทันทีที่สุ่มข้อมูลสำเร็จ (ไม่รอโหลดรูปภาพ)
        sceneEl.systems["mindar-image-system"].start();

        // 2. ตั้งค่ารูปภาพเข้าไปใน A-Frame รอด้านหน้ากล้อง
        reward.setAttribute("src", imagePath);
        reward.setAttribute("visible", "true");

        status.innerText = `You got this!: ${imageName} (ส่อง QR Code)`;
        button.style.display = "none";

    } catch (error) {
        console.error("API ERROR:", error);
        status.innerText = "Unable to connect to the random system.";
        button.disabled = false;
    }
});
