YUI.add('hold-functional-tests', function(Y) {

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
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                });

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 500ms');
            }, 550);
        },

        'test: on subscription with duration': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                }, {duration: 200});

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 200ms');
            }, 250);
        },

        'test: delegate subscription': function () {
            var flag = false,
                handle = module.delegate('hold', function (e) {
                    flag = true;
                }, '.module');

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: module,
                currentTarget: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 500ms');
            }, 550);
        },

        'test: delegate subscription with duration': function () {
            var flag = false,
                handle = module.delegate('hold', function (e) {
                    flag = true;
                }, '.module', {duration: 200});

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: module,
                currentTarget: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 200ms');
            }, 250);
        },

        'test: on subscription with right mouse': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                }, {duration: 200});

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1,
                button: 2 //for some reason, this number gets appended by 1 under-the-hood.
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at all');
            }, 250);
        },

        'test: on subscription then move a lot': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                });

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            Y.Event.simulate(submodule1.getDOMNode(), 'mousemove', {
                pageX: submodule1.get('offsetLeft') + 10,
                pageY: submodule1.get('offsetTop') + 5,
                type: 'mousemove',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not even be triggered at 500ms');
            }, 550);
        },

        'test: on subscription then move a little': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                });

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            Y.Event.simulate(submodule1.getDOMNode(), 'mousemove', {
                pageX: submodule1.get('offsetLeft') + 2,
                pageY: submodule1.get('offsetTop') + 2,
                type: 'mousemove',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 500ms');
            }, 550);
        },

        'test: on subscription with custom threshold': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                }, {theshold: 10});

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            Y.Event.simulate(submodule1.getDOMNode(), 'mousemove', {
                pageX: submodule1.get('offsetLeft') + 7,
                pageY: submodule1.get('offsetTop') + 8,
                type: 'mousemove',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 500ms');
            }, 550);
        },

        'test: on subscription then mouseup': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                });

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'mousedown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'mousedown',
                target: submodule1
            });

            Y.Event.simulate(submodule1.getDOMNode(), 'mouseup', {
                pageX: submodule1.get('offsetLeft'),
                pageY: submodule1.get('offsetTop'),
                type: 'mouseup',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 500ms');
            }, 550);
        },

        'test: on subscription with MSPointer': function () {
            var flag = false,
                handle = submodule1.on('hold', function (e) {
                    flag = true;
                });

            this.handles.push(handle);

            Y.Event.simulate(submodule1.getDOMNode(), 'MSPointerDown', {
                clientX: submodule1.get('offsetLeft'),
                clientY: submodule1.get('offsetTop'),
                type: 'MSPointerDown',
                target: submodule1
            });

            this.wait(function(){
                Assert.isFalse(flag, 'hold should not be triggered at 100ms');
            }, 100);

            this.wait(function(){
                Assert.isTrue(flag, 'hold should be triggered at 500ms');
            }, 550);
        },

        _should: {
            ignore: {
                'test: on subscription with MSPointer': (Y.UA.ie !== 10 || !Y.UA.touchEnabled),
            }
        }


    }));


    Y.Test.Runner.add(suite);

}, '', {requires:['event-hold', 'test', 'event-simulate', 'node']});
