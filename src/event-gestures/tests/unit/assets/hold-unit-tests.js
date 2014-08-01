YUI.add('hold-unit-tests', function(Y) {

    var HOLD_EVENT = Y.Node.DOM_EVENTS.hold.eventDef,
        Assert = Y.Assert,
        noop = function() {},
        module = Y.one('#event-hold-module'),
        submodule1 = Y.one('#event-hold-submodule1'),
        submodule2 = Y.one('#event-hold-submodule2'),

        HANDLES = {
            START: 'Y_HOLD_ON_START_HANDLE',
            MOVE: 'Y_HOLD_ON_MOVE_HANDLE',
            END: 'Y_HOLD_ON_END_HANDLE',
            CANCEL: 'Y_HOLD_ON_CANCEL_HANDLE'
        },

        hasMsTouchActionSupport = (module.getDOMNode().style && ("msTouchAction" in module.getDOMNode().style)),
        event = {
            target: module,
            currentTarget: module,
            touches: [
                {
                    pageX: 100,
                    pageY: 100,
                    clientX: 100,
                    clientY: 100
                }
            ],
            type: 'touchstart'
        },

        eventMultipleTouches = {
            target: module,
            currentTarget: module,
            touches: [
                {
                    pageX: 100,
                    pageY: 100,
                    clientX: 100,
                    clientY: 100
                },
                {
                    pageX: 200,
                    pageY: 200,
                    clientX: 200,
                    clientY: 200
                }
            ],
            type: 'touchstart'
        },

        eventNoTouch = {
            target: module,
            currentTarget: module,
            type: 'mousedown',
            pageX: 100,
            pageY: 100,
            clientX: 100,
            clientY: 100
        },
        suite = new Y.Test.Suite('event-hold Test Suite');

    suite.add(new Y.Test.Case({
        name: 'hold',
        setUp: function() {
            this.handles = [];
            //this.handles.push(submodule1.on('hold', noop));
            //this.handles.push(module.delegate('hold', noop, '.module'));
            event.type = 'touchstart';
            eventMultipleTouches.type = 'touchstart';
            eventNoTouch.type = 'mousedown';
        },
        tearDown: function() {
            Y.Array.each(this.handles, function(h) {
                h.detach();
            });

        },
        'test: on subscription': function () {
            var sub = {},
                notifier = {};

            HOLD_EVENT.on(submodule2, sub, notifier);
            Assert.isTrue(sub[HANDLES.START] instanceof Y.EventHandle);
        },

        'test: detach': function () {
            var sub = {},
                notifier = {};

            HOLD_EVENT.on(submodule2, sub, notifier);
            Assert.isTrue(sub[HANDLES.START] instanceof Y.EventHandle);

            HOLD_EVENT.detach(submodule2, sub, notifier);
            Assert.isNull(sub[HANDLES.START]);
        },

        'test: detachDelegate': function () {
            var sub = {},
                notifier = {};

            HOLD_EVENT.delegate(module, sub, notifier, '.module');
            Assert.isTrue(sub[HANDLES.START] instanceof Y.EventHandle);

            HOLD_EVENT.detachDelegate(module, sub, notifier);
            Assert.isNull(sub[HANDLES.START]);
        },

        'test: processArgs no delegate': function () {
            var args = [{},{},{},{ duration: 100, threshold: 10 }];
            var extras = HOLD_EVENT.processArgs(args);
            Assert.areEqual(100, extras.duration);
            Assert.areEqual(10, extras.threshold);
            Assert.areSame(3, args.length);
        },

        'test: processArgs with delegate': function () {
            var args = [{},{},{},{ duration: 100, threshold: 10 }];

            var extras = HOLD_EVENT.processArgs(args, true);
            Assert.isUndefined(extras);
            Assert.areSame(4, args.length);
        },

        'test: _setTimer default': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

            HOLD_EVENT._setTimer(event, module, sub, notifier);

            //since the default hold duration is 500ms, we'll do something at 550ms.
            this.wait(function(){
                Assert.isTrue(flag);
            }, 550);
        },

        'test: _setTimer with custom duration': function () {
            var sub = {
                _extra: {
                    duration: 200
                }
            },
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

            HOLD_EVENT._setTimer(event, module, sub, notifier);

            //since the custom hold duration is 200ms, we'll do something at 250ms.
            this.wait(function(){
                Assert.isTrue(flag);
            }, 250);
        },


        'test: _setTimer with no duration': function () {
            var sub = {
                _extra: {
                    duration: 0
                }
            },
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

            HOLD_EVENT._setTimer(event, module, sub, notifier);

            //since the custom hold duration is 200ms, we'll do something at 250ms.
            this.wait(function(){
                Assert.isTrue(flag);
            }, 100);
        },

        /* Tests with `touch` events */

        'test: _hold touch standard': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            HOLD_EVENT._hold(event, module, sub, notifier, false);
            this.wait(function(){
                Assert.isTrue(flag, 'a single e.touch should fire a `hold` event.');
            }, 550);
        },

        'test: _hold touch with multiple e.touches': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            HOLD_EVENT._hold(eventMultipleTouches, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(flag, 'multiple e.touches should not fire a `hold` event.');
            }, 550);
        },



        'test: _setupListeners with touch': function () {
            var sub = {},
                context = {
                    eventType: 'touchstart'
                };
            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._setupListeners(event, module, sub, {}, false, context, {});
            Assert.isTrue(sub[HANDLES.MOVE] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.MOVE].evt.type, 'touchmove');

            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.END].evt.type, 'touchend');

            Assert.isTrue(sub[HANDLES.CANCEL] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.CANCEL].evt.type, 'touchcancel');
        },

        'test: _hold touch with preventDefault': function () {
            var sub = {
                _extra: {
                    preventDefault: true
                }
            },
                flag = false,
                prevFlag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

            var customEvent = event;
            customEvent.preventDefault = function () {
                prevFlag = true;
            };

            HOLD_EVENT._hold(customEvent, module, sub, notifier, false);
            Assert.isTrue(prevFlag, '`preventDefault()` should be called');
            this.wait(function(){
                Assert.isTrue(flag, '`hold` event should fire');
            }, 550);
        },

        /* tests with `mouse` events */
        'test: _hold mouse standard': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            HOLD_EVENT._hold(eventNoTouch, module, sub, notifier, false);
            this.wait(function(){
                Assert.isTrue(flag, 'a regular mouse event should fire a `hold` event.');
            }, 550);
        },

        'test: _hold mouse rightclick': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                },
                buttonEvent = {
                    button: 3
                };

            HOLD_EVENT._hold(buttonEvent, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(flag, 'a right click should not fire a `hold` event.');
            }, 550);
        },

        'test: _hold mouse with preventMouse = true': function () {
            var sub = {
                preventMouse: true
            },
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            HOLD_EVENT._hold(eventNoTouch, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(sub.preventMouse, '`preventMouse` should be reset to false');
                Assert.isFalse(flag, '`hold` event should not fire if preventMouse = true');
            }, 550);
        },

        'test: _hold mouse with preventDefault': function () {
            var sub = {
                _extra: {
                    preventDefault: true
                }
            },
                flag = false,
                prevFlag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

            var customEvent = eventNoTouch;
            customEvent.preventDefault = function () {
                prevFlag = true;
            };

            HOLD_EVENT._hold(customEvent, module, sub, notifier, false);
            Assert.isTrue(prevFlag, '`preventDefault()` should be called');
            this.wait(function(){
                Assert.isTrue(flag, '`hold` event should fire');
            }, 550);

        },

        'test: _setupListeners with mouse': function () {
            var sub = {},
                context = {
                    eventType: 'mousedown'
                };
            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._setupListeners(eventNoTouch, module, sub, {}, false, context, {});
            Assert.isTrue(sub[HANDLES.MOVE] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.MOVE].evt.type, 'mousemove');

            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.END].evt.type, 'mouseup');

            Assert.isTrue(sub[HANDLES.CANCEL] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.CANCEL].evt.type, 'mousecancel');
        },

        'test: _setupListeners with MSPointer': function () {
            var sub = {},
                context = {
                    eventType: 'MSPointerDown'
                };
            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._setupListeners(eventNoTouch, module, sub, {}, false, context, {});
            Assert.isTrue(sub[HANDLES.MOVE] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.MOVE].evt.type, 'MSPointerMove');

            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.END].evt.type, 'MSPointerUp');

            Assert.isTrue(sub[HANDLES.CANCEL] instanceof Y.EventHandle);
            Assert.areSame(sub[HANDLES.CANCEL].evt.type, 'MSPointerCancel');
        },


        'test: _move clearTimeout() with no params': function () {
            var flag = false,
                context = {
                    startXY: [90, 90] //the original events are [100, 100]
                },
                timer = setTimeout(function () {
                    flag = true;
                }, 1000);

            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._move(eventNoTouch, module, {}, {}, false, context, timer);

            //wait until the above timer expires, and make sure that it wasn't executed.
            this.wait(function(){
                Assert.isFalse(flag);
            }, 1100);

        },

        'test: _move clearTimeout() with custom threshold': function () {
            var flag = false,
                sub = {
                    _extra: {
                        threshold: 9 //need atleast a 9px difference to clearTimeout().
                    }
                },
                context = {
                    startXY: [90, 90] //the original events are [100, 100]
                },
                timer = setTimeout(function () {
                    flag = true;
                }, 300);

            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._move(eventNoTouch, module, {}, {}, false, context, timer);

            //wait until the above timer expires, and make sure that it wasn't executed.
            this.wait(function(){
                Assert.isFalse(flag);
            }, 350);
        },

        'test: _move no clearTimeout() called': function () {
            var flag = false,
                context = {
                    startXY: [98, 98] //the original events are [100, 100]
                },
                timer = setTimeout(function () {
                    flag = true;
                }, 300);

            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._move(eventNoTouch, module, {}, {}, false, context, timer);

            //wait until the above timer expires, and make sure that it wasn't executed.
            this.wait(function(){
                Assert.isTrue(flag);
            }, 350);
        },

        'test: _end': function () {
            var flag = false,
                sub = {},
                timer = setTimeout(function () {
                    flag = true;
                }, 300);

            //populate subscription handles with some generic info
            sub[HANDLES.MOVE] = new Y.EventHandle();
            sub[HANDLES.END] = new Y.EventHandle();
            sub[HANDLES.CANCEL] = new Y.EventHandle();

            //arguments are [event, node, subscription, notifier, delegate, context, timer]
            HOLD_EVENT._end(eventNoTouch, module, {}, {}, false, {}, timer);

            //clearTimeout() will always get called.
            this.wait(function(){
                Assert.isFalse(flag);
            }, 350);

            Assert.isNull(sub[HANDLES.MOVE]);
            Assert.isNull(sub[HANDLES.END]);
            Assert.isNull(sub[HANDLES.CANCEL]);
        }
    }));


    Y.Test.Runner.add(suite);

}, '', {requires:['event-hold', 'test', 'node']});
