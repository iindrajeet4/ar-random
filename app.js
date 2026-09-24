const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const sceneEl = document.querySelector('a-scene');
const targetEl = document.getElementById("rewardTarget");

// --- AR system reference -------------------------------------------------
let arSystem = null;
if (sceneEl.hasLoaded) {
    arSystem = sceneEl.systems["mindar-image-system"];
} else {
    sceneEl.addEventListener("loaded", () => {
        arSystem = sceneEl.systems["mindar-image-system"];
    });
}

let arStartTimeout = null;
let assignedImage = null;   // ผลที่สุ่มได้ — เก็บไว้เฉยๆ ยังไม่บอกใคร
let currentTicket = null;   // เผื่อจะต่อกับ Apps Script แบบ confirm ในอนาคต
let revealed = false;       // กันไม่ให้ข้อความสลับไปมาเวลา target หลุด/เจอซ้ำ

function resetForNewAttempt() {
    assignedImage = null;
    currentTicket = null;
    revealed = false;
    reward.setAttribute("visible", "false");
}

function onArReady() {
    clearTimeout(arStartTimeout);
    if (!revealed) {
        status.innerText = "Camera ready — point it at the marker";
    }
}

// arError คือ event ที่โค้ดเดิมไม่เคยฟังเลย เป็นสาเหตุหลักที่กล้อง fail แบบเงียบๆ
function onArError() {
    clearTimeout(arStartTimeout);
    status.innerText = "Camera failed to start. Check camera permission, close any other app/tab using the camera, then press Start AR again.";
    button.disabled = false;
    button.style.display = "";
    resetForNewAttempt();
}

// นี่คือจุดเดียวที่ "รู้จริง" ว่ารูปกำลังแสดงอยู่บนจอ — MindAR ยิง event นี้
// ก็ต่อเมื่อมัน track marker ล็อกได้จริงเท่านั้น ไม่ใช่แค่กล้องเปิดเฉยๆ
function onTargetFound() {
    console.log("targetFound — marker locked, image should be visible now");
    reward.setAttribute("visible", "true");

    if (assignedImage && !revealed) {
        revealed = true;
        status.innerText = `You got: ${assignedImage}! 🎉`;
        button.style.display = "none";

        // ถ้าอัปเดต Apps Script ให้มี action=confirm แล้ว (แยก reserve/confirm)
        // ให้ปลดคอมเมนต์บรรทัดนี้ — จะ mark slot ว่า "ใช้จริง" เฉพาะตอนเห็นรูป
        // จริงๆ เท่านั้น แทนที่จะ burn slot ตั้งแต่ตอนกดปุ่ม
        // if (currentTicket) fetchJSONP(`${API}?action=confirm&ticket=${currentTicket}`).catch(console.error);
    }
}

function onTargetLost() {
    console.log("targetLost — tracking หลุด");
    // ไม่ reset ข้อความถ้าเปิดเผยไปแล้ว กันไม่ให้กระพริบตอนมือสั่น
}

sceneEl.addEventListener("arReady", onArReady);
sceneEl.addEventListener("arError", onArError);
targetEl.addEventListener("targetFound", onTargetFound);
targetEl.addEventListener("targetLost", onTargetLost);

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
    resetForNewAttempt();

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

        // ตั้งค่ารูปไว้ล่วงหน้า (โหลด texture รอไว้) แต่ "ไม่เปิดเผย" อะไรเลย
        // จนกว่า onTargetFound จะยืนยันว่าเจอ marker จริง
        assignedImage = imageName;
        currentTicket = data.ticket;
        reward.setAttribute("src", imagePath);

        status.innerText = "Starting camera...";
        arSystem.start();

        // กันค้างถ้ากล้องบูทช้าผิดปกติ
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
