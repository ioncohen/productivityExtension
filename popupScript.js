
function initialize(){
    if (localStorage.getItem('initialized')){
        return;
    } else {
        //set defaults for streamlines
        localStorage.setItem('streamlineYoutube', 'false');
        localStorage.setItem('streamlineReddit', 'false');
        localStorage.setItem('streamlineInstagram', 'false');
        localStorage.setItem('streamlineTwitter', 'false');
        chrome.storage.local.set({'streamlineYoutube'  : false, 
                                  'streamlineReddit'   : false, 
                                  'streamlineInstagram': false,
                                  'streamlineTwitter'  : false});
        
        //set default passphrase
        localStorage.setItem('passPhrase', 'default passphrase');
        chrome.storage.local.set({'passPhrase' : 'default passphrase'});
        
        //TODO: set default blockList somehow? hope i dont have to
        
        //set default session settings
        localStorage.setItem('targetDate', Date.now()-50000);
        chrome.storage.local.set({'targetDate' : Date.now()-50000});
        localStorage.setItem('sessionActive', 'false');
        
        //set default block list:
        localStorage.setItem('blockList', "example.com\nexample.org");
        chrome.storage.local.set({'blockList' : "example.com\nexample.org"});
        //set a reminder to not initialize in the future
        localStorage.setItem('initialized', 'true');
    }
}

function goToSettings(){
    //store state
    localStorage.setItem('sessionActive', 'settings');

    //hide and display pages
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
}

initialize();

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
    //ensure extend button gets reset
    document.getElementById('extendButtonPrompt').style.display = 'none';
    document.getElementById('extendButton').style.display = 'block';
    document.getElementById('extendNumInput').value = '';

    //cancel all active unblocks
    chrome.storage.local.set({'tempUnblockMap' : Object.create(null)});

    //display home screen
    document.getElementById('typePassphrase').style.display = 'none';
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('popupMain').style.display = 'block';

    localStorage.setItem('targetDate', Date.now()-50000);

    //should trigger check and block.
    chrome.storage.local.set({'targetDate' : Date.now()-50000});
    localStorage.setItem('sessionActive', 'false');
    
    //hide hidden message
    document.getElementById('hiddenMessage').style.opacity = 0;
    document.getElementById('hiddenMessage').style.display = 'none';
    
    document.getElementById('hiddenMessage').style.pointerEvents = 'none';
    document.getElementById('hiddenLine').style.display = 'block';
}

//Set up event listeners for page navigation buttons
document.getElementById('goToSettingsButton').addEventListener('click', goToSettings);

document.getElementById('backButton').addEventListener('click', () => {
    localStorage.setItem('sessionActive', 'false');
    saveSettings();
    document.getElementById('popupSettings').style.display = 'none';
    document.getElementById('logoHeader').style.display = 'block';
    document.getElementById('popupMain').style.display = 'block';
});

//infinite session button
document.getElementById('infBlock').addEventListener('click', () => {
    document.getElementById('sessionLengthInput').value = 'Infinity'; 
});

//Listen for enter in sessionlength input
document.getElementById('sessionLengthInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter'){
        startSession();
    }
});

//start session Button
document.getElementById('startSessionButton').addEventListener('click', startSession);

function startSession(){
    const sessionLength = Number(document.getElementById("sessionLengthInput").value)
    if (sessionLength){
        //start session, set target date and other vars

        chrome.storage.local.set({'allowOverrides' : document.getElementById('allowOverridesCheck').checked});
        
        //This line clears the sessionlengthInput. TODO: decide whether this is desired
        document.getElementById('sessionLengthInput').value = '';

        document.getElementById('hiddenLine').style.opacity = 1;
        document.getElementById('hiddenLine').style.display = 'block';

        document.getElementById('popupMain').style.display = 'none';
        document.getElementById('activeSession').style.display = 'flex';
        localStorage.setItem('sessionActive', 'true');
        localStorage.setItem('targetDate', Date.now() + Math.floor(sessionLength*(60000)));
        if (Date.now() + Math.floor(sessionLength*(60000)) > Number.MAX_SAFE_INTEGER){
            chrome.storage.local.set({'targetDate': Number.MAX_SAFE_INTEGER}); // save target date for content scripts to access
        } else {
            chrome.storage.local.set({'targetDate': Date.now() + Math.floor(sessionLength*(60000))}); // save target date for content scripts to access
        }

        startClock();
    } else {
        alert("Not a valid number");
        //TODO: display little red error message for the user?
    }
}

document.getElementById('sessionEndReturn').addEventListener('click', () => {
    returnFromSession();
});

//save settings when save button is pressed
document.getElementById('saveSettingsButton').addEventListener('click', () => {
    saveSettings();
});

document.getElementById('discardChanges').addEventListener('click', () => {
    localStorage.setItem('sessionActive', 'false');
    revertSettings();
    document.getElementById('popupSettings').style.display = 'none';
    document.getElementById('logoHeader').style.display = 'block';
    document.getElementById('popupMain').style.display = 'block';
});

function revertSettings(){
    const getList = ['passPhrase', 'blockList', 'streamlineYoutube', 'streamlineReddit', 'streamlineInstagram', 'streamlineTwitter'];
    chrome.storage.local.get(getList, (storage) => {
        //revert passphrase and blocklist
        localStorage.setItem('passPhrase', storage.passPhrase);
        localStorage.setItem('blockList', storage.blockList);
        //revert streamlines
        localStorage.setItem('streamlineYoutube', storage.streamlineYoutube);
        localStorage.setItem('streamlineReddit', storage.streamlineReddit);
        localStorage.setItem('streamlineTwitter', storage.streamlineTwitter);
        localStorage.setItem('streamlineInstagram', storage.streamlineInstagram);
    });
}

//listen for newBlockButton click
document.getElementById('blockThisSiteActive').addEventListener('click', () => {
    //fill input with current site:
    blockThisSiteListener(null, document.getElementById('newBlockInput'));
    //swap button for fake button
    document.getElementById('blockThisSiteActive').style.display = 'none';
    document.getElementById('blockThisSitePrompt').style.display = 'block';

});

document.getElementById('newBlockEnter').addEventListener('click', newBlockEnter);
document.getElementById('newBlockInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter'){
        newBlockEnter();
    }
});
function newBlockEnter(){
    //empty out the thing and append
    prependToBlockList(document.getElementById('newBlockInput').value);
    cancelBlockThisSite();
}

function cancelBlockThisSite(){
    //empty input
    document.getElementById('newBlockInput').value = '';
    //swap buttons back
    document.getElementById('blockThisSiteActive').style.display = 'block';
    document.getElementById('blockThisSitePrompt').style.display = 'none';
}

document.getElementById('cancelNewBlock').addEventListener('click', cancelBlockThisSite);

//listen for extendbutton click
document.getElementById('extendButton').addEventListener('click', () => {
    document.getElementById('extendButton').style.display = 'none';
    document.getElementById('extendButtonPrompt').style.display = 'block';
});

//listen for extend length enter
//disallow negatives
document.getElementById('extendEnter').addEventListener('click', () =>{
    if (document.getElementById('extendNumInput').value >= 0 && Number(localStorage.getItem('targetDate')) > Date.now() + 1000){
        //compute new target date from old one
        const newTargetDate = Number(localStorage.getItem('targetDate')) + (document.getElementById('extendNumInput').value * 60000);
        localStorage.setItem('targetDate', newTargetDate);
        //this should trigger check and block, but will that correctly change minitimer and so on? probably not. also will not change timeouts
        chrome.storage.local.set({'targetDate' : newTargetDate});
    }
    document.getElementById('extendButtonPrompt').style.display = 'none';
    document.getElementById('extendButton').style.display = 'block';
    document.getElementById('extendNumInput').value = '';
});


let timerInterval;

//remember if there is an active session in progress
if(localStorage.getItem('sessionActive') === 'true'){ 
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('activeSession').style.display = 'flex';
    
    if(Number(localStorage.getItem('targetDate')) < Date.now()){
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
    const remainingTime = Number(localStorage.getItem('targetDate')) - currentTime;

    // If the target date has passed, stop the countdown
    if (remainingTime <= 0) {
        clearInterval(timerInterval);  // Stop the timer
        if (localStorage.getItem('sessionActive') === 'true'){
            //display hidden message
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

    var countdownDisplay = '';
    if (remainingTime >= Number.MAX_SAFE_INTEGER){
        countdownDisplay = 'Infinite';
    } else if (remainingTime >= 143000*(60000)){
        document.getElementById('timerDisplay').style.fontSize = 44;
        countdownDisplay = '>99 Days';
    } else if (hours >= 100){
        //display in days
        countdownDisplay = `${Math.floor(hours/24)} Days`;
    } else {
        // Display the countdown in the format: HH:MM:SS
        countdownDisplay = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }

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

//event listener to autosave passphrase
document.getElementById('passInput').addEventListener('keyup', (event) => {
    localStorage.setItem('passPhrase', event.target.value);
})

//event listener to autosave blocklist
document.getElementById('blockList').addEventListener('keyup', (event) => {
    localStorage.setItem('blockList', event.target.value);
})

//event listener to autosave checkBoxes
function setupCheckboxAutosave(elementID, storageItemName = elementID){
    document.getElementById(elementID).addEventListener('click', (event) => {
        console.log("event listener triggered!");
        console.log(event.target.checked);
        localStorage.setItem(storageItemName, event.target.checked);
    });
}

setupCheckboxAutosave('streamlineYoutube');
setupCheckboxAutosave('streamlineReddit');
setupCheckboxAutosave('streamlineInstagram');
setupCheckboxAutosave('streamlineTwitter');

document.getElementById('passInput').addEventListener('keyup', (event) => {
    localStorage.setItem('passPhrase', event.target.value);
})

// Start the countdown on popup restart if the session is still active
if (localStorage.getItem('sessionActive') === 'settings'){
    goToSettings();
}



//Listen to "blockThisSite" button, and add current site to blockList.
document.getElementById('blockThisSite').addEventListener('click', blockThisSiteListener);

function prependToBlockList(newLine){
    currentBlockList = localStorage.getItem('blockList');
    // change to \n before, OR begins with?.
    if (currentBlockList.includes("\n" + newLine + "\n") 
        || currentBlockList.startsWith(newLine + "\n") 
        || currentBlockList.endsWith("\n" + newLine) 
        || currentBlockList === newLine){
        alert("already blocked");
    } else {
        const newBlockList = newLine + '\n' + currentBlockList;
        localStorage.setItem('blockList', newBlockList);
        chrome.storage.local.set({'blockList': newBlockList});
    }
}

function blockThisSiteListener(event, inputToFill = null){
    (async () => {
        // get last focused window from chrome
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        const match = tab.url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);
        
        if (inputToFill){
            inputToFill.value = match[1];
            return;
        }
        // if not returned, we are in simple home button
        // check if match works (on an actual site)
        if (match){
            prependToBlockList(match[1]);
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

document.getElementById('cancelOverride').addEventListener('click', () => {
    document.getElementById('typePassphrase').style.display = 'none';
    document.getElementById('typePassBox').value = '';
    document.getElementById('activeSession').style.display = 'flex';

    //TODO:remove this? and investigate weird targetPassphrase shenanigans
    document.getElementById('targetPassphrase').innerText = localStorage.getItem('passPhrase');
});

//wait for password match and cancel override
document.getElementById('typePassBox').addEventListener('input', (event) => {
    if (event.target.value === localStorage.getItem('passPhrase')){
        event.target.value = '';
        returnFromSession();
    }
});