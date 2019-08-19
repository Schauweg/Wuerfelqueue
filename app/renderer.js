const { ipcRenderer } = require('electron')

function setActive(clientActive){
    const spanIsActive = document.getElementById("isActive");
    if(clientActive){
        spanIsActive.innerHTML = "Client detected ";
        spanIsActive.classList.remove("inactive");
        spanIsActive.classList.add("active");
    } else {
        spanIsActive.innerHTML = "Client not detected ";
        spanIsActive.classList.remove("active");
        spanIsActive.classList.add("inactive");
    }
}

let clientActive = ipcRenderer.sendSync("is-client-active");
setActive(clientActive);

ipcRenderer.on("client-active", (event, arg) => {
    clientActive = true;
    setActive(clientActive);
});

ipcRenderer.on("client-disconnected", (event, arg) => {
    clientActive = false;
    setActive(clientActive);
});

if(clientActive){
    const btnRandmChamp = document.getElementById('btn');
    btnRandmChamp.addEventListener('click', function (event){
        let autoConfirm = false;
        if(document.getElementById("autoConfirm").checked){
            autoConfirm = true;
        }
        
        let returnVal = ipcRenderer.sendSync('getPickableChamps');
        if (returnVal != null){

            let randomIndex = Math.floor(Math.random() * returnVal.championIds.length);
            let randomChamp = returnVal.championIds[randomIndex];

            body = {
                "championId": randomChamp,
                "completed": autoConfirm
            };

            ipcRenderer.send('pickChamp', body);

            console.log("Champ ID" + randomChamp);

        }
    });
}