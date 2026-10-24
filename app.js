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
let currentTicket = null;   // ticket สำหรับ confirm
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


// arError คือ event ที่โค้ดเดิมไม่เคยฟังเลย
// เป็นสาเหตุหลักที่กล้อง fail แบบเงียบๆ
function onArError() {
    clearTimeout(arStartTimeout);

    status.innerText =
        "Camera failed to start. Check camera permission, close any other app/tab using the camera, then press Start AR again.";

    button.disabled = false;
    button.style.display = "";

    resetForNewAttempt();
}


// จุดนี้คือจุดที่ "รู้จริง" ว่ารูปกำลังแสดงอยู่บนจอ
// MindAR ยิง event นี้ก็ต่อเมื่อมัน track marker ล็อกได้จริง
function onTargetFound() {
    console.log("targetFound — marker locked, image should be visible now");

    reward.setAttribute("visible", "true");

    if (assignedImage && !revealed) {

        revealed = true;

        status.innerText = `You got: ${assignedImage}! 🎉`;

        button.style.display = "none";


        // ============================================================
        // CONFIRM
        // เปลี่ยนสถานะจาก "reserved" → "used"
        // เฉพาะเมื่อผู้ใช้สแกน marker สำเร็จจริง
        // ============================================================

        if (currentTicket) {

            fetchJSONP(
                `${API}?action=confirm&ticket=${encodeURIComponent(currentTicket)}`
            )
                .then(data => {
                    console.log("Confirm response:", data);

                    if (!data.success) {
                        console.error(
                            "Confirm failed:",
                            data.message
                        );
                    }
                })
                .catch(error => {
                    console.error("Confirm error:", error);
                });
        }
    }
}


function onTargetLost() {
    console.log("targetLost — tracking หลุด");

    // ไม่ reset ข้อความถ้าเปิดเผยไปแล้ว
    // กันไม่ให้ข้อความกระพริบตอนมือสั่น
}


sceneEl.addEventListener("arReady", onArReady);
sceneEl.addEventListener("arError", onArError);

targetEl.addEventListener("targetFound", onTargetFound);
targetEl.addEventListener("targetLost", onTargetLost);


// ============================================================
// JSONP helper
// ============================================================

function fetchJSONP(url) {

    return new Promise((resolve, reject) => {

        const callbackName =
            'gas_cb_' + Math.random().toString(36).substring(2, 9);


        window[callbackName] = function (data) {

            delete window[callbackName];

            if (script.parentNode) {
                document.body.removeChild(script);
            }

            resolve(data);
        };


        const script = document.createElement('script');


        // รองรับทั้ง URL ที่มี ? และไม่มี ?
        const separator = url.includes("?") ? "&" : "?";

        script.src =
            `${url}${separator}callback=${callbackName}`;


        script.onerror = function () {

            delete window[callbackName];

            if (script.parentNode) {
                document.body.removeChild(script);
            }

            reject(
                new Error("Network error or script load failed")
            );
        };


        document.body.appendChild(script);
    });
}


// ============================================================
// START AR
// ============================================================

button.addEventListener("click", async () => {

    status.innerText = "Random Group...";

    button.disabled = true;

    resetForNewAttempt();


    if (!arSystem) {

        status.innerText =
            "AR isn't ready yet, wait a second and try again.";

        button.disabled = false;

        return;
    }


    try {

        // ========================================================
        // ขอสุ่ม Image จาก Google Apps Script
        // ========================================================

        const data = await fetchJSONP(API);

        console.log("API Data:", data);


        // ========================================================
        // ถ้าครบ 25 คนแล้ว
        // ========================================================

        if (!data.success) {

            status.innerText =
                (data.message === "FULL")
                    ? "25 People completed"
                    : data.message;

            button.disabled = false;

            return;
        }


        // ========================================================
        // ได้ Image แล้ว
        // ========================================================

        const imageName =
            String(data.image).trim().toUpperCase();

        const imagePath =
            `./images/${imageName}.png`;


        console.log(
            "Image path to load:",
            imagePath
        );


        // ========================================================
        // ตั้งค่ารูปล่วงหน้า
        // แต่ยังไม่เปิดเผยจนกว่า targetFound
        // ========================================================

        assignedImage = imageName;

        currentTicket = data.ticket;

        reward.setAttribute("src", imagePath);


        status.innerText =
            "Starting camera...";


        arSystem.start();


        // ========================================================
        // กันค้างถ้ากล้องบูทช้าผิดปกติ
        // ========================================================

        arStartTimeout = setTimeout(() => {

            status.innerText =
                "Camera is taking too long to start. Reload the page and try again.";

            button.disabled = false;

            button.style.display = "";

        }, 8000);


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );

        status.innerText =
            "Unable to connect to the random system.";

        button.disabled = false;
    }
});
