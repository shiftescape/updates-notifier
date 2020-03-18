// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
'use strict';

(function() {

    let timerInterval = null

    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const hoursTxt = document.getElementById('hours');
    const statusCont = document.getElementById('color-stat');

    const isTimerRunning = () => timerInterval != null;
    const getHoursToMillis = (hours) => Math.floor((hours*1) * 60 * 60 * 1000);

    // Set text status on UI
    const setStatus = (status) => {
        statusCont.className = status ? 'started' : 'stopped';
        statusCont.textContent = status ? 'RUNNING' : 'STOPPED';
    }

    // Initialize button states
    const initButtonStates = () => {
        const timerRunningStatus = isTimerRunning();
        startBtn.disabled = timerRunningStatus;
        stopBtn.disabled = !timerRunningStatus;
        setStatus(timerRunningStatus);
    }

    // Facilitate sending notifications
    const sendNotification = (title, body) => {
        Notification.requestPermission()
            .then((result) => {
                new Notification(title, { body });
            })
            .catch((err) => alert(err));
    }

    // Start current interval
    const startTimerInterval = (hours) => {
        timerInterval = setInterval(() => {
            sendNotification('[REMINDER]: WFH Update Notification', 'Please send your current updates to your supervisor');
        }, getHoursToMillis(hours));
        initButtonStates();
    }

    // Start button click event
    startBtn.addEventListener('click', () => {
        if (!hoursTxt.value) {
            hoursTxt.value = 2;
            return;
        }
        sendNotification('[STARTED]: WFH Update Notification', 'Notification interval successfully started');
        startTimerInterval(hoursTxt.value);
    });

    // Stop button click event
    stopBtn.addEventListener('click', () => {
        const toStop = confirm('Stop current interval for notifications?');        
        if (toStop) {
            clearInterval(timerInterval);
            timerInterval = null;
            initButtonStates();
        }
    });

    // Init states onload
    initButtonStates();

})();