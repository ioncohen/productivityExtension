function saveSettings(){
    const passText = document.getElementById('passInput').value
    localStorage.setItem('passPhrase', passText.trim());
    chrome.storage.local.set({'passPhrase': passText.trim()});

    const blockList = document.getElementById('blockList').value
    localStorage.setItem('blockList', blockList.trim());
    chrome.storage.local.set({'blockList': blockList.trim()});

    const streamlineYoutube = document.getElementById('streamlineYoutube').checked;
    const streamlineReddit = document.getElementById('streamlineReddit').checked;
    const streamlineInstagram = document.getElementById('streamlineInstagram').checked;
    const streamlineTwitter = document.getElementById('streamlineTwitter').checked;

    localStorage.setItem('streamlineYoutube', streamlineYoutube);
    localStorage.setItem('streamlineReddit', streamlineReddit);
    localStorage.setItem('streamlineInstagram', streamlineInstagram);
    localStorage.setItem('streamlineTwitter', streamlineTwitter);

    chrome.storage.local.set({'streamlineYoutube'  : streamlineYoutube, 
                              'streamlineReddit'   : streamlineReddit, 
                              'streamlineInstagram': streamlineInstagram,
                              'streamlineTwitter'  : streamlineTwitter});
}

function returnFromSession(){
    clearTimeout()
    document.getElementById('typePassphrase').style.display = 'none';
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('popupMain').style.display = 'block';
    localStorage.setItem('targetDate', Date.now()-50000);
    chrome.storage.local.set({'targetDate' : Date.now()-50000});
    localStorage.setItem('sessionActive', 'false');
    
    console.log("hiding hidden message!");
    document.getElementById('hiddenMessage').style.opacity = 0;
    document.getElementById('hiddenMessage').style.display = 'none';
    
    document.getElementById('hiddenMessage').style.pointerEvents = 'none';
    document.getElementById('hiddenLine').style.display = 'block';
}

//Set up event listeners for page navigation buttons
document.getElementById('goToSettingsButton').addEventListener('click', () => {
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('logoHeader').style.display = 'none';
    document.getElementById('popupSettings').style.display = 'block';
    //fill the settings with stored values (maybe do this at the start instead?)
    document.getElementById('passInput').value = localStorage.getItem('passPhrase');
    document.getElementById('blockList').value = localStorage.getItem('blockList');

    document.getElementById('streamlineYoutube').checked = localStorage.getItem('streamlineYoutube') === 'true';
    document.getElementById('streamlineReddit').checked = localStorage.getItem('streamlineReddit') === 'true';
    document.getElementById('streamlineInstagram').checked = localStorage.getItem('streamlineInstagram') === 'true';
    document.getElementById('streamlineTwitter').checked = localStorage.getItem('streamlineTwitter') === 'true';

});

document.getElementById('backButton').addEventListener('click', () => {
    saveSettings();
    document.getElementById('popupSettings').style.display = 'none';
    document.getElementById('logoHeader').style.display = 'block';
    document.getElementById('popupMain').style.display = 'block';
});

//start session Button
document.getElementById('startSessionButton').addEventListener('click', () => {
    console.log("trying to start session");
    const sessionLength = Number(document.getElementById("sessionLengthInput").value)
    console.log(sessionLength);
    if (sessionLength){
        //start session, save target date!
        document.getElementById('popupMain').style.display = 'none';
        document.getElementById('activeSession').style.display = 'flex';
        localStorage.setItem('sessionActive', 'true');
        localStorage.setItem('targetDate', Date.now() + Math.floor(sessionLength*(60000)));
        chrome.storage.local.set({'targetDate': Date.now() + Math.floor(sessionLength*(60000))}); // save target date for content scripts to access
        console.log("stored time!");
        console.log(`currentTime: ${Date.now()}`);
        startClock();
    } else {
        console.log("ERROR: Not a valid number");
        //TODO: display little red error message for the user.
    }
});
document.getElementById('sessionEndReturn').addEventListener('click', () => {
    returnFromSession();
});

//save settings when save button is pressed
document.getElementById('saveSettingsButton').addEventListener('click', () => {
    saveSettings();
});

let timerInterval;
//remember if there is an active session in progress
if(localStorage.getItem('sessionActive') === 'true'){
    console.log("session Persist!!!");
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('activeSession').style.display = 'flex';

    if(localStorage.getItem('targetDate') < Date.now()){
        //display hiddenMessage ABRUPTLY if past deadline.
        document.getElementById('hiddenLine').style.display = 'none';
        document.getElementById('hiddenMessage').style.opacity = '1';
        document.getElementById('hiddenMessage').style.display = 'block';
        document.getElementById('hiddenMessage').style.pointerEvents = 'auto';
    }

    startClock();
}

const exitButtons = document.querySelectorAll('.exitButton');
// Loop through all elements and add an event listener
exitButtons.forEach((element) => {
  element.addEventListener('click', () => {
    localStorage.setItem('sessionActive', 'false');
    window.close();
  });
});

//Update Timer during activeSession
// Example target date (you can replace this with your saved target date)
// Function to update the countdown
function updateCountdown() {
    // Get the current time
    const currentTime = Date.now();
    
    // Calculate the difference in milliseconds between now and the target date
    const remainingTime = localStorage.getItem('targetDate') - currentTime;

    // If the target date has passed, stop the countdown
    if (remainingTime <= 0) {
        console.log("The countdown has ended!");
        clearInterval(timerInterval);  // Stop the timer
        if (localStorage.getItem('sessionActive') === 'true'){
            console.log("displaying hiddenMessage!");
            if (document.getElementById('hiddenMessage').style.display !== 'block'){
                document.getElementById('hiddenLine').style.opacity = '0';
                setTimeout(finishDisplayingHidden, 1000);
            }
        }
        return;
    }

    // Calculate hours, minutes, and seconds based on the remaining time
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));  // Hours
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));  // Minutes
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);  // Seconds

    // Display the countdown in the format: HH:MM:SS
    const countdownDisplay = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    //console.log(countdownDisplay);  //<---for debugging purposes

    // update timer html.
    document.getElementById('timerDisplay').innerText = countdownDisplay;
}

function finishDisplayingHidden(){
    document.getElementById('hiddenLine').style.display = 'none';
    document.getElementById('hiddenMessage').style.display = 'block';
    document.getElementById('hiddenMessage').style.pointerEvents = 'auto';
    setTimeout(()=>{document.getElementById('hiddenMessage').style.opacity = '1'}, 100);
}

// Function to pad single digit numbers with leading zero (e.g., 3 => "03")
function padZero(number) {
    return number < 10 ? `0${number}` : `${number}`;
}

// Function to schedule the first interval halfway through the next second
function startClock() {
    updateCountdown();
    const currentTime = Date.now();
    
    // Calculate milliseconds until the next second boundary
    const msUntilNextSecond = 1000 - (currentTime % 1000);
    let msToDelay;
    if (msUntilNextSecond > 500){
        msToDelay = msUntilNextSecond - 500;
    } else {
        msToDelay = msUntilNextSecond + 500;
    }

    // Schedule the first update at the halfway point of the next second
    // Set a timeout to update the countdown at the halfway point
    setTimeout(function() {
        // After the first update, set an interval to update every second
        updateCountdown();  // Update right away at the halfway point
        timerInterval = setInterval(updateCountdown, 1000);  // Then update every second
    }, msToDelay);
}

// Start the countdown on popup restart if the session is still active
if (localStorage.getItem('activeSession') === 'true')
    startClock();

//Listen to all "blockThisSite" buttons, and add current site to blockList.
blockThisSiteButtons = document.getElementsByClassName('blockThisSite');
for(button of blockThisSiteButtons){
    button.addEventListener('click', blockThisSiteListener);
}

function blockThisSiteListener(){
    (async () => {
        // get last focused window from chrome
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const match = tab.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);
        console.log(tab.url);
        console.log(match);
        if (match){
            currentBlockList = localStorage.getItem('blockList');
            if (currentBlockList.includes(match[1] + "\n") || currentBlockList.endsWith(match[1])){
                alert("already blocked");
            } else {
                const newBlockList = match[1] + '\n' + localStorage.getItem('blockList');
                localStorage.setItem('blockList', newBlockList);
                chrome.storage.local.set({'blockList': newBlockList});
            }
        } else {
            alert("Can't block this site, sorry");
        }
      })();
}

document.getElementById('overrideButton').addEventListener('click', () => {
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('typePassphrase').style.display = 'block';
    
    document.getElementById('targetPassphrase').innerText = localStorage.getItem('passPhrase');
});

let targetPassphrase = localStorage.getItem('passPhrase');
document.getElementById('cancelOverride').addEventListener('click', () => {
    document.getElementById('typePassphrase').style.display = 'none';
    document.getElementById('typePassBox').value = '';
    document.getElementById('activeSession').style.display = 'flex';
    targetPassphrase = localStorage.getItem('passPhrase');
    document.getElementById('targetPassphrase').innerText = targetPassphrase;
});

document.getElementById('typePassBox').addEventListener('input', (event) => {
    //console.log("key pressed:");
    //console.log(event.target.value);
    if (event.target.value === targetPassphrase){
        event.target.value = '';
        returnFromSession();
    }
});

/*
document.getElementById('typePassBox').addEventListener('input', (event) => {
    console.log("key pressed!");
    console.log(event.target.value);
    if (event.target.value === targetPassphrase){
        returnFromSession();
    }
});
*/

//save variables when popup is closing
//chrome.windows.onFocusChanged.addListener(function(window) {
//    saveSett
//});

console.log("Popup Script Finished");


