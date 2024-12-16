//TODO: redo this so that it doesnt reset all the stuff if its not necessary
const overlay = document.createElement('div');
const inputField = document.createElement('input');
const originalOverflow = document.body.style.overflow;
var timeOut = -1;
var reblockTimer = -1;
constructOverlay();

function checkAndBlock(){
  chrome.storage.local.get(['targetDate', 'blockList', 'temporaryUnblockDates', 'temporaryUnblockList'], function(storageReturn){
    //debug code:
    if (storageReturn.temporaryUnblockDates){
      console.log("DateS:");
      console.log(storageReturn.temporaryUnblockDates);
    }
    if (storageReturn.temporaryUnblockList){
      console.log("siteList:");
      console.log(storageReturn.temporaryUnblockList);
    }

    if (storageReturn.targetDate > Date.now()){
      //we are in an active session
        goodSite = true;
        // TODO: maybe the popup should do this when it saves or adds things?
        const lineList = storageReturn.blockList.split('\n');
        lineList.forEach(element => {
          if (location.href.includes(element)){
            goodSite = false;
            console.log("hit!!!");
            console.log(element);
          }
        });
        if (!goodSite){
          //check if temporarily Unblocked

          const match = location.href.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);
          const siteIndex = (storageReturn.temporaryUnblockList) ? storageReturn.temporaryUnblockList.indexOf(match[1]) : -1;
          if (siteIndex === -1){
            console.log("blocking because site not in exception list");
            blockPage();
          } else if (storageReturn.temporaryUnblockDates[siteIndex] > Date.now()){
            //set the timer to be the lesser of the unblock date or 
            console.log("unblocking, because Site is in exception list and the date is in the future!");
            unblockPage();
            //TODO: maybe should clear previous timer before adding this new one?
            if (storageReturn.temporaryUnblockDates[siteIndex] < storageReturn.targetDate){
              clearTimeout(reblockTimer);
              reblockTimer = setTimeout(blockPage, storageReturn.temporaryUnblockDates[siteIndex] - Date.now());
            }
          } else {
            console.log("blocking because unblock time is in the wrong range!");
            console.log("current time:");
            console.log(Date.now());
            console.log("------------");
            console.log("unblockDate:");
            console.log(storageReturn.temporaryUnblockDates[siteIndex]);
            blockPage();
          }
          //todo: move this so it only gets run if the page actually gets blocked?
          clearTimeout(timeOut);
          timeOut = setTimeout(unblockPage, storageReturn.targetDate - Date.now());
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
  if(changes.blockList || changes.targetDate || changes.temporaryUnblockDates){
    checkAndBlock();
  }
}

chrome.storage.onChanged.addListener(reactToStorageChange);

//Then create the whole page using javascript
function constructOverlay(){
  //alert("blocking page!")
  overlay.style.boxSizing = 'border-box';
  overlay.id = 'lockInExtensionOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  overlay.style.display = 'none';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  overlay.style.gap = '0px';

  //create the passphrase typing target:
  const passphraseReminder = document.createElement('p');
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
  minutesInputField.style.width = '20%';
  minutesInputField.style.display = 'none';

  const minutesEnterButton = document.createElement('button');
  minutesEnterButton.innerText = 'Enter';
  minutesEnterButton.style.display = 'none';

  const cancelUnblockButton = document.createElement('button');
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
    console.log("receiving input!!");
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
    alert(`blocking page for: ${minutesInputField.value} minutes`);
    const milliseconds = Math.floor(Number(minutesInputField.value)*60000);
    //TODO: error check the input value.
    //localStorage.setItem('reblockDate', minutesInputField.value*(60000) + Date.now());
    chrome.storage.local.get(['temporaryUnblockList', 'temporaryUnblockDates'], function(storageValue){
      if (storageValue.temporaryUnblockList){
        console.log("unblockList already exists! :)");
        const match = location.href.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);
        const siteIndex = storageValue.temporaryUnblockList.indexOf(match[1]);
        if (siteIndex !== -1){
          console.log("updating previous unblockDate!");
          storageValue.temporaryUnblockDates[siteIndex] = milliseconds + Date.now()
          ;
        } else {
          storageValue.temporaryUnblockList.push(match[1]);
          storageValue.temporaryUnblockDates.push(milliseconds + Date.now());
        }
        
        //hopefully this should cause check and block to run 
        
        chrome.storage.local.set({
          'temporaryUnblockList'  : storageValue.temporaryUnblockList,
          'temporaryUnblockDates' : storageValue.temporaryUnblockDates
        });
      } else {
        //first ever block, set new arrays
        console.log("setting unblock lists for the first time!!!");
        chrome.storage.local.set({
          'temporaryUnblockList'  : [`${match[1]}`],
          'temporaryUnblockDates' : [milliseconds + Date.now()]
        });
      }
    });

    //TODO: add a timer element to the corner of the page?
    

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
  overlay.style.setProperty('display', 'none', 'important');
  restoreOverflow();
  setTimeout(restoreOverflow, 1000);
  setTimeout(restoreOverflow, 2000);
  inputField.value === '';
  //why are we doing this?
  //clearTimeout(timeOut);
}

function restoreOverflow(){
  document.body.style.overflow = originalOverflow;
}

function pauseAllMedia(){
  document.querySelectorAll('audio, video').forEach(el => el.pause());
  document.body.style.setProperty('overflow', 'hidden', 'important');
}

function blockPage(){
  // Pause all media elements (video, audio)
  pauseAllMedia();
  setTimeout(pauseAllMedia, 1000);
  setTimeout(pauseAllMedia, 2000);
  // Disable scrolling

  inputField.value === ''; //probably redundant

  //make the overlay visible
  overlay.style.setProperty('display', 'flex', 'important');
}