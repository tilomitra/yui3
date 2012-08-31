YUI.add("autocomplete-highlighters",function(e,d){var c=e.Array,a=e.Highlight,b=e.mix(e.namespace("AutoCompleteHighlighters"),{charMatch:function(i,h,f){var g=c.unique((f?i:i.toLowerCase()).split(""));return c.map(h,function(j){return a.all(j.text,g,{caseSensitive:f});});},charMatchCase:function(g,f){return b.charMatch(g,f,true);},phraseMatch:function(h,g,f){return c.map(g,function(i){return a.all(i.text,[h],{caseSensitive:f});});},phraseMatchCase:function(g,f){return b.phraseMatch(g,f,true);},startsWith:function(h,g,f){return c.map(g,function(i){return a.all(i.text,[h],{caseSensitive:f,startsWith:true});});},startsWithCase:function(g,f){return b.startsWith(g,f,true);},subWordMatch:function(i,g,f){var h=e.Text.WordBreak.getUniqueWords(i,{ignoreCase:!f});return c.map(g,function(j){return a.all(j.text,h,{caseSensitive:f});});},subWordMatchCase:function(g,f){return b.subWordMatch(g,f,true);},wordMatch:function(h,g,f){return c.map(g,function(i){return a.words(i.text,h,{caseSensitive:f});});},wordMatchCase:function(g,f){return b.wordMatch(g,f,true);}});},"@VERSION@",{"requires":["array-extras","highlight-base"]});