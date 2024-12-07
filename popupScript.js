function saveSettings(){
    const passText = document.getElementById('passInput').value
    localStorage.setItem('passPhrase', passText);

    const blockList = document.getElementById('blockList').value
    localStorage.setItem('blockList', blockList);
}


//Set up event listeners for page navigation buttons
document.getElementById('goToSettingsButton').addEventListener('click', () => {
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('popupSettings').style.display = 'block';
    //fill the settings with stored values (maybe do this at the start instead?)
    document.getElementById('passInput').value = localStorage.getItem('passPhrase');
    document.getElementById('blockList').value = localStorage.getItem('blockList');
});
document.getElementById('backButton').addEventListener('click', () => {
    saveSettings();
    document.getElementById('popupSettings').style.display = 'none';
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
        document.getElementById('activeSession').style.display = 'block';
        localStorage.setItem('sessionActive', 'true');
        localStorage.setItem('targetDate', Date.now() + Math.floor(sessionLength*(60000)));
        console.log("stored time!");
        console.log(`currentTime: ${Date.now()}`);
        startClock();
    } else {
        console.log("ERROR: Not a valid number");
        //TODO:display little red error message for the user.
    }
});
document.getElementById('overrideButton').addEventListener('click', () => {
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('popupMain').style.display = 'block';
    localStorage.setItem('sessionActive', 'false');
});
//save settings when save button is pressed
document.getElementById('saveSettingsButton').addEventListener('click', () => {
    saveSettings();
});

//remember if there is an active session in progress
if(localStorage.getItem('sessionActive') === 'true'){
    console.log("session Persist!!!");
    document.getElementById('popupMain').style.display = 'none';
    document.getElementById('activeSession').style.display = 'block';
    startClock();
}


let timerInterval;
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
        //TODO: also display some stuff/animations for the user?
        //wait what is the point of this, they cant work on anything while the tab is open. So this is just to check your progress for a moment i guess.
        return;
    }

    // Calculate hours, minutes, and seconds based on the remaining time
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));  // Hours
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));  // Minutes
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);  // Seconds

    // Display the countdown in the format: HH:MM:SS
    const countdownDisplay = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    console.log(countdownDisplay);  // You can update this line to show it in your HTML

    // Optional: Update an HTML element instead of logging to the console
    document.getElementById('timerDisplay').innerText = countdownDisplay;
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

// Start the countdown
if (localStorage.getItem('activeSession') === 'true')
    startClock();




//save variables when popup is closing
//chrome.windows.onFocusChanged.addListener(function(window) {
//    saveSett
//});

console.log("Popup Script Finished");


