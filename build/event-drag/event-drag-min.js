YUI.add("event-drag",function(e,t){var n={START:"gesturemovestart",MOVE:"gesturemove",END:"gesturemoveend"},r="move",i="dragMinDistance",s="dragMaxTouches",o="dragLockAxis",u="dragLockMinDistance",a="preventDefault",f="Y_DRAG_ON_START_HANDLE",l="Y_DRAG_ON_MOVE_HANDLE",c="Y_DRAG_ON_END_HANDLE",h={_eventType:r,processArgs:function(t){var n=t.length>3?e.merge(t.splice(3,1)[0]):{};return i in n||(n[i]=this.MIN_DISTANCE),s in n||(n[s]=this.MAX_TOUCHES),o in n||(n[o]=this.LOCK_AXIS),a in n||(n[a]=this.PREVENT_DEFAULT),n},on:function(e,t,r){var i=this,s=t._extra,o;o=e.on(n.START,function(n){i._onDragStart(n,e,t,r)},{preventDefault:s[a]}),t[f]=o},detach:function(e,t,n){var r=t[f];r&&(r.detach(),t[f]=null),this.detachMoveEnd(t)},detachMoveEnd:function(e){var t=e[l],n=e[c];t&&(t.detach(),e[l]=null),n&&(n.detach(),e[c]=null),e.startXY=undefined,e.direction=undefined,e.previousXY=undefined},_onDragStart:function(e,t,r,i){var s=this;r.startXY=[e.pageX,e.pageY],r[l]=t.on(n.MOVE,function(e){s._onDrag(e,t,r,i)}),r[c]=t.on(n.END,function(e){s._onDragEnd(e,t,r,i)},{standAlone:!0})},_onDrag:function(e,t,n,r){var i=n.startXY,s=[e.pageX,e.pageY],o=Math.abs(s[0]-i[0]),u=Math.abs(s[1]-i[1]);this._isValidDirection(o,u,i,s)&&this._isValidDrag(e,o,u,i,s,n)&&this._fireDrag(e,r,o,u,i,s)},_isValidDrag:function(e,t,n,r,o,u){var a=u._extra,f=a[i],l=a[s],c=e.touches?e.touches.length:1;return(t>f||n>f)&&c<=l&&this._doesPassLocked(a,t,n,u,o)?!0:!1},_isValidDirection:function(e,t,n,r){return!0},_doesPassLocked:function(e,t,n,r,i){var s=e[o],a=r.direction,f=e[u],l=r.previousXY;if(!s&&!a)return!0;if(!s||!!a)return r.previousXY=i,a==="x"&&i[1]-l[1]===0?!0:a==="y"&&i[0]-l[0]===0?!0:!1;if(t<=f&&n<=f)return console.log("threshold for locking has not been reached"),!0;if(t>f&&n<=f)return console.log("threshold for locking reached for X-Direction"),r.direction="x",r.previousXY=i,!0;if(t<=f&&n>f)return console.log("threshold for locking reached for Y-Direction"),r.direction="y",r.previousXY=i,!0},_determineDirection:function(e,t,n,r){return e>=t?r[0]-n[0]>0?"right":"left":r[1]-n[1]>0?"down":"up"},_onDragEnd:function(e,t,n,r){this.detachMoveEnd(n)},_fireDrag:function(e,t,n,r,i,s){e.type=this._eventType,e.gesture={direction:this._determineDirection(n,r,i,s),deltaX:s[0]-i[0],deltaY:s[1]-i[1]},t.fire(e)},MIN_DISTANCE:10,MAX_TOUCHES:1,LOCK_AXIS:!1,LOCK_MIN_DISTANCE:15,PREVENT_DEFAULT:!1};e.Event.define(r,h),e.Event.define("moveleft",e.merge(h,{_eventType:"moveleft",_isValidDirection:function(e,t,n,r){return this._determineDirection(e,t,n,r)==="left"?!0:!1}})),e.Event.define("moveright",e.merge(h,{_eventType:"moveright",_isValidDirection:function(e,t,n,r){return this._determineDirection(e,t,n,r)==="right"?!0:!1}})),e.Event.define("moveup",e.merge(h,{_eventType:"moveup",_isValidDirection:function(e,t,n,r){return this._determineDirection(e,t,n,r)==="up"?!0:!1}})),e.Event.define("movedown",e.merge(h,{_eventType:"movedown",_isValidDirection:function(e,t,n,r){return this._determineDirection(e,t,n,r)==="down"?!0:!1}}))},"@VERSION@",{requires:["event-move"]});
