const match = location.href.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);

const overlay = document.createElement('div');
const inputField = document.createElement('input');

var storedHref = location.href;

const miniTimer = document.createElement('button');
const miniTimerDiv = document.createElement('div');
var miniTimerTarget = 0;

var streamlineYoutube = false;
var streamlineReddit = false;
var streamlineInstagram = false;
var streamlineTwitter = false;

chrome.storage.local.get(['streamlineYoutube', 'streamlineReddit', 'streamlineInstagram', 'streamlineTwitter'], (storageReturn) => {
  streamlineYoutube = storageReturn.streamlineYoutube;
  streamlineReddit = storageReturn.streamlineReddit;
  streamlineInstagram = storageReturn.streamlineInstagram;
  streamlineTwitter = storageReturn.streamlineTwitter;
});

const originalOverflow = document.body.style.overflow;
var timeOut = -1;
var reblockTimer = -1;
constructOverlay();
constructMiniTimer();

var mutationDebounce = 200;
var mutationTimeout = -1;
var lastMutationTime = 0;

var pageBlocked = false;

// ok so the problem we are facing is that media pausing and scrolling disabling often happens before the page is finished loading.
// also need to make sure scrolling RE-ENABLING happens when the page is done loading.
// right now, when the page is blocked, the pausing and scrolling gets run 3 times for the first 3 seconds.
// want to make it so that at all times, when a mutation is observed, we reapply those things.
const dynamicLoadingObserver = new MutationObserver((entries)=> {
  //console.log("mutation Observed!!!");
  //console.log(entries);
  //trick to debounce mutation observation.
  //check if href has changed
  if (location.href !== storedHref){
    storedHref = location.href;
    //console.log(storedHref);
    checkAndBlock();
  }
  if (entries[0].addedNodes.length && entries[0].addedNodes[0].nodeType !== 3){
    if (Date.now()-lastMutationTime > 0.25){
      reinforceState();
      lastMutationTime = Date.now();
    }
  }
});

function stripAll(){
  if (streamlineYoutube) stripYoutube();
  if (streamlineReddit) stripReddit();
  if (streamlineInstagram) stripInstagram();
  if (streamlineTwitter) stripTwitter();
}

function reinforceState() {
  stripAll();

  if (pageBlocked){
    //console.log("reacting!!!");
    document.querySelectorAll('audio, video').forEach(el => el.pause());
    document.body.style.setProperty('overflow', 'hidden', 'important');
  } else {
    document.body.style.overflow = originalOverflow;
  }
}


dynamicLoadingObserver.observe(document.body, {
  childList: true,         // Track additions/removals of child nodes
  subtree: true,           // Track mutations in the entire DOM tree
  attributes: false,        // Track changes to element attributes
  characterData: false     // Track changes to text nodes   // No filter on specific attributes
});

function reblockPage(){
  clearTimeout(reblockTimer);
  chrome.storage.local.get(['tempUnblockMap'], (res) => {
    //remove the temp unblock from the object/map
    delete res.tempUnblockMap[match[1]];
    chrome.storage.local.set({'tempUnblockMap' : res.tempUnblockMap});
  });
  blockPage();
}

function checkAndBlock(){
  //console.log("CHECKANDBLOCKING");
  chrome.storage.local.get(['targetDate', 'blockList', 'tempUnblockMap'], function(storageReturn){
    //if theres no block list, no need to check everything?
    if(!storageReturn.blockList){
      unblockPage();
      return;
    }
    //check if we are in a work session
    if (storageReturn.targetDate > Date.now()){
      //we are in an active session. check if we are in a blocked site or a good one
        goodSite = true;
        // TODO: maybe the popup should do this when it saves or adds things?
        const lineList = storageReturn.blockList.split('\n');
        lineList.forEach(blockListLine => {
          //check if line is nonempty and included in the href
          if (blockListLine && location.href.includes(blockListLine)){
            goodSite = false;
          } else if(blockListLine[0] === "-" && location.href.includes(blockListLine.slice(1))){
            //console.log("[][][exception: unblocking!][][]");
            //console.log(blockListLine);
            goodSite = true;
          }
        });
        if (!goodSite){
          //check for temp unblock and set timers correctly
          if (Object.hasOwn(storageReturn.tempUnblockMap, match[1])){
            //temp unblocked, set timers (TODO: how will this interface with override extensions?)
            miniTimerTarget = Math.min(storageReturn.tempUnblockMap[match[1]], storageReturn.targetDate);
            miniTimerDiv.style.display = 'flex';
            editMiniTimer();
            unblockPage();
            clearTimeout(reblockTimer);
            //avoid redundant page block. doesnt clear object, but returning from finished session will!
            if (Math.abs(miniTimerTarget - storageReturn.targetDate) > 1000){
              reblockTimer = setTimeout(reblockPage, miniTimerTarget - Date.now());
            }
          } else {
            blockPage();

            //set a timer to unblock the page at the end of the session, regardless of if we blocked it just now.
            clearTimeout(timeOut);
            var timeoutLength = storageReturn.targetDate - Date.now()
            //maximum time out is a bit over 24 days. 
            if(timeoutLength < 2147483647){
             timeOut = setTimeout(unblockPage, timeoutLength);
            }
          }
        } else {
          //we are in a good site
          //undo a possible previously made display
          unblockPage();
        }
    } else {
      //not in an active session
      //undo if unjustly blocked.
      unblockPage();
    } 
  });
}

checkAndBlock();

function reactToStorageChange(changes, area){
  //oh there is probably an infinite loop? or do gets fire this event?
  //alert("detected a change");
  //react to change in password
  if (changes.passPhrase){
    document.getElementById('lockInExtensionPassphraseReminder').innerText = changes.passPhrase.newValue;
  }
  if (changes.targetDate){
    //either new session started or old session canceled.
    if (changes.targetDate.newValue < Date.now()){
      //old session canceled.
      //  forget old reblocks: prevents scheduled blocking
      //  reblockPage doesn't get called, but thats ok because session cancel clears object/map
      clearTimeout(reblockTimer);

      //hopefully stop timer?
      miniTimerTarget = changes.targetDate.newValue;
    }
  }
  
  if (changes.tempUnblockMap){
    if (Object.hasOwn(changes.tempUnblockMap.newValue, match[1])){
      miniTimerTarget = changes.tempUnblockMap.newValue[match[1]];
    } else {
      //must have been deleted? or never existed
      miniTimerTarget = 0;
      //cancels reblockPage, but thats ok because theres no key to remove anyway
      clearTimeout(reblockTimer);
    }
  }

  var reStrip = false;
  if (changes.streamlineYoutube){
    streamlineYoutube = changes.streamlineYoutube.newValue; 
    reStrip = true;
  }
  if (changes.streamlineReddit){
    streamlineReddit = changes.streamlineReddit.newValue;
    reStrip = true;
  }
  if (changes.streamlineInstagram){
    streamlineInstagram = changes.streamlineInstagram.newValue;
    reStrip = true;
  }
  if (changes.streamlineTwitter){
    streamlineTwitter = changes.streamlineTwitter.newValue;
    reStrip = true;
  }
  if (reStrip) stripAll();

  if(changes.blockList || changes.targetDate || changes.tempUnblockMap){
    checkAndBlock();
  }
}

chrome.storage.onChanged.addListener(reactToStorageChange);

//Then create the whole page using javascript
function constructMiniTimer(){
  //create the div
  miniTimerDiv.style.display = 'none';
  miniTimerDiv.style.position = 'fixed';
  miniTimerDiv.style.top = '0';
  miniTimerDiv.style.left = '0';
  miniTimerDiv.style.zIndex = '9999';
  miniTimerDiv.style.gap = '3px';
  miniTimerDiv.style.alignContent = 'center';

  miniTimer.innerText = "00:00:00";
  styleElement(miniTimer);
  miniTimer.style.setProperty('font-size', '8', 'important');
  miniTimer.style.borderRadius = '0px';
  miniTimer.style.cursor = 'default';
  miniTimer.style.margin = '2px';
  miniTimer.style.padding = '2px';
  miniTimer.style.border = '1px';

  const timerX = document.createElement('button');
  styleElement(timerX);
  timerX.innerText = "✖";
  timerX.style.borderRadius = '0px';
  timerX.style.cursor = 'pointer';
  timerX.style.margin = '2px';
  timerX.style.padding = '2px';
  timerX.style.border = '1px';

  const minimizeArrow = document.createElement('button');
  styleElement(minimizeArrow);
  minimizeArrow.style.borderRadius = '0px';
  minimizeArrow.style.cursor = 'pointer';
  minimizeArrow.style.margin = '2px';
  minimizeArrow.style.padding = '4px 8px';
  minimizeArrow.style.border = '1px';

  const arrowSpan = document.createElement('span');
  //styleElement(arrowSpan);
  arrowSpan.innerText = "∧";
  arrowSpan.style.display = 'inline-block';
  arrowSpan.style.transition = 'transform 0.3s ease-in';
  arrowSpan.style.transform = 'rotate(0turn)';
  minimizeArrow.appendChild(arrowSpan);

  miniTimerDiv.appendChild(minimizeArrow);
  miniTimerDiv.appendChild(miniTimer);
  miniTimerDiv.appendChild(timerX);

  document.body.appendChild(miniTimerDiv);

  timerX.addEventListener('click', cancelTempUnblock);
  
  miniTimerDiv.style.transition = 'transform 0.3s ease-in';
  minimizeArrow.style.transition = 'transform 0.3s ease-in';
  minimizeArrow.addEventListener('click', () => {
    if (arrowSpan.style.transform.includes('rotate(0turn)')){
      //minimize timer
      miniTimerDiv.style.transform = 'translate(0px, -50px)';
      //this is a dumb solution, but it seems to work perfectly.
      minimizeArrow.style.transform = 'translate(0px, 50px)';
      arrowSpan.style.transform = 'rotate(0.5turn) translate(0px, -1px)';
    } else {
      miniTimerDiv.style.transform = 'translate(0px, 0px)';
      minimizeArrow.style.transform = 'translate(0px, 0px)';
      arrowSpan.style.transform = 'rotate(0turn) translate(0px, 0px)';
    }
  });
}

function cancelTempUnblock(){
  //this will cause the timer to go to 0 and stop updating
  miniTimerTarget = Date.now();
  miniTimerDiv.style.display = 'none';

  //remove block timer, because check and block should block the page anyway
  // skips deletion from object/map, but thats ok because we do it here anyway
  clearTimeout(reblockTimer);
  //now we have to update the target dates of the temp unblock list
  //this should trigger checkandblock?
  chrome.storage.local.get(['tempUnblockMap'], function(storageReturn){
    delete storageReturn.tempUnblockMap[match[1]];
    chrome.storage.local.set({'tempUnblockMap' : storageReturn.tempUnblockMap});
  });
}

function editMiniTimer(){
  const remainingTime = miniTimerTarget - Date.now();
  if (remainingTime > 0){
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));  // Hours
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));  // Minutes
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);  // Seconds
    miniTimer.innerText = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    setTimeout(editMiniTimer, 1000);
  } else {
    miniTimer.innerText = "00:00:00";
    miniTimerDiv.style.display = 'none';
  }
}

function padZero(number) {
  return number < 10 ? `0${number}` : `${number}`;
}

function constructOverlay(){
  //alert("blocking page!")
  overlay.style.boxSizing = 'border-box';
  overlay.id = 'lockInExtensionOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  overlay.style.display = 'none';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  overlay.style.gap = '0px';

  //create the passphrase typing target:
  const passphraseReminder = document.createElement('p');
  passphraseReminder.id = "lockInExtensionPassphraseReminder";
  styleElement(passphraseReminder);
  chrome.storage.local.get("passPhrase", function(value){
    if (value){
      passphraseReminder.innerText = value.passPhrase;
    }
  });

  // Create the passphrase input box
  const passphraseBox = document.createElement('div');
  passphraseBox.id = 'lockInExtensionPassphraseBox';

  styleElement(passphraseBox);

  passphraseBox.style.padding = '20px';
  passphraseBox.style.borderRadius = '8px';
  passphraseBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Enter passphrase to access site';
  
  styleElement(heading);
  heading.style.fontSize = '30px';
  heading.style.fontWeight = 300;

  inputField.type = 'text';
  inputField.id = 'lockInExtensionPassphraseInput';
  inputField.placeholder = 'Enter passphrase';
  inputField.style.width = '100%';
  inputField.style.padding = '2px';
  inputField.style.border = '2px solid black';

  styleElement(inputField);

  //hidden stuff for the minutes input
  const minutesInputField = document.createElement('input');
  styleElement(minutesInputField);
  minutesInputField.style.width = '20%';
  minutesInputField.style.display = 'none';

  const minutesEnterButton = document.createElement('button');
  styleElement(minutesEnterButton);
  minutesEnterButton.innerText = 'Enter';
  minutesEnterButton.style.display = 'none';

  const cancelUnblockButton = document.createElement('button');
  styleElement(cancelUnblockButton);
  cancelUnblockButton.innerText = 'Cancel';
  cancelUnblockButton.style.display = 'none';

  

  passphraseBox.appendChild(heading);
  passphraseBox.appendChild(passphraseReminder);
  passphraseBox.appendChild(inputField);

  passphraseBox.appendChild(minutesInputField);
  passphraseBox.appendChild(minutesEnterButton);
  passphraseBox.appendChild(cancelUnblockButton);

  overlay.appendChild(passphraseBox);

  // Add the overlay to the page
  document.body.appendChild(overlay);

  inputField.addEventListener('input', () => {
    if (inputField.value === passphraseReminder.innerText){
        askForMinutes();
      //alert("unblocking page!");
    }
  });

  function askForMinutes(){
    //hide old elements
    inputField.style.display = 'none';
    inputField.value = '';
    passphraseReminder.style.display = 'none';

    //display new elements
    heading.textContent = 'Unblock for how many minutes? (0 to cancel)';
    minutesInputField.style.display = 'block';
    minutesEnterButton.style.display = 'block';
    cancelUnblockButton.style.display = 'block';
  }

  function exitAskForMinutes(){
    //hide new elements
    minutesInputField.style.display = 'none';
    minutesInputField.innerText = '';
    minutesEnterButton.style.display = 'none';
    cancelUnblockButton.style.display = 'none';

    //redisplay old elements
    heading.textContent = 'Enter passphrase to access site';
    passphraseReminder.style.display = 'block';
    inputField.style.display = 'block';
  }

  cancelUnblockButton.addEventListener('click', exitAskForMinutes);

  minutesEnterButton.addEventListener('click', () => {
    const milliseconds = Math.floor(Number(minutesInputField.value)*60000);
    if(Number.isNaN(milliseconds)){
      alert(`Not a valid number`);
      return;
    }
    //alert(`unblocking page for: ${minutesInputField.value} minutes`);
    //TODO: error check the input value.
    
    //edit temporary unblock list and dates
    chrome.storage.local.get(['tempUnblockMap'], function(storageValue){
      storageValue.tempUnblockMap[match[1]] = milliseconds + Date.now();
        //hopefully this should cause check and block to run, turn on timer and stuff 
        chrome.storage.local.set({'tempUnblockMap'  : storageValue.tempUnblockMap});
    });
    minutesInputField.value = '';
    exitAskForMinutes();
    unblockPage();
  });
}

//set default styles for all elements in the overlay
function styleElement(element){
  element.style.backgroundColor = 'white';
  element.style.fontFamily = 'Arial, Helvetica, sans-serif';
  element.style.color = 'black';
  element.style.margin = '5px';
  element.style.fontSize = '20px';
  element.style.setProperty('font-size', 'border-box', 'important');
  element.style.setProperty('box-sizing', 'border-box', 'important');
  element.style.setProperty('line-height', '1.3', 'important');
}

function unblockPage(){
  mutationDebounce = 1000;
  pageBlocked = false;
  reinforceState();
  overlay.style.setProperty('display', 'none', 'important');
  inputField.value === '';
  //why are we doing this?
  //clearTimeout(timeOut);
}

function blockPage(){
  // Pause all media elements (video, audio)
  mutationDebounce = 250;
  pageBlocked = true;
  reinforceState();
  // Disable scrolling

  inputField.value === ''; //probably redundant

  //make the overlay visible
  overlay.style.setProperty('display', 'flex', 'important');
}