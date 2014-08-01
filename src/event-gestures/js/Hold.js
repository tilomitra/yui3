/**
The hold module provides a gesture event, "hold", which fires when a
user's finger/mouse stays at the same place for a given period of time.

@example

    YUI().use('event-hold', function (Y) {
        Y.one('#my-button').on('hold', function (e) {
            Y.log('Button was held down.');
        });
    });

@module event
@submodule event-hold
@author tilo mitra
@since 3.12.0

*/
var doc = Y.config.doc,
    GESTURE_MAP = Y.Event._GESTURE_MAP,
    EVT_START = 'gesturemovestart',
    EVT_END = 'gesturemoveend',
    EVT_MOVE = 'gesturemove',
    EVT_CANCEL = GESTURE_MAP.cancel,
    EVT_HOLD = 'hold',
    HOLD_THRESHOLD = 'threshold',
    HOLD_DURATION = 'duration',
    PREVENT_DEFAULT = 'preventDefault',
    TOUCH = 'touch',
    MOUSE = 'mouse',
    POINTER = 'pointer',

    HANDLES = {
        START: 'Y_HOLD_ON_START_HANDLE',
        MOVE: 'Y_HOLD_ON_MOVE_HANDLE',
        END: 'Y_HOLD_ON_END_HANDLE',
        CANCEL: 'Y_HOLD_ON_CANCEL_HANDLE'
    };

function detachHandles(subscription, handles) {
    handles = handles || Y.Object.values(HANDLES);

    Y.Array.each(handles, function (item) {
        var handle = subscription[item];
        if (handle) {
            handle.detach();
            subscription[item] = null;
        }
    });

}


/**
Sets up a "hold" event, that is fired when a user has their mouse or
finger down on an element for a given amount of time. In mobile
devices (especially iOS), holding down on a DOM element can make that
node selectable. If you wish to prevent this behavior, add the
following CSS to the element in question:


    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);


@event hold
@param type {string} "hold"
@param fn {function} The method the event invokes. It receives the
event facade of the underlying DOM event.
@param config {object} Optional. An object which specifies any of the
following:

    * duration {Integer}: The number of milliseconds before `hold` is fired.
    Defaults to `500`
    * threshold {Integer}: The max. number of pixels that the user can move
    their mouse/finger before the `hold` event is cancelled. Defaults
    to `5`.
    * preventDefault {Boolean}: Optional. Defaults to `false`. Set this to
    true if you want the `touchstart`/`mousedown` event to not trigger
    default browser behavior. Setting this value to `true` will prevent
    iOS from showing modals/tooltips when the element is held, but it
    will also prevent users from flicking on that element to scroll the page.


@for Event
@return {EventHandle} the detach handle
*/
Y.Event.define(EVT_HOLD, {
    processArgs: function (args, isDelegate) {

        //if we return for the delegate use case, then the `filter`
        //argument returns undefined, and we have to get the filter
        //from sub._extra[0] (ugly)

        if (!isDelegate) {
            var extra = args[3];
            // remove the extra arguments from the array as specified by
            // http://yuilibrary.com/yui/docs/event/synths.html
            args.splice(3,1);
            return extra;
        }
    },
    /**
    This function should set up the node that will eventually fire the
    event.

    Usage:

        node.on('hold', function (e) {
            Y.log('the node was held.');
        });

    @method on
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @public
    @static
    **/
    on: function (node, subscription, notifier) {
        var se = this;
        subscription[HANDLES.START] = node.on(EVT_START, function (e) {
            se._hold(e, node, subscription, notifier);
        });
    },

    /**
    Detaches all event subscriptions set up by the event-hold module

    @method detach
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @public
    @static
    **/
    detach: function (node, subscription, notifier) {
        detachHandles(subscription);
    },

    /**
    Event delegation for the `hold` event. The delegated event will
    use a supplied CSS selector or filtering function to test if the
    event references at least one node that should trigger the subscription
    callback.

    Usage:

        node.delegate('hold', function (e) {
            Y.log('`li a` inside node was held.');
        }, 'li a');

    @method delegate
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @param {String | Function} filter
    @public
    @static
    **/
    delegate: function (node, subscription, notifier, filter) {
        subscription[HANDLES.START] = node.delegate(EVT_START, function (e) {
            this._hold(e, node, subscription, notifier, true);
        }, filter, this);
    },

    /**
    Detaches the delegated event subscriptions set up by the
    event-hold module.
    Only used if you use node.delegate(...) instead of node.on(...);

    @method detachDelegate
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @public
    @static
    **/
    detachDelegate: function (node, subscription, notifier) {
        detachHandles(subscription);
    },

    /**
    Called when the monitor(s) are touched, either through
    `touchstart`, `mousedown`, `MSPointerDown` or a combination.

    @method _hold
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @param {Boolean} delegate
    @protected
    @static
    **/
    _hold: function (event, node, subscription, notifier, delegate) {

        var context = {
                canceled: false,
                //if it's a synthetic event, then get the underlying DOM event.
                eventType: (event._event) ? event._event.type : event.type,
                startXY: [event.pageX, event.pageY]
            },
            params = subscription._extra,
            //explicit undefined check here so that `0` passes through
            prevDefault = (params && params[PREVENT_DEFAULT] !== undefined) ? params[PREVENT_DEFAULT] : this.preventDefault,

            //preventMouse keeps track to see if a previous touch
            //event occured, so that it prevents the corresponding
            //mouse event from firing the event again.
            preventMouse = subscription.preventMouse || false,

            //Reference to a timer variable that will store the
            //object passed from setTimeout()
            timer;


        if (prevDefault) {
            event.preventDefault();
        }

        timer = this._setTimer(event, node, subscription, notifier);
        this._setupListeners(event, node, subscription, notifier, delegate, context, timer);

    },

    /**
    Called internally to set up a timer that will eventually fire
    the `hold` event after a set duration.

    @method _setTimer
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @protected
    @static
    **/
    _setTimer: function (event, node, subscription, notifier) {
        var params = subscription._extra,

            //explicit undefined check here so that `0` passes through
            holdDuration = (params && params[HOLD_DURATION] !== undefined) ? params[HOLD_DURATION] : this.duration,
            timer;

        timer = setTimeout(function() {
            event.type = EVT_HOLD;
            notifier.fire(event);
        }, holdDuration);

        return timer;
    },


    /**
    Called internally to set up event listeners that can clear the
    timer, and prevent `hold` from being fired. These event listeners
    vary based on target environment.

    @method _setupListeners
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier,
    @param {Boolean} delegate,
    @param {Object} context,
    @param {Number} timer
    @protected
    @static
    **/
    _setupListeners: function (event, node, subscription, notifier, delegate, context, timer) {

        subscription[HANDLES.MOVE] = node.on(EVT_MOVE, this._move, this, node, subscription, notifier, delegate, context, timer);
        subscription[HANDLES.END] = node.once(EVT_END, this._end, this, node, subscription, notifier, delegate, context, timer);
        subscription[HANDLES.CANCEL] = node.once(EVT_CANCEL, this._end, this, node, subscription, notifier, delegate, context, timer);
    },


    /**
    Event callback that fires for `touchmove`, `mousemove`, or
    `MSPointerMove` events. The `hold` event is cancelled if the
    user moves their finger/mouse over a certain threshold.

    @method _move
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier,
    @param {Boolean} delegate,
    @param {Object} context,
    @param {Number} timer
    @protected
    @static
    **/
    _move: function (event, node, subscription, notifier, delegate, context, timer) {
        var currentXY = [ event.pageX, event.pageY ],
            startXY = context.startXY,
            params = subscription._extra,

            //explicit undefined check here so that `0` passes through
            holdThreshold = (params && params[HOLD_THRESHOLD] !== undefined) ? params[HOLD_THRESHOLD] : this.threshold;

        if (Math.abs(currentXY[0] - startXY[0]) > holdThreshold ||
            Math.abs(currentXY[1] - startXY[1]) > holdThreshold) {

            clearTimeout(timer);
            detachHandles(subscription, [HANDLES.END, HANDLES.CANCEL]);
        }

    },


    /**
    Event callback that fires for `touchend`, `mouseup`, or
    `MSPointerUp` events. The `hold` event is cancelled if the
    user lifts their finger/mouse off an element.

    @method _end
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier,
    @param {Boolean} delegate,
    @param {Object} context,
    @param {Number} timer
    @protected
    @static
    **/
    _end: function (event, node, subscription, notifier, delegate, context, timer) {
        clearTimeout(timer);
        detachHandles(subscription, [HANDLES.MOVE, HANDLES.END, HANDLES.CANCEL]);
    },


    threshold: 5,
    duration: 500,
    preventDefault: false
});
