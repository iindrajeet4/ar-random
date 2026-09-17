const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");
const debugImage = document.getElementById("debugImage");

button.addEventListener("click", async () => {

    status.innerText = "กำลังสุ่ม...";
    button.disabled = true;

    try {

        const response = await fetch(API);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        console.log("API:", data);

        if (!data.success) {

            status.innerText =
                data.message === "FULL"
                    ? "ครบ 30 คนแล้ว"
                    : data.message;

            button.disabled = false;
            return;
        }

        const imageName = String(data.image)
            .trim()
            .toUpperCase();

        const imagePath =
            `./images/${imageName}.png`;

        console.log("Image name:", imageName);
        console.log("Image path:", imagePath);

        /*
         * โหลดรูปด้วย HTML Image ก่อน
         * เพื่อพิสูจน์ว่า GitHub Pages โหลดรูปได้
         */

        const testImage = new Image();

        testImage.onload = function () {

            console.log("IMAGE LOADED:", imagePath);

            /*
             * แสดงรูปธรรมดา
             */
            debugImage.src = imagePath;
            debugImage.style.display = "block";

            /*
             * แล้วค่อยส่งรูปเข้า A-Frame
             */
            reward.setAttribute(
                "src",
                imagePath
            );

            reward.setAttribute(
                "visible",
                "true"
            );

            status.innerText =
                `คุณได้รับภาพ ${imageName}`;

        };

        testImage.onerror = function () {

            console.error(
                "IMAGE LOAD FAILED:",
                imagePath
            );

            status.innerText =
                `หาไฟล์ ${imageName}.png ไม่พบ`;

            button.disabled = false;

        };

        testImage.src = imagePath;

    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );

        status.innerText =
            "เชื่อมต่อระบบไม่ได้";

        button.disabled = false;
    }

});
