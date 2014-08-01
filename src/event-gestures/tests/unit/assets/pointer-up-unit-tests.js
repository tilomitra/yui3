YUI.add('pointer-up-unit-tests', function(Y) {

    var POINTERUP_EVENT = Y.Node.DOM_EVENTS.pointerup.eventDef,
        Assert = Y.Assert,
        noop = function() {},
        module = Y.one('#event-pointer-up-module'),
        submodule = Y.one('#event-pointer-up-submodule1'),

        HANDLES = {
            END: 'Y_POINTERUP_ON_END_HANDLE'
        },

        hasMsTouchActionSupport = (module.getDOMNode().style && ("msTouchAction" in module.getDOMNode().style)),
        event = {
            target: module,
            currentTarget: module,
            changedTouches: [
                {
                    pageX: 100,
                    pageY: 100,
                    clientX: 100,
                    clientY: 100
                }
            ],
            type: 'touchend'
        },

        eventMultipleTouches = {
            target: module,
            currentTarget: module,
            changedTouches: [
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
            type: 'touchend'
        },

        eventNoTouch = {
            target: module,
            currentTarget: module,
            type: 'mouseup',
            pageX: 100,
            pageY: 100,
            clientX: 100,
            clientY: 100
        },
        suite = new Y.Test.Suite('event-pointerup Test Suite');

    suite.add(new Y.Test.Case({
        name: 'hold',
        setUp: function() {
            this.handles = [];
            //this.handles.push(submodule1.on('hold', noop));
            //this.handles.push(module.delegate('hold', noop, '.module'));
            event.type = 'touchend';
            eventMultipleTouches.type = 'touchend';
            eventNoTouch.type = 'mouseup';
        },
        tearDown: function() {
            Y.Array.each(this.handles, function(h) {
                h.detach();
            });

        },
        'test: on subscription': function () {
            var sub = {},
                notifier = {};

            POINTERUP_EVENT.on(submodule, sub, notifier);
            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);
        },

        'test: detach': function () {
            var sub = {},
                notifier = {};

            POINTERUP_EVENT.on(submodule, sub, notifier);
            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);

            POINTERUP_EVENT.detach(submodule, sub, notifier);
            Assert.isNull(sub[HANDLES.END]);
        },

        'test: detachDelegate': function () {
            var sub = {},
                notifier = {};

            POINTERUP_EVENT.delegate(module, sub, notifier, '.module');
            Assert.isTrue(sub[HANDLES.END] instanceof Y.EventHandle);

            POINTERUP_EVENT.detachDelegate(module, sub, notifier);
            Assert.isNull(sub[HANDLES.END]);
        },

        /* Tests with `touch` events */

        'test: _pointerUp touch standard': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            POINTERUP_EVENT._pointerUp(event, module, sub, notifier, false);
            this.wait(function(){
                Assert.isTrue(flag, 'a single e.touch should fire a `pointer-up` event.');
            }, 550);
        },

        'test: _pointerUp touch with multiple e.touches': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            POINTERUP_EVENT._pointerUp(eventMultipleTouches, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(flag, 'multiple e.touches should not fire a `pointer-up` event.');
            }, 550);
        },

        /* tests with `mouse` events */
        'test: _pointerUp mouse standard': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            POINTERUP_EVENT._pointerUp(eventNoTouch, module, sub, notifier, false);
            this.wait(function(){
                Assert.isTrue(flag, 'a regular mouse event should fire a `pointer-up` event.');
            }, 550);
        },

        'test: _pointerUp mouse rightclick': function () {
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

            POINTERUP_EVENT._pointerUp(buttonEvent, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(flag, 'a right click should not fire a `pointer-up` event.');
            }, 550);
        },

        'test: _pointerUp mouse with preventMouse = true': function () {
            var sub = {
                preventMouse: true
            },
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };
            POINTERUP_EVENT._pointerUp(eventNoTouch, module, sub, notifier, false);
            this.wait(function(){
                Assert.isFalse(sub.preventMouse, '`preventMouse` should be reset to false');
                Assert.isFalse(flag, '`pointer-up` event should not fire if preventMouse = true');
            }, 550);
        },

        /* make sure pointer-up isn't fired twice. */
        'test: _pointerUp not fired twice': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        if (flag) {
                            flag = false;
                        }
                        else {
                            flag = true;
                        }
                    }
                };
            POINTERUP_EVENT._pointerUp(event, module, sub, notifier, false);
            sub.preventMouse = true;
            this.wait(function(){
                Assert.isTrue(flag, 'a regular mouse event should fire a `pointer-up` event.');
            }, 550);
        },

        /* tests with `MSPointer` events */
        'test: _pointerUp MSPointer standard': function () {
            var sub = {},
                flag = false,
                notifier = {
                    fire: function () {
                        flag = true;
                    }
                };

                msPointerEvent = eventNoTouch;
                msPointerEvent.type = 'MSPointerUp';
            POINTERUP_EVENT._pointerUp(msPointerEvent, module, sub, notifier, false);
            this.wait(function(){
                Assert.isTrue(flag, 'a regular MSPointerUp event should fire a `pointer-up` event.');
            }, 550);
        },



    }));


    Y.Test.Runner.add(suite);

}, '', {requires:['event-pointer-up', 'test', 'node', 'test-console']});
