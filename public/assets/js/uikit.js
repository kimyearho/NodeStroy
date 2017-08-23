// JS EXTENSIONS
// -------------------------------------------------
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
// JQUERY EXTENSIONS
// -------------------------------------------------
$.fn.hasAttr = function(name) {  
   return this.attr(name) !== undefined && this.attr(name) !== false;
};
$.fn.hasEl = function(sel) {
  return this.find(sel).length ? true : false;
}
$.fn.isEmpty = function() {
  return ! this.find("*").length ? true : false;
}
$.fn.isNotEmpty = function() {
  return this.find("*").length ? true : false;
}
$.fn.exists = function() {
  return this.length ? true : false;
};

$.fn.toggleClasses = function(col) {
  var arr = col.trim().split(" ");
  var el = this;
  
  if(arr) {
    for(var i=0; i < arr.length; i++) {
      var str = arr[i];
      if(el.hasClass(str)) {
         el.removeClass(str);
       } else {
         el.addClass(str);
       }
    }
  }
};

// UTILS
// -------------------------------------------------
var htmlMap = {"&": "&amp;","<": "&lt;",">": "&gt;",'"': '&quot;',"'": '&#39;',"/": '&#x2F;'};
isArray = function(a) {
  return (!!a) && (a.constructor === Array);
};
isObject = function(a) {
  return (!!a) && (a.constructor === Object);
};
isString = function(a) {
  return (!!a) && (a.constructor === String);
};
function toJsonFormat(str) {
  str = str.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  str= str.replace(/:(?!true|false)([a-zA-Z]+)/g, ':"$1"');
  str = str.replace(/'/g, '"');
  return str;
}
function jsonify(str) {
  str = toJsonFormat(str);
  return jQuery.parseJSON(str);
}
function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return htmlMap[s];
  });
}
function cycleForward(index, total) {
  var i = index + 1;
  i = (i >= total)? 0 : i;
  return i;
}
function cycleBack(index, total) {
  var i = index - 1;
  i = (i < 0)? total - 1 : i;
  return i;
}
function isMobileScreen() {
  return window.innerWidth < 768
}


// Class Toggler
// ----------------------------------------------------
$("body").on("click", "[data-ctoggle]", function(e) {
  e.preventDefault();
  var $el = $(this);
  $el.toggleClass("toggled");
  
  if($el.hasClass("active")) {
    $el.attr("aria-expanded", "true");
  } else {
    $el.attr("aria-expanded", "false");
  }
  
  var argStr, argObj, target, $target;
  var duration = 400;
  argStr = $el.attr("data-ctoggle");
  target = $el.attr("data-target");
  
  if(argStr.indexOf("{") != -1) {
    argObj = jsonify(argStr);
    if(isObject(argObj)) {
      $target = (argObj.target !="self")? $(argObj.target) : $el;
      $target.addClass("toggling").toggleClasses(argObj.clist);
      var dur = argObj.duration || duration;

      setTimeout(function() {
        $target.removeClass("toggling");
      }, dur);

    } else if(isArray(argObj)) {
      argObj.forEach(function(itm) {
        $target = (itm.target !="self")? $(itm.target) : $el;
        $target.addClass("toggling").toggleClasses(itm.clist);
        var dur = itm.duration || duration;
        
        setTimeout(function() {
          $target.removeClass("toggling");
        }, dur);
      });
    }
  } else {
    if(argStr) {
      $target = target ? $(target) : $el;
      $target.addClass("toggling").toggleClasses(argStr);
      var dur = parseInt($el.attr("data-duration")) || duration;

      setTimeout(function() {
        $target.removeClass("toggling");
      }, dur);
    }
  }
});


// Scroll Toggler
// ----------------------------------------------------
var scrollToggleCol = [];

var scrollToggle = function() {

  if(scrollToggleCol.length == 0) return;
  
  var top = $(window).scrollTop();

  for(var i=0; i < scrollToggleCol.length; i++) {
    var itm = scrollToggleCol[i];

    if(itm.clist) {
      if(top > itm.triggerH) {
        itm.target.addClass(itm.clist);
      } else {
        itm.target.removeClass(itm.clist);
      }
    } else {
      if(top > itm.triggerH) {
        itm.target.addClass(itm.add);
        itm.target.removeClass(itm.remove);
      } else {
        itm.target.addClass(itm.remove);
        itm.target.removeClass(itm.add);
      }
    }
  }

};

$("[data-scroll-toggle]").each(function() {
  var $el = $(this);
  var clistObj;
  
  var dataClist =  $el.attr("data-scroll-toggle");
  var dataTarget =  $el.attr("data-target");
  var dataTrigger = $el.attr("data-trigger");
  var dataTriggerH = $el.attr("data-triggerh");
  
  if(dataClist.indexOf("{") != -1) {
    clistObj = jsonify(dataClist);
  }
  
  var $target = dataTarget ? $(dataTarget) : $el;
  var $trigger = dataTrigger ? $(dataTrigger) : $el;
  var trigH = isNaN(parseInt(dataTriggerH)) ? $trigger.outerHeight() : parseInt(dataTriggerH);

  var obj = {target:$target, triggerH:trigH, clist:dataClist};
  
  if(clistObj) {
    obj.add = clistObj.add;
    obj.remove = clistObj.remove;
    obj.clist = "";
  } 
  
  scrollToggleCol.push(obj);
});

if(scrollToggleCol.length > 0) $(window).scroll(scrollToggle);

// READY
// ----------------------------
$(document).ready(function(e) {

  // Tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Masonry Grid
  var $grid = $(".grid");
  var opts = {
    itemSelector:".grid-itm",
    columnWidth:".base-size",
    percentPosition:true
  };

  $(window).resize(function () {
    if(window.innerWidth < 768) {
      if($grid.data("masonry")) $grid.masonry('destroy');
    } else {
      $grid.masonry(opts);
    }
  });

});
