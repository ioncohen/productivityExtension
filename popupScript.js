//Set up event listeners for page navigation buttons
document.getElementById('goToSettingsButton').addEventListener('click', () => {
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('popupSettings').style.display = 'block';
});
document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('popupSettings').style.display = 'none';
    document.getElementById('popupMain').style.display = 'block';
});
document.getElementById('startSessionButton').addEventListener('click', () => {
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('activeSession').style.display = 'block';
    localStorage.setItem('sessionActive', 'true');
});
document.getElementById('overrideButton').addEventListener('click', () => {
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('popupMain').style.display = 'block';
    localStorage.setItem('sessionActive', 'false');
})

//remember if there is an active session in progress
if(localStorage.getItem('sessionActive') === 'true'){
    console.log("session Persist!!!");
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('activeSession').style.display = 'block';
}

console.log("Popup Script Finished");


