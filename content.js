const channelName = document.getElementById('ChannelName');
const time = document.getElementById('Time');

(async () => {
    const response = await chrome.runtime.sendMessage({action: "get"});

    if(response === null){
        channelName.innerHTML = "Please open video or wait to load";
    }
    else{
        channelName.innerHTML = response.ChannelName;
        time.innerHTML = ToDateTime(response.Time);
    }
})();


function ToDateTime(secs) {
    const result = new Date(secs * 1000).toISOString().slice(11, 19);
    return result;
}