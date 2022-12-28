let lastUpdatedInfo;
let currentOpenedTab;
let currentVideoId; //can be undefined

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        CreateLog(sender, request);

        if(request.action === 'update'){
            
            const ChannelName = request.data.ChannelName;
            const ChannelTime = request.data.Time;
            const VideoId = request.data.VideoId;

            chrome.storage.local.set({[ChannelName]: ChannelTime});

            if(currentVideoId === VideoId){
                lastUpdatedInfo = request.data;
            }
            else{
                IsUrlChanged();
            }

        }
        else if(request.action === 'get'){

            sendResponse(lastUpdatedInfo);
        }
    }
);

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        UpdateCurrentUrl(activeTab.url)
     });
});

function UpdateCurrentUrl(url)
{
    lastUpdatedInfo = null;
    currentOpenedTab = url;
    currentVideoId = GetVideoId(currentOpenedTab);
    
    console.log(currentOpenedTab)
}

function IsUrlChanged(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        if(currentOpenedTab !== activeTab.url){
            console.log("Changed ");
            console.log(currentOpenedTab);
            console.log(activeTab.url);
            UpdateCurrentUrl(activeTab.url);
        }
     });
}

function CreateLog(sender, request)
{
    const Log = 
    {
        CurrentUrl: currentOpenedTab,
        LastUpdatedInfo: lastUpdatedInfo,
        LastSender: sender,
        Request: request
    };

   // console.log(Log);
}

function GetVideoId(url){
    const video_id = url.split('v=')[1];
    console.log(video_id);
    const ampersandPosition = video_id.indexOf('&');
    console.log(ampersandPosition);
    if(ampersandPosition != -1) {
       return video_id.substring(0, ampersandPosition);
    }
    else{
        return video_id;
    }
}
