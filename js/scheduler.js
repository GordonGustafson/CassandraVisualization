var Event = function(callback, scheduledTime, description) {
    this.callback = callback;
    this.scheduledTime = scheduledTime;
    this.description = description;
};



var Scheduler = function() {
    // BinaryHeap is a min-heap, so popping from scheduledEvents
    // gives us the Event with the earliest scheduledTime.
    this.scheduledEvents = new BinaryHeap(function(event) { return event.scheduledTime; });
    this.currentTime = 0;
};

Scheduler.prototype.schedule = function(callback, timeUntilCallback, description) {
    var event = new Event(callback, this.currentTime + timeUntilCallback, description);
    this.scheduledEvents.push(event);
};

Scheduler.prototype.runNextScheduledEvent = function() {
    if (this.scheduledEvents.size() === 0) {
        // we have no events to run
        return;
    }
    var nextScheduledEvent = this.scheduledEvents.pop();
    // zoom to the time of the next scheduled event:
    this.currentTime = nextScheduledEvent.scheduledTime;
    console.log(nextScheduledEvent.description + " at time " + this.currentTime);
    nextScheduledEvent.callback();
};
