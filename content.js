const channelName = document.getElementById('ChannelName');
const time = document.getElementById('Time');

(async () => {

    const response = await GetInfo();

    channelName.innerHTML = response.ChannelName;
    time.innerHTML = ToDateTime(response.Time);
})();


async function GetInfo()
{
    const response = await chrome.runtime.sendMessage({action: "get"});
    
    if(response === null)
    {
        await Wait(1000);
        return GetInfo();
    }
    else{
        return response;
    }
}

function Wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ToDateTime(secs) {
    const result = new Date(secs * 1000).toISOString().slice(11, 19);
    return result;
}