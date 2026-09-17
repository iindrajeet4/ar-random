const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");

button.addEventListener("click", async () => {

    status.innerText = "กำลังเชื่อมต่อระบบ...";
    button.disabled = true;

    try {

        const response = await fetch(API, {
            method: "GET",
            redirect: "follow"
        });

        console.log("Response status:", response.status);
        console.log("Response URL:", response.url);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        console.log("API Data:", data);

        if (!data.success) {

            if (data.message === "FULL") {
                status.innerText = "สิทธิ์ครบ 30 คนแล้ว";
            } else {
                status.innerText = "ระบบขัดข้อง: " + data.message;
            }

            button.disabled = false;
            return;
        }

        const imageName = data.image;

        reward.setAttribute(
            "src",
            `images/${imageName}.png`
        );

        reward.setAttribute(
            "visible",
            "true"
        );

        status.innerText =
            `คุณได้รับภาพ ${imageName}`;

        button.style.display = "none";

    } catch (error) {

        console.error("API ERROR:", error);

        status.innerText =
            "เชื่อมต่อระบบไม่ได้";

        button.disabled = false;
    }

});
