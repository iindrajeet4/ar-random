const API = "https://script.google.com/macros/s/AKfycbx4cj-jOYBY2k7l5TgVgH3Xt8oJpufFTKkn4zGAx8Umq5a7Q4od6FjU3hdPMlRHmpMXUg/exec";

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
