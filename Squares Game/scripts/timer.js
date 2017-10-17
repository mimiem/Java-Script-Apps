let timer = (()=>{

    let time = null;
    let hours = $('#hours');
    let minutes = $('#minutes');
    let secs = $('#seconds');
    seconds = 0;

    function outputTime(seconds) {
        seconds = Number(seconds);
        hours.text(('0' + Math.floor(seconds / 3600)).slice(-2));
        seconds = seconds % 3600;
        minutes.text(('0' + Math.floor(seconds / 60)).slice(-2));
        secs.text(('0' + seconds % 60).slice(-2));

    }

    function start() {
        time = setInterval(step, 1000);
        console.log(seconds);
        outputTime(seconds);
    }

    function stop() {
        clearInterval(time);
        seconds = 0;
    }


    function step() {
        seconds++;
        outputTime(seconds);
    }

    return{
        start,
        stop
    }
})();

