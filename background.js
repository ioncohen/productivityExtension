chrome.runtime.onInstalled.addListener(setDefaults);

function setDefaults(details){
    if (details.reason === "install"){
        console.log("setting defaults");
        chrome.storage.local.set({'streamlineYoutube'  : false, 
                                  'streamlineReddit'   : false, 
                                  'streamlineInstagram': false,
                                  'streamlineTwitter'  : false});
        chrome.storage.local.set({'passPhrase' : 'default passphrase'});
        chrome.storage.local.set({'targetDate' : Date.now()-50000});
        chrome.storage.local.set({'blockList' : "example.com\nexample.org"});
        
    }
}