class Connection 
{
    constructor()
    {
        this.connect();
    }

    sendMessage(action, data){
        this.connection.postMessage({action: action, data: data});
    }

    connect(){
        this.connection = chrome.runtime.connect();
    }

    disconnect(){
        this.connect.disconnect();
    }
}

const apiKey = "AIzaSyA4GgVJzUOFmrewoDQU-Bd6i15LchboG3o"

let CurrentUrl;

let currentVideoId;

let ElementPauseButton;

let CurrentInfo = null;

/* Long lived connection */
const connection = new Connection();

window.addEventListener("load", function () {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) 
        {
            sendResponse(CurrentInfo)
        }
    )

    Init();
});


function Init(){
    CurrentUrl = window.location.href;
    currentVideoId = GetVideoId(CurrentUrl);

    if(typeof currentVideoId === 'undefined'){
        console.log('No youtube video url')
        ListenForPlayer();
        return;
    }

    ElementPauseButton = this.document.getElementsByClassName('ytp-play-button ytp-button')[0];
    
    FetchVideoData(currentVideoId, (data) => {

        const channelName = data.items[0].snippet.channelTitle;

        GetTime(channelName, (time) => {
            CreateLoop(time, channelName);
        });
    })
}

function IsPlayerPaused(){
    const pauseAttribute = ElementPauseButton.getAttribute('data-title-no-tooltip');

    if(ElementPauseButton === null){
        ElementPauseButton = this.document.getElementsByClassName('ytp-play-button ytp-button')[0];
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

    if(typeof video_id === 'undefined'){
        return undefined;
    }
    const ampersandPosition = video_id.indexOf('&');

    //Support for more browsers
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

    CurrentInfo = actualInfo;

    connection.sendMessage('update', actualInfo);
}

/* When url is 'https://www.youtube.com/' <= from manisteft.json,  it will listen for url change to 'https://www.youtube.com/watch?=*' */
function ListenForPlayer()
{
    const listen = () => 
    {
        if(IsUrlChanged()){
            clearInterval(loop);
            Init();
        }
    }
    
    const loop = setInterval(listen, 1000)
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

        if(DidUrlChanged()){
            Init();
            return;
        }
        
        loop();
    }, 2000)

    loop();
}

function DidUrlChanged(){
    return CurrentUrl !== window.location.href;
}