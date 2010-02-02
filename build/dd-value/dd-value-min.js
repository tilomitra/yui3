YUI.add("dd-value",function(H){var A="host",D="dragNode",B="min",G="max",F="value",C=Math.round;function E(){E.superclass.constructor.apply(this,arguments);}H.Plugin.DDValue=H.extend(E,H.Base,{_key:null,_offsetXY:null,_factor:1,initializer:function(){var K=this.get(A),I=K.con||this._defaultConstrain(),J;this._key=E._AXIS_KEYS[this.get("axis")];this._evtGuid=J=H.guid()+"|";K.after(J+"drag:align",this._afterAlign,this);I.after(J+"constrain2nodeChange",this.syncDragNode,this);I.after(J+"constrain2viewChange",this.syncDragNode,this);I.after(J+"constrain2regionChange",this.syncDragNode,this);this.after({minChange:this._afterMinChange,maxChange:this._afterMaxChange,valueChange:this._afterValueChange});this.syncDragNode();},_defaultConstrain:function(){var I=this.get(A);I.plug(H.Plugin.DDConstrain,{constrain2node:I.get(D).get("parentNode")});return I.con;},syncDragNode:function(){this._cacheOffset();this._calculateFactor();this._setPosition(this.get(F));},destructor:function(){var I=this.get(A);I.detach(this._evtGuid+"*");if(I.con){I.con.detach(this._evtGuid+"*");}this.detach();},_cacheOffset:function(){var I=this.get(A).con.getRegion();this._offsetXY=I[this._key.offsetEdge];},_calculateFactor:function(){var I=this.get(A).con.getRegion(true);this._factor=(this.get(G)-this.get(B))/(I[this._key.farEdge]-I[this._key.offsetEdge]);},_afterAlign:function(K){var I=this.get(A),J=this._offsetToValue(I.actXY[this._key.xyIndex]);if(K.prevVal!==J){this.set(F,J,{ddEvent:K});}},_offsetToValue:function(J){J-=this._offsetXY;var I=C(J*this._factor)+this.get(B);return this._nearestValue(I);},_valueToOffset:function(I){I-=this.get(B);return C(I/this._factor)+this._offsetXY;},_afterMinChange:function(I){this._verifyValue();this.syncDragNode();},_afterMaxChange:function(I){this._verifyValue();this.syncDragNode();},_verifyValue:function(){var J=this.get(F),I=this._nearestValue(J);if(J!==I){this.set(F,I);}},_afterValueChange:function(I){if(!I.ddEvent){this._setPosition(I.newVal);}},_setPosition:function(J){var I=this.get(A);if(!I.deltaXY){I.actXY=I.get(D).getXY();I._setStartPosition(I.actXY);}I.actXY[this._key.xyIndex]=this._valueToOffset(J);I._moveNode();},_validateNewMin:function(I){return H.Lang.isNumber(I);},_validateNewMax:function(I){return H.Lang.isNumber(I);},_validateNewValue:function(I){return(I===this._nearestValue(I));},_nearestValue:function(L){var K=this.get(B),I=this.get(G),J;J=(I>K)?I:K;K=(I>K)?K:I;I=J;return(L<K)?K:(L>I)?I:L;},_validateNewAxis:function(I){return I==="x"||I==="y";},_defaultAxis:function(){return(this.get(A).con.get("stickY"))?"y":"x";},_getValueFromPosition:function(){this._key=E._AXIS_KEYS[this.get("axis")];var I=this.get(A).get(D).getXY()[this._key.xyIndex];this._cacheOffset();this._calculateFactor();return this._offsetToValue(I);}},{NAME:"ddValue",NS:"val",_AXIS_KEYS:{x:{offsetEdge:"left",farEdge:"right",xyIndex:0},y:{offsetEdge:"top",farEdge:"bottom",xyIndex:1}},ATTRS:{host:{writeOnce:true},axis:{valueFn:"_defaultAxis",writeOnce:true,validator:"_validateNewAxis"},min:{value:0,validator:"_validateNewMin"},max:{value:100,validator:"_validateNewMax"},value:{valueFn:"_getValueFromPosition",validator:"_validateNewValue"}}});},"@VERSION@",{requires:["dd-constrain"]});