//idea: first check if the tab is in the list
const overlay = document.createElement('div');

function checkAndBlock(){
  chrome.storage.local.get('targetDate', function(targetDateValue){
    if (targetDateValue.targetDate > Date.now()){
      //we are in an active session
      chrome.storage.local.get("blockList", function(value){
        goodSite = true;
        console.log(value.blockList);
        const lineList = value.blockList.split('\n');
        lineList.forEach(element => {
          console.log()
          if (location.href.includes(element)){
            goodSite = false;
            console.log("hit!!!");
            console.log(element);
          }
        });
        if (!goodSite){
          blockSite();
        } else {
          overlay.style.display = 'none';
        }
      });
    } else {
      overlay.style.display = 'none';
    } 
  });
}

checkAndBlock();

function reactToStorageChange(changes, area){
  //oh there is probably an infinite loop? or do gets fire this event?
  alert("detected a change");
  if(changes.blockList || changes.targetDate){
    checkAndBlock();
  }
}

chrome.storage.onChanged.addListener(reactToStorageChange);

//Then create the whole page using javascript
function blockSite(){
  //alert("blocking page!");
  overlay.style.boxSizing = 'border-box';
  overlay.id = 'lockInExtensionOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.display = 'flex';
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


  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.id = 'lockInExtensionPassphraseInput';
  inputField.placeholder = 'Enter passphrase';
  inputField.style.width = '100%';
  inputField.style.padding = '2px';
  inputField.style.border = '2px solid black';

  styleElement(inputField);

  passphraseBox.appendChild(heading);
  passphraseBox.appendChild(passphraseReminder);
  passphraseBox.appendChild(inputField);
  overlay.appendChild(passphraseBox);

  // Add the overlay to the page
  document.body.appendChild(overlay);



  inputField.addEventListener('input', () => {
    console.log("receiving input!!");
    if (inputField.value === passphraseReminder.innerText){
      inputField.value = '';
      unblockPage();
      alert("unblocking page!");
    }
  });
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
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';

    //change this later to ask how long
  }
}
