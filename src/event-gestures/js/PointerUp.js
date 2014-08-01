/**
The release module provides a synthetic event, "pointerup", which fires when a user's finger/mouse leaves the screen.

@example

    YUI().use('event-pointer-up', function (Y) {
        Y.one('#my-button').on('release', function (e) {
            Y.log('Button was released.');
        });
    });

@module event
@submodule event-pointer-up
@author tilo mitra
@since 3.14.0
*/
var doc = Y.config.doc,
    EVT_END = Y.Event._GESTURE_MAP.end,
    EVT_POINTERUP = 'pointerup',
    HANDLES = {
        END: 'Y_POINTERUP_ON_END_HANDLE'
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
The pointer-up module provides a synthetic event, "pointerup", which fires when a user's finger/mouse leaves the screen. This is a useful event to listen to when performing user interactions that require the user's mouse/finger to stay on the screen. For example, you could listen to a `hold` or `drag` event, and use the `pointerup` event to reset your application's state.

@event pointerup
@param type {string} "pointerup"
@param fn {function} The method the event invokes. It receives the event facade of the underlying DOM event.
@for Event
@return {EventHandle} the detach handle
*/
Y.Event.define(EVT_POINTERUP, {

    /**
    This function should set up the node that will eventually fire the event.

    Usage:

        node.on('pointerup', function (e) {
            Y.log('the node was released.');
        });

    @method on
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @public
    @static
    **/
    on: function (node, subscription, notifier) {
        subscription[HANDLES.END] = node.on(EVT_END, this._pointerUp, this, node, subscription, notifier);
    },

    /**
    Detaches all event subscriptions set up by the event-release module

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
    Event delegation for the 'release' event. The delegated event will use a
    supplied CSS selector or filtering function to test if the event references at least one
    node that should trigger the subscription callback.

    Usage:

        node.delegate('pointerup', function (e) {
            Y.log('`li a` inside node was released.');
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
        subscription[HANDLES.END] = node.delegate(EVT_END, function (e) {
            this._pointerUp(e, node, subscription, notifier, true);
        }, filter, this);
    },

    /**
    Detaches the delegated event subscriptions set up by the event-pointer-up module.
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
    Called when a user's mouse/finger leaves the screen. Fires
    the `_firePointerUp` event under-the-hood.

    @method _pointerUp
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Y.Subscriber} subscription
    @param {Object} notifier
    @param {Boolean} delegate
    @protected
    @static
    **/
    _pointerUp: function (event, node, subscription, notifier, delegate) {

        var preventMouse = subscription.preventMouse || false,
            context = {
                eventType: event.type,
                endXY: [ event.pageX, event.pageY ],
                clientXY: [event.clientX, event.clientY]
            };

        //move ways to quit early to the top.
        //no right clicks
        if (event.button && event.button === 3) {
            return;
        }

        //for now just support a 1 finger count
        //A 'touchend' event does not have `event.touches` - it has event.changedTouches
        //instead.
        if (event.changedTouches && event.changedTouches.length !== 1) {
            return;
        }


        //If `touchend` fired, fire `release` and prevent further mouse interactions
        //from firing a second `release` event.
        if (event.changedTouches) {
            //over-ride the undefined context.endXY, context.clientXY values with the ones
            //from changedTouches
            context.endXY = [ event.changedTouches[0].pageX, event.changedTouches[0].pageY ];
            context.clientXY = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
            this._firePointerUp(event, notifier, context);

            //Since this is a touch* event, there will be corresponding mouse events
            //that will be fired. We don't want these events to get picked up and fire
            //another `release` event, so we'll set this variable to `true`.
            subscription.preventMouse = true;
        }


        //Only add these listeners if preventMouse is `false`
        //ie: not when touch events have already been subscribed to
        else if (context.eventType.indexOf('mouse') !== -1 && !preventMouse) {
            this._firePointerUp(event, notifier, context);
        }

        //If a mouse event comes in after a touch event, it will go in here and
        //reset preventMouse to `false`.
        //If a mouse event comes in without a prior touch event, preventMouse will be
        //false in any case, so this block doesn't do anything.
        else if (context.eventType.indexOf('mouse') !== -1 && preventMouse) {
            subscription.preventMouse = false;
        }

        else if (context.eventType.indexOf('MSPointer') !== -1) {
            this._firePointerUp(event, notifier, context);
        }

    },

    /**
    Fires the `pointerup` event.

    @method _firePointerUp
    @param {DOMEventFacade} event
    @param {Object} notifier
    @protected
    @static
    **/
    _firePointerUp: function (event, notifier, context) {
        event.type = EVT_POINTERUP;
        event.pageX = context.endXY[0];
        event.pageY = context.endXY[1];
        event.clientX = context.clientXY[0];
        event.clientY = context.clientXY[1];
        notifier.fire(event);
    }
});
