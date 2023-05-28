let sessionStart;
let sessionEnd;
let intervalCount = 0;
let userEngaged = false;
let scrollPercent = 0;

// Variables to prevent continuous firing of custom events
let hasFiredScroll25Event = false;
let hasFiredScroll50Event = false;
let hasFiredScroll75Event = false;
let hasFiredScroll100Event = false;

// Function to get the scroll depth when the user exited the page
function getExitScrollDepth() {
    return scrollPercent;
}

function globalBounceRate() {
    // Record the start of the session
    sessionStart = Date.now();

    // Set up an interval to check every 10 seconds
    let checkInterval = setInterval(function() {
        intervalCount++;

        // If the user is still on the page after 1 minute or the session lasts more than 60 seconds, consider them engaged and stop checking
        if (intervalCount >= 6 || getSessionLength() >= 60) {
            userEngaged = true;
            clearInterval(checkInterval);
        }

        // If the user has left the page, record the end of the session and stop checking
        if (document.hidden) {
            sessionEnd = Date.now();
            clearInterval(checkInterval);
        }
    }, 10000); // Changed to 10000 (10 seconds) from 1000 (1 second)

    // When the user leaves the page, record the end of the session
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            sessionEnd = Date.now();
            // Send the custom event to Optimizely
            window.optimizely = window.optimizely || [];
            window.optimizely.push({
                type: "event",
                eventName: "bounceRateAndScrollDepth",
                tags: {
                    sessionLength: getSessionLength(),
                    exitScrollDepth: getExitScrollDepth()
                }
            });
        }
    });

    // Function to handle scroll event
    function handleScrollEvent() {
        //DOM queries
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.scrollHeight;
        // Calculate scroll percentage
        scrollPercent = (window.scrollY / (bodyHeight - windowHeight)) * 100;
        window.optimizely = window.optimizely || [];
        // Conditional code we'll use to fire events based on scrollPercentage.
        if (scrollPercent >= 25 && !hasFiredScroll25Event) {
            // Push an event to the Optimizely data layer
            window.optimizely.push({type: "event", eventName: "scroll25"});
            hasFiredScroll25Event = true;
        }
        if (scrollPercent >= 50 && !hasFiredScroll50Event) {
            window.optimizely.push({type: "event", eventName: "scroll50"});
            hasFiredScroll50Event = true;
        }
        if (scrollPercent >= 75 && !hasFiredScroll75Event) {
            window.optimizely.push({type: "event", eventName: "scroll75"});
            hasFiredScroll75Event = true;
        }
        if (scrollPercent >= 100 && !hasFiredScroll100Event) {
            window.optimizely.push({type: "event", eventName: "scroll100"});
            hasFiredScroll100Event = true;
        }
    }

    // Add event listener outside the function
    window.addEventListener('scroll', handleScrollEvent);

    // Log session start and engaged status
    console.log("Session Start:", sessionStart);

    // Set up an interval to log the screen time and scroll depth every 10 seconds
    let logInterval = setInterval(logSessionData, 10000);

    // Function to log the screen time and scroll depth
    function logSessionData() {
        const screenTime = getSessionLength();
        console.log("Screen Time:", screenTime.toFixed(2) + " seconds");
        console.log("Scroll Depth:", getExitScrollDepth().toFixed(2) + "%");
    }

    // Set up an interval to check if the user is engaged after 60 seconds
    setTimeout(function() {
        console.log("User Engaged:", userEngaged);
    }, 60000);
}

// Call the function when the page loads
window.addEventListener('load', globalBounceRate);

// Function to get the session length in seconds
function getSessionLength() {
    if (sessionEnd) {
        const sessionLength = (sessionEnd - sessionStart) / 1000;
        return sessionLength;
    } else {
        const currentSessionLength = (Date.now() - sessionStart) / 1000;
        return currentSessionLength;
    }
}
