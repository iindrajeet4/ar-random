
const API = "https://script.google.com/macros/s/AKfycbx4cj-jOYBY2k7l5TgVgH3Xt8oJpufFTKkn4zGAx8Umq5a7Q4od6FjU3hdPMlRHmpMXUg/exec";

fetch(API)
.then(r=>r.json())
.then(data=>{

    if(!data.success){
        alert("ครบ 30 คนแล้ว");
        return;
    }

    const img = document.querySelector("#reward");
    img.setAttribute("src",`images/${data.image}.png`);

});