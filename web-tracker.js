const apiKey = {YOUR_YOUTUBE_API_KEY}

let currentVideoId;

let pauseButton;
let url;

window.addEventListener("load", function () {
    Init();
});

function Init(){
    pauseButton = this.document.getElementsByClassName('ytp-play-button ytp-button')[0];
    url = window.location.href;
    
    currentVideoId = GetVideoId(url);

    if(typeof currentVideoId === 'undefined'){
        console.error('videoId is undefined')
        return;
    }
    
    FetchVideoData(currentVideoId, (data) => {
        const channelName = data.items[0].snippet.channelTitle;

        GetTime(channelName, (time) => {
            CreateLoop(time, channelName);
        });
    })
}

function IsPlayerPaused(){
    const pauseAttribute = pauseButton.getAttribute('data-title-no-tooltip');

    if(pauseButton === null){
        pauseButton = this.document.getElementsByClassName('ytp-play-button ytp-button')[0];
        return false;
    }

    if(pauseAttribute === 'Wstrzymaj' || pauseAttribute === 'Pause'){
      return false;
    }
    else{
      return true;
    }
}

function GetVideoId(url){
    const video_id = url.split('v=')[1];

    const ampersandPosition = video_id.indexOf('&');

    if(ampersandPosition != -1) {
       return video_id.substring(0, ampersandPosition);
    }
    else{
        return video_id;
    }
}

async function FetchVideoData(videoId, callback){
    const url = 'https://www.googleapis.com/youtube/v3/videos?id='+videoId+'&part=snippet&key='+apiKey;

    await fetch(url)
    .then(res => res.json())
    .then(res => {
        callback(res)
    })
}

function GetTime(channelName, callback){
    const time = chrome.storage.local.get(channelName, function(data) {
        callback(data[channelName])
    });
}

function SetTime(channelName, time){
    const actualInfo =
    {
        ChannelName: channelName,
        Time: time,
        VideoId: currentVideoId
    }

    chrome.runtime.sendMessage({action: 'update', data: actualInfo});
}

function CreateLoop(actualTime, channelName){
    let time = parseInt(actualTime);

    if(isNaN(time)){
        time = 0;
    }

    SetTime(channelName, time);

    const loop = () => setTimeout(() =>
    {
        if(!IsPlayerPaused()){
            time += 2;
            console.log(time)
            SetTime(channelName, time);
        }

        if(IsUrlChanged()){
            Init();
            return;
        }
        
        loop();
    }, 2000)

    loop();
}

function IsUrlChanged(){
    return url !== window.location.href;
}