const { remote, ipcRenderer } = require('electron');

document.getElementById('minimize-button').addEventListener('click', () => {
    remote.getCurrentWindow().minimize()
  });
 
document.getElementById('close-button').addEventListener('click', () => {
    remote.app.quit()
});


function getChampSelectId(session){
    let ret;
    let localCellId = session.localPlayerCellId;
    console.log("localCellId: " + localCellId);

    session.actions.forEach(x => {
        if(Array.isArray(x)){
            x.forEach(y => {
                if(y.actorCellId == localCellId && y.type == "pick"){
                    ret = y.id;
                }
            });
        } else {
            if(x.actorCellId == localCellId && x.type == "pick"){
                ret = x.id;
            }
        }
    });
    return ret;
}

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

ipcRenderer.on("client-connected", (event, arg) => {
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

        let session = ipcRenderer.sendSync('getSession');
        let cellId = getChampSelectId(session);
        console.log("cellId: " + cellId);
        
        let pickableChamps = ipcRenderer.sendSync('getPickableChamps');
        if (pickableChamps != null){

            let randomIndex = Math.floor(Math.random() * pickableChamps.championIds.length);
            let randomChamp = pickableChamps.championIds[randomIndex];

            let arg = {
                id: cellId,
                body: {
                    "championId": randomChamp,
                    "completed": autoConfirm
                }
            }

            ipcRenderer.send('pickChamp', arg);

            console.log("Champ ID: " + randomChamp);

        }
    });
}