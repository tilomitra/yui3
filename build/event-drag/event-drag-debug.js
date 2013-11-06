YUI.add('event-drag', function (Y, NAME) {

var EVT = {
        START: 'gesturemovestart',
        MOVE: 'gesturemove',
        END: 'gesturemoveend',
    },

    DRAG_EVT = 'move',
    MIN_DISTANCE = 'dragMinDistance',
    MAX_TOUCHES = 'dragMaxTouches',
    LOCK_AXIS = 'dragLockAxis',
    LOCK_MIN_DISTANCE = 'dragLockMinDistance',
    PREVENT_DEFAULT = 'preventDefault',

    DRAG_START_HANDLE = 'Y_DRAG_ON_START_HANDLE',
    DRAG_MOVE_HANDLE = 'Y_DRAG_ON_MOVE_HANDLE',
    DRAG_END_HANDLE = 'Y_DRAG_ON_END_HANDLE';

var eventDef = {
    _eventType: DRAG_EVT,

    processArgs: function(args) {
        var params = (args.length > 3) ? Y.merge(args.splice(3, 1)[0]) : {};

        if (!(MIN_DISTANCE in params)) {
            params[MIN_DISTANCE] = this.MIN_DISTANCE;
        }

        if (!(MAX_TOUCHES in params)) {
            params[MAX_TOUCHES] = this.MAX_TOUCHES;
        }

        if (!(LOCK_AXIS in params)) {
            params[LOCK_AXIS] = this.LOCK_AXIS;
        }

        if (!(PREVENT_DEFAULT in params)) {
            params[PREVENT_DEFAULT] = this.PREVENT_DEFAULT;
        }

        return params;
    },

    on: function (node, subscriber, ce) {
        var self = this,
            params = subscriber._extra,
            startHandle;

        startHandle = node.on(EVT.START, function (e) {
            self._onDragStart(e, node, subscriber, ce);
        }, {
            preventDefault: params[PREVENT_DEFAULT]
        });

        subscriber[DRAG_START_HANDLE] = startHandle;
    },

    detach: function (node, subscriber, ce) {
        var startHandle = subscriber[DRAG_START_HANDLE];

        if (startHandle) {
            startHandle.detach();
            subscriber[DRAG_START_HANDLE] = null;
        }

        this.detachMoveEnd(subscriber);
    },

    detachMoveEnd: function (subscriber) {
        var moveHandle = subscriber[DRAG_MOVE_HANDLE],
            endHandle = subscriber[DRAG_END_HANDLE];

        if (moveHandle) {
            moveHandle.detach();
            subscriber[DRAG_MOVE_HANDLE] = null;
        }

        if (endHandle) {
            endHandle.detach();
            subscriber[DRAG_END_HANDLE] = null;
        }

        subscriber.startXY = undefined;
        subscriber.direction = undefined;
        subscriber.previousXY = undefined;
    },

    _onDragStart: function (e, node, subscriber, ce) {
        var self = this;
        subscriber.startXY = [e.pageX, e.pageY];
        subscriber[DRAG_MOVE_HANDLE] = node.on(EVT.MOVE, function (e) {
            self._onDrag(e, node, subscriber, ce);
        });

        subscriber[DRAG_END_HANDLE] = node.on(EVT.END, function (e) {
            self._onDragEnd(e, node, subscriber, ce);
        }, {standAlone: true});
    },

    _onDrag: function (e, node, subscriber, ce) {

        var startXY = subscriber.startXY,
            currentXY = [e.pageX, e.pageY],
            xDiff = Math.abs(currentXY[0] - startXY[0]),
            yDiff = Math.abs(currentXY[1] - startXY[1]);

        //early true/false with _isValidDirection()
        if (this._isValidDirection(xDiff, yDiff, startXY, currentXY) &&
            this._isValidDrag(e, xDiff, yDiff, startXY, currentXY, subscriber)) {
            this._fireDrag(e, ce, xDiff, yDiff, startXY, currentXY);
        }
    },

    _isValidDrag: function (e, xDiff, yDiff, startXY, currentXY, subscriber) {
        var params = subscriber._extra,
            minDistance = params[MIN_DISTANCE],
            maxTouches = params[MAX_TOUCHES],
            numTouches = (e.touches) ? e.touches.length : 1;

        //dont fire unless mindistance has been hit,
        //and the drag is in a valid direction.
        if ((xDiff > minDistance ||
            yDiff > minDistance) &&
            numTouches <= maxTouches &&
            this._doesPassLocked(params, xDiff, yDiff, subscriber, currentXY)
            ) {
            return true;
        }
        else {
            return false;
        }
    },

    _isValidDirection: function (xDiff, yDiff, startXY, currentXY) {
        return true;
    },

    _doesPassLocked: function (params, xDiff, yDiff, subscriber, currentXY) {


        var lockAxis = params[LOCK_AXIS],
            direction = subscriber.direction,
            lockMinDistance = params[LOCK_MIN_DISTANCE],
            previousXY = subscriber.previousXY;

        //TODO: clean up these if/else blocks


        //axis not locked, all directions are allowed.
        if (!lockAxis && !direction) {
            return true;
        }

        //axis is locked but direction has not been set, so we need to set a direction.
        else if (lockAxis && !direction) {
            //threshold for locking has not been reached, so continue
            if (xDiff <= lockMinDistance && yDiff <= lockMinDistance) {
                console.log('threshold for locking has not been reached');
                return true;
            }

            //x-direction is above lockMinDistance, so set the direction.
            else if (xDiff > lockMinDistance && yDiff <= lockMinDistance) {
                console.log('threshold for locking reached for X-Direction');
                subscriber.direction = 'x';
                subscriber.previousXY = currentXY;
                return true;
            }

            //y-direction is above lockMinDistance, so set the direction.
            else if (xDiff <= lockMinDistance && yDiff > lockMinDistance) {
                console.log('threshold for locking reached for Y-Direction');
                subscriber.direction = 'y';
                subscriber.previousXY = currentXY;
                return true;
            }
        }

        //lock and direction are both set to true
        else {
            subscriber.previousXY = currentXY;
            if (direction === 'x' && (currentXY[1] - previousXY[1] === 0)) {
                return true;
            }

            else if (direction === 'y' && (currentXY[0] - previousXY[0] === 0)) {
                return true;
            }
            else {
                return false;
            }
        }
    },

    _determineDirection: function (xDiff, yDiff, startXY, currentXY) {
        if(xDiff >= yDiff) {
            return currentXY[0] - startXY[0] > 0 ? 'right' : 'left';
        }
        else {
            return currentXY[1] - startXY[1] > 0 ? 'down' : 'up';
        }
    },

    _onDragEnd: function (e, node, subscriber, ce) {
        this.detachMoveEnd(subscriber);
    },

    _fireDrag: function (e, ce, xDiff, yDiff, startXY, currentXY) {
        e.type = this._eventType;
        e.gesture = {
            direction: this._determineDirection(xDiff, yDiff, startXY, currentXY),
            deltaX: currentXY[0] - startXY[0],
            deltaY: currentXY[1] - startXY[1]
        };
        ce.fire(e);
    },

    MIN_DISTANCE: 10,
    MAX_TOUCHES: 1,
    LOCK_AXIS: false,
    LOCK_MIN_DISTANCE: 15,
    PREVENT_DEFAULT : false
};

Y.Event.define(DRAG_EVT, eventDef);

Y.Event.define('moveleft', Y.merge(eventDef, {
    _eventType: 'moveleft',
    _isValidDirection: function (xDiff, yDiff, startXY, currentXY) {
        if (this._determineDirection(xDiff, yDiff, startXY, currentXY) === 'left') {
            return true;
        }
        else {
            return false;
        }
    }
}));

Y.Event.define('moveright', Y.merge(eventDef, {
    _eventType: 'moveright',
    _isValidDirection: function (xDiff, yDiff, startXY, currentXY) {
        if (this._determineDirection(xDiff, yDiff, startXY, currentXY) === 'right') {
            return true;
        }
        else {
            return false;
        }
    }
}));

Y.Event.define('moveup', Y.merge(eventDef, {
    _eventType: 'moveup',
    _isValidDirection: function (xDiff, yDiff, startXY, currentXY) {
        if (this._determineDirection(xDiff, yDiff, startXY, currentXY) === 'up') {
            return true;
        }
        else {
            return false;
        }
    }
}));

Y.Event.define('movedown', Y.merge(eventDef, {
    _eventType: 'movedown',
    _isValidDirection: function (xDiff, yDiff, startXY, currentXY) {
        if (this._determineDirection(xDiff, yDiff, startXY, currentXY) === 'down') {
            return true;
        }
        else {
            return false;
        }
    }
}));


}, '@VERSION@', {"requires": ["event-move"]});
