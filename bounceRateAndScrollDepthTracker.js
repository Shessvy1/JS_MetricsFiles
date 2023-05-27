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

function globalBounceRate() {
    // Record the start of the session
    sessionStart = Date.now();

    // Set up an interval to check every 10 seconds
    let checkInterval = setInterval(function() {
        intervalCount++;

        // If the user is still on the page after 1 minute, consider them engaged and stop checking
        if (intervalCount >= 6) {
            userEngaged = true;
            clearInterval(checkInterval);
        }

        // If the user has left the page, record the end of the session and stop checking
        if (document.hidden) {
            sessionEnd = Date.now();
            clearInterval(checkInterval);
        }
    }, 10000);

    // When the user leaves the page, record the end of the session
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            sessionEnd = Date.now();
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
}

// Call the function when the page loads
window.addEventListener('load', globalBounceRate);

// Function to get the session length in seconds
function getSessionLength() {
    if (sessionEnd) {
        return (sessionEnd - sessionStart) / 1000;
    } else {
        return (Date.now() - sessionStart) / 1000;
    }
}

// Function to check if the user is considered engaged
function isUserEngaged() {
    return userEngaged;
}

// Function to get the scroll depth when the user exited the page
function getExitScrollDepth() {
    return scrollPercent;
}