/*
Copyright 2013 Yahoo! Inc.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/
'use strict';
//loop through Hammer.gestures
var HAMMER_GESTURES = [
    'hold',
    'tap',
    'doubletap',
    'drag',
    'dragstart',
    'dragend',
    'dragup',
    'dragdown',
    'dragleft',
    'dragright',
    'swipe',
    'swipeup',
    'swipedown',
    'swipeleft',
    'swiperight',
    'transform',
    'transformstart',
    'transformend',
    'rotate',
    'pinch',
    'pinchin',
    'pinchout',
    'touch',
    'release'
],

HANDLES = {},

HAMMER = '_hammer',
PREFIX = 'hammer:',

detachHandles = function detachHandles(subscription, gesture) {
    var handle = subscription[gesture];
    if (handle) {
        handle.detach();
        subscription[gesture] = null;
    }
},

eventDef = {
    processArgs: function (args, isDelegate) {
        if (isDelegate) {
            return args.splice(4,1)[0];
        }
        else {
            return args.splice(3,1)[0];
        }
    },
    on: function (node, subscription, notifier) {

        var self = this;
        this._setupHammer(node, subscription);

        // Delegate the gesture event to HammerJS.
        subscription[this.type] = node.on(PREFIX + this.type, function (ev) {
            self.handleHammerEvent(ev, node, subscription, notifier);
        });
    },

    delegate: function (node, subscription, notifier, filter) {

        var self = this;
        this._setupHammer(node, subscription);

        subscription[this.type + '_del'] = node.on(PREFIX + this.type, function (ev) {
            var srcEv = ev.gesture.srcEvent;
            //This is what Y.Event.Delegate runs under the hood to determine if a given `filter` applies to a given `ev.target`.
            if (Y.Selector.test(srcEv.target.getDOMNode(), filter, srcEv.currentTarget.getDOMNode())) {
                self.handleHammerEvent(ev, node, subscription, notifier);
            }
        });
    },

    handleHammerEvent: function (ev, node, subscription, notifier) {
        // do event facade normalization here
        notifier.fire(ev);
    },

    _setupHammer: function (node, subscription) {
        //var params = subscription._extra;
        var gestureOpts = node.get('gestureOpts');

        this._hammer = node.getData(HAMMER);

        // start new hammer instance
        if(!this._hammer) {
            this._hammer = new Hammer(node.getDOMNode(), gestureOpts);
            node.setData(HAMMER, this._hammer);
            console.log('initial hammer opts:');
            console.log(this._hammer.options);
            // gestureOpts and this._hammer.options reference the same object.
            node.set('gestureOpts', this._hammer.options);
            this._hammer.options = node.get('gestureOpts');
        }

        return this._hammer;
    },

    detach: function (node, subscription, notifier) {
        detachHandles(subscription, this.type);
    },

    detachDelegate: function () {
        detachHandles(subscription, this.type + '_del');
    }
};

Hammer.utils.on = function (element, type, handler) {
    Y.one(element).on(type, handler);
}


Hammer.Instance.prototype.trigger = function(gesture, eventData) {
    var el = Y.one(this.element);
    el.fire(PREFIX + gesture, {gesture: eventData});
};

Y.Array.each(HAMMER_GESTURES, function (gesture) {
    Y.Node.DOM_EVENTS[gesture] = 0; //we want all of these to be custom dom events.
    Y.Event.define(gesture, eventDef);
});
