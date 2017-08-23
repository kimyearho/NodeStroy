/**
 * jQuery commons Library Functions
 * */
var common = {
		
		form : document.forms[1],
		
		hidden_input : function(name, value) {
			$('<input></input>').attr({ type : "hidden",  name : name, value : value }).appendTo(common.form);
		} ,
		
		array_hidden_input : function(array_key, array_value) {
			$('<input></input>').attr({ type : "hidden",  name : array_key, value : array_value, 'ng-value' : array_value }).appendTo(common.form);
		}
		
		
		
};