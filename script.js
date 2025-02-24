console.log("let's start somethings.")
let currentsong = new Audio();
let songs;
let currfolder;

//getting the song from the server
async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let ans = await a.text();
    let div = document.createElement('div')
    div.innerHTML = ans;
    let as = div.getElementsByTagName('a');
    console.log(as)
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(decodeURI(element.href).split(`/${folder}/`)[1]);
        }
    }

    console.log(songs)

       // song going to list
 let songul = document.querySelector(".playlists");
 songul.innerHTML = ""
 for (let i = 0; i < songs.length; i++) {

     let li = document.createElement('li')
     li.textContent = songs[i].replaceAll('%20', ' ');

     songul.appendChild(li);
     console.log(li)
 }

 //play the song on which is clicked by the user
 document.querySelectorAll('.playlists li').forEach(li => {
     li.addEventListener('click', e => {
        let selectedSong = e.target.textContent.trim(); 
        console.log("Playing:", selectedSong);
        playmusic(selectedSong);
     })
 })

 return songs
}

// play song
function playmusic(track, pause = false) {
    // var audio = new Audio("/songs/"+track);
    currentsong.src = `/${currfolder}/` + track;
    // currentsong.load();
    if (!pause) {
        currentsong.play();
        play.src = 'player/pause.svg'
    }
    document.querySelector('.info').innerHTML = decodeURI(track).replaceAll('.mp3','')
    document.querySelector('.time').innerHTML = '00:00/00:00'

    currentsong.addEventListener('loadedmetadata', () => {
        let duration = formatTime(currentsong.duration); // Format duration properly
        document.querySelector('.time').innerHTML = `00:00 / ${duration}`;
    }, { once: true }); // `{ once: true }` ensures the event runs only once per song load

}



//display folder in the page
async function displayfolder() {

    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let ans = await a.text();
    let div = document.createElement('div')
    div.innerHTML = ans;
    let as = div.getElementsByTagName('a');
    let cards = document.querySelector('.cards')
    let array = Array.from(as)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
    
        if(e.href.includes('/songs/')){
            let folder = e.href.split('/').slice(-2)[0];
            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let ans = await a.json();
            console.log(ans.title, ans.discription)
            cards.innerHTML = cards.innerHTML + ` <div data-folder="${folder}" class="card">
              <div class="play">
                <img src="artists/play.png" id="Layer_1">
              </div>
              <img src=songs/${folder}/cover.jpg alt="singer">
              <span> ${ans.title} </span>
              <p>${ans.discription}</p>
            </div> `
        }
    }
    //to show the music present in the folder
Array.from(document.getElementsByClassName('card')).forEach(e => {
    console.log(e)
    e.addEventListener('click', async item => {
        console.log(item.currentTarget, item.currentTarget.dataset.folder)
        songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
        playmusic(songs[0])
    })

})

}

async function main() {
    // fetching song from web
    songs = await getsongs(`songs/romantic`);
    console.log(songs);
    playmusic(songs[0], true)

 
 displayfolder();

   let play = document.getElementById('play')

    //play and pause
    play.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = 'player/pause.svg'
        }
        else {
            currentsong.pause()
            play.src = "player/play.svg"
        }
    })


    //time duration using 'timeupdate'
    currentsong.addEventListener('timeupdate', () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector('.time').innerHTML = `${formatTime(currentsong.currentTime)}
       /${formatTime(currentsong.duration)}`
        document.querySelector('.circle').style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%'
    })

    //tracking the cursor(jahan marji baha le jao)
    document.querySelector('.duration').addEventListener('click', e => {
        console.log(e.offsetX, e.target.getBoundingClientRect().width)
        document.querySelector('.circle').style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + '%'
        currentsong.currentTime = (currentsong.duration * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100
    })

    let previous = document.getElementById('pre')
    let next = document.getElementById('next')

    console.log(decodeURI(currentsong))
    //making the previous and next button to use
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split(`${currfolder}/`)[1].replaceAll('%20',' '))
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    })
    next.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split(`${currfolder}/`)[1].replaceAll('%20',' '))
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    })


}

//function to covert seconds to min:sec format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);

    // Round up the remaining seconds to the nearest whole number
    const remainingSeconds = Math.ceil(seconds % 60);

    // Ensure seconds are always formatted with leading zero if less than 10
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes}:${formattedSeconds}`;
}

//to show the hamburger and gayab it
document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.left').style.left = '0%'
})
document.querySelector('.hamburgercross').addEventListener('click', () => {
    document.querySelector('.left').style.left = '-150%'
})

//for the volume like increase decrease and also for mute 
document.querySelector('.volume').addEventListener('change', (e) => {
    console.log(e.target.value)
    currentsong.volume = parseInt(e.target.value) / 100;
})

let previousVolume = 1; // Store last volume level

document.querySelector('.volume img').addEventListener('click', () => {
    if (currentsong.volume !== 0) {
        previousVolume = currentsong.volume; // Save current volume
        currentsong.volume = 0;
        document.querySelector('.volume img').src = 'player/mute.svg';
        document.querySelector('.volume').getElementsByTagName('input')[0].value = 0
        console.log(previousVolume)
    } else {
        currentsong.volume = previousVolume; // Restore previous volume
        document.querySelector('.volume img').src = 'player/volume.svg';
        document.querySelector('.volume').getElementsByTagName('input')[0].value = previousVolume*100
        console.log(previousVolume)
    }
});




main();