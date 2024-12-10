//idea: first check if the tab is in the list

//Then create the whole page using javascript
alert("running content script!333");
const overlay = document.createElement('div');
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
    console.log(value.passPhrase);
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

  function unblockPage(){
    overlay.style.setProperty('display', 'none', 'important');
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    //change this later to ask how long
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