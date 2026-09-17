const API = "https://script.google.com/macros/s/AKfycbyeD0pjO7uSQmnhjRBr1qFvhwsnubtXdM4IYNk0U-MQcfDNPO6O48mfUnuWiMslgaVy/exec";

const status = document.getElementById("status");
const button = document.getElementById("startBtn");
const reward = document.getElementById("reward");

button.addEventListener("click", async () => {

    status.innerText = "กำลังสุ่ม...";
    button.disabled = true;

    try{

        const response = await fetch(API);
        const data = await response.json();

        if(!data.success){
            status.innerText = "ครบ 30 คนแล้ว";
            return;
        }

        reward.setAttribute("src", `images/${data.image}.png`);
        reward.setAttribute("visible", true);

        status.innerText = `คุณได้รับภาพ ${data.image}`;

        button.style.display = "none";

    }catch(err){

        status.innerText = "เชื่อมต่อระบบไม่ได้";
        console.error(err);

    }

});
