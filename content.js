//idea: first check if the tab is in the list

//Then create the whole page using javascript
alert("running content script!333");
const overlay = document.createElement('div');
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

  //create the passphrase typing target:
  const passphraseReminder = document.createElement('p');
  passphraseReminder.style.fontFamily = 'Arial, Helvetica, sans-serif';
  passphraseReminder.style.color = 'black';
  chrome.storage.local.get("passPhrase", function(value){
    console.log(value.passPhrase);
    if (value){
      passphraseReminder.innerText = value.passPhrase + "test!!!";
    }
  });

  // Create the passphrase input box
  const passphraseBox = document.createElement('div');
  passphraseBox.id = 'lockInExtensionPassphraseBox';
  passphraseBox.style.backgroundColor = 'white';
  passphraseBox.style.fontFamily = 'Arial, Helvetica, sans-serif';
  passphraseBox.style.color = 'black';
  passphraseBox.style.padding = '20px';
  passphraseBox.style.borderRadius = '8px';
  passphraseBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  
  const heading = document.createElement('h2');
  heading.textContent = 'Enter passphrase to access site';
  heading.style.fontFamily = 'Arial, Helvetica, sans-serif';
  heading.style.color = 'black';
  heading.style.fontSize = '30px';
  heading.style.fontWeight = 300;


  const inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.id = 'lockInExtensionPassphraseInput';
  inputField.placeholder = 'Enter passphrase';

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