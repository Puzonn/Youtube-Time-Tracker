chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {

        if(msg.action === 'update'){
            const ChannelName = msg.data.ChannelName;
            const Time = msg.data.Time;

            chrome.storage.local.set({[ChannelName]: Time});
        }
      });
})

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request)
        if(request.action === 'get'){
            GetUpdatedData().then((data) => 
            {
                sendResponse(data)
            })

            return true;
        }
    }
);

async function GetUpdatedData(){
    try{
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        const response = await chrome.tabs.sendMessage(tab.id, {data: "get"});
        return response;
    }
    catch(exception){
        return null;
    }
}