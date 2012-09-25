YUI.add("treeview",function(e,t){var n=e.ClassNameManager.getClassName,r=e.Base.create("treeView",e.View,[e.Tree],{classNames:{canHaveChildren:n("treeview-can-have-children"),children:n("treeview-children"),hasChildren:n("treeview-has-children"),indicator:n("treeview-indicator"),label:n("treeview-label"),node:n("treeview-node"),noTouch:n("treeview-notouch"),open:n("treeview-open"),row:n("treeview-row"),selected:n("treeview-selected"),touch:n("treeview-touch"),treeview:n("treeview")},rendered:!1,_isYUITreeView:!0,initializer:function(){this._attachTreeViewEvents()},destructor:function(){this._detachTreeViewEvents()},getHTMLNode:function(e){return e._htmlNode||(e._htmlNode=this.get("container").one("#"+e.id)),e._htmlNode},render:function(){var t=this.get("container");return t.addClass(this.classNames.treeview),"ontouchstart"in e.config.win?t.addClass(this.classNames.touch):t.addClass(this.classNames.noTouch),this._childrenNode=this.renderChildren(this.rootNode,{container:t}),t.inDoc()||e.one("body").append(t),this.rendered=!0,this},renderChildren:function(t,n){n||(n={});var i=n.container,s=i&&i.one("."+this.classNames.children);s||(s=e.Node.create(r.Templates.children({classNames:this.classNames,node:t,treeview:this}))),t.isRoot()?(s.set("tabIndex",0),s.set("role","tree")):s.set("role","group"),t.hasChildren()&&s.set("aria-expanded",t.isOpen());for(var o=0,u=t.children.length;o<u;o++)this.renderNode(t.children[o],{container:s,renderChildren:!0});return i&&i.append(s),s},renderNode:function(t,n){n||(n={});var i=this.classNames,s=t._htmlNode;s||(s=t._htmlNode=e.Node.create(r.Templates.node({classNames:i,node:t,treeview:this})));var o=s.one("."+i.label),u=o.get("id");return o.setHTML(t.label),u||(u=e.guid(),o.set("id",u)),s.set("aria-labelledby",u),s.set("role","treeitem"),t.canHaveChildren&&(s.addClass(i.canHaveChildren),s.toggleClass(i.open,t.isOpen()),t.hasChildren()&&(s.addClass(i.hasChildren),n.renderChildren&&this.renderChildren(t,{container:s}))),n.container&&n.container.append(s),s},_attachTreeViewEvents:function(){this._treeViewEvents||(this._treeViewEvents=[]);var e=this.classNames,t=this.get("container");this._treeViewEvents.push(this.after({add:this._afterAdd,close:this._afterClose,multiSelectChange:this._afterTreeViewMultiSelectChange,open:this._afterOpen,remove:this._afterRemove,select:this._afterSelect,unselect:this._afterUnselect}),t.on("mousedown",this._onMouseDown,this),t.delegate("click",this._onIndicatorClick,"."+e.indicator,this),t.delegate("click",this._onRowClick,"."+e.row,this),t.delegate("dblclick",this._onRowDoubleClick,"."+e.canHaveChildren+" > ."+e.row,this))},_detachTreeViewEvents:function(){(new e.EventHandle(this._treeViewEvents)).detach()},_afterAdd:function(e){if(!this.rendered)return;var t=e.parent,n,r;if(t===this.rootNode)n=this._childrenNode;else{r=this.getHTMLNode(t),n=r&&r.one("."+this.classNames.children);if(!n){r||(r=this.renderNode(t)),this.renderChildren(t,{container:r});return}}n.insert(this.renderNode(e.node,{renderChildren:!0}),e.index)},_afterClear:function(e){if(!this.rendered)return;delete this._childrenNode,this.rendered=!1,this.get("container").empty(),this.render()},_afterClose:function(e){var t=this.getHTMLNode(e.node);t.removeClass(this.classNames.open),t.set("aria-expanded",!1)},_afterOpen:function(e){var t=this.getHTMLNode(e.node);t.addClass(this.classNames.open),t.set("aria-expanded",!0)},_afterRemove:function(e){var t=this.getHTMLNode(e.node);t&&(t.remove(!0),delete e.node._htmlNode)},_afterSelect:function(e){var t=this.getHTMLNode(e.node);t.addClass(this.classNames.selected),this.multiSelect?t.set("aria-selected",!0):t.set("tabIndex",0).focus()},_afterTreeViewMultiSelectChange:function(e){var t=this.get("container"),n=t.one("> ."+this.classNames.children),r=t.all("."+this.classNames.node);e.newVal?(n.set("aria-multiselectable",!0),r.set("aria-selected",!1)):(n.removeAttribute("aria-multiselectable"),r.removeAttribute("aria-selected"))},_afterUnselect:function(e){var t=this.getHTMLNode(e.node);t.removeClass(this.classNames.selected),this.multiSelect&&t.set("aria-selected",!1),t.removeAttribute("tabIndex")},_onIndicatorClick:function(e){var t=e.currentTarget.ancestor("."+this.classNames.row);e.stopImmediatePropagation(),this.getNodeById(t.getData("node-id")).toggle()},_onMouseDown:function(e){e.preventDefault()},_onRowClick:function(e){var t=this.getNodeById(e.currentTarget.getData("node-id"));this.multiSelect?t[t.isSelected()?"unselect":"select"]():t.select()},_onRowDoubleClick:function(e){this.getNodeById(e.currentTarget.getData("node-id")).toggle()}});e.TreeView=e.mix(r,e.TreeView)},"@VERSION@",{requires:["base-build","classnamemanager","tree","treeview-templates","view"],skinnable:!0});
