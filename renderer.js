// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
'use strict';

(function() {

    let currentTime = null;
    let nextTime = null;
    let timerInterval = null
    let isInstant = true;

    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const hoursTxt = document.getElementById('hours');
    const statusCont = document.getElementById('color-stat');
    const timeTxt = document.getElementById('time');
    const timeWrapper = document.getElementById('time-wrapper');
    const nextNotifWrapper = document.getElementById('next-notif-wrapper');
    const nextNotif = document.getElementById('color-stat-next');
    const startOptions = document.getElementsByName('start-option');

    const isTimerRunning = () => timerInterval != null;

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
        hoursTxt.disabled = timerRunningStatus;
        timeTxt.disabled = timerRunningStatus;
        startOptions.forEach((opt) => opt.disabled = timerRunningStatus);
        setStatus(timerRunningStatus);
    }

    const setNextNotifDisplay = () => {
        nextNotifWrapper.style.display = 'inline-block';
        nextNotif.innerHTML = `${nextTime.hours().toString().padStart(2, '0')}:${nextTime.minutes().toString().padStart(2, '0')}`;
    }

    const hideNotifDisplay = () => {
        nextNotifWrapper.style.display = 'none';
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
    const startTimerInterval = () => {
        getCurrentTime(null, isInstant, (isInstant ? null : (timeTxt.value*1)));

        timerInterval = setInterval(() => {
            currentTime = moment();
            if (currentTime.format('X') >= nextTime.format('X')) {
                getCurrentTime(nextTime, isInstant, (isInstant ? null : (timeTxt.value * 1)));
                sendNotification('[REMINDER]: WFH Update Notification', 'Please send your current updates to your supervisor');
            }
        }, 1000);
        initButtonStates();
    }

    const getCurrentTime = (baseTime, instant, minTime) => {
        nextTime = !baseTime ? moment() : baseTime;
        nextTime.set({ minute: (!instant ? (minTime == null ? nextTime.minute() : (minTime*1)) : nextTime.minute()), second: 0 });
        nextTime.add((hoursTxt.value * 1), 'hour');
        setNextNotifDisplay();
        return nextTime.minute();
    }

    // Start button click event
    startBtn.addEventListener('click', () => {
        if (!hoursTxt.value || hoursTxt.value < 1) {
            hoursTxt.value = 2;
            getCurrentTime(null, true, null);
            hoursTxt.focus();
            return;
        }

        if (!isInstant && (!timeTxt.value || timeTxt.value < 1 || timeTxt.value > 60)) {
            getCurrentTime(null, false, null);
            timeTxt.value = nextTime.minutes();
            timeTxt.focus();
            return
        }

        sendNotification('[STARTED]: WFH Update Notification', 'Notification interval successfully started');
        startTimerInterval();
    });

    // Stop button click event
    stopBtn.addEventListener('click', () => {
        const toStop = confirm('Do you want to stop the current interval for update notifications?');        
        if (toStop) {
            clearInterval(timerInterval);
            timerInterval = null;
            initButtonStates();
            getCurrentTime(null, isInstant, null);
        }
    });

    startOptions.forEach((opt) => {
        opt.removeEventListener('change', () => {});
        opt.addEventListener('change', () => {
            if (opt.value === 'GIVEN-TIME') {
                isInstant = false;
                timeWrapper.style.display = 'inline-block';
                timeTxt.value = getCurrentTime(null, false, null);
                timeTxt.focus();
            } else {
                isInstant = true;
                getCurrentTime(null, true, null)
                timeWrapper.style.display = 'none';
            }
        });
    });

    timeTxt.addEventListener('change', () => {
        isInstant = false;
        getCurrentTime(null, false, timeTxt.value);
    });
    
    hoursTxt.addEventListener('change', () => {
        if (hoursTxt.value && hoursTxt.value > 0) {
            getCurrentTime(null, isInstant, null);
            setNextNotifDisplay();
        } else {
            hideNotifDisplay();
        }
    });

    // Init states onload
    initButtonStates();
    getCurrentTime(null, true, null);
    setNextNotifDisplay();

})();