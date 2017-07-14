/**
 * 程序入口
 * @author Jimmy Song, Chen Peng
 * @date 2014-01-15
 * @version 1.0.12
 */
jBud.define("message/index",['message/control','message/data','message/view'],function(require,exports,module){
	var Data = require("message/data");
	var View = require("message/view");
	var control = require("message/control");
	var callback = function(){ } , parameters = {}, callbackName , init , needShow;
	
	var message = new control.Message(Data, new View());
	
	parameters = jBud.getConfigParameters();
	callbackName = parameters["callback"];
	
	if(typeof callbackName === 'string') {
		callback = typeof window[callbackName] === 'function' ? window[callbackName] : callback;
	}
	
	//是否初始化
	init = parameters["init"];
	needShow = parameters["needShow"];
	
	if(init == 'false') init = false;
	else if (init == 'true') init = true;
	else init = true;

	if(needShow == 'false') needShow = false;
	else if (needShow == 'true') needShow = true;
	else needShow = true;
	
	if(init){
		message.setState('needShow', needShow);
		message.init();
	}
	
	callback({
		close : function() {
			var state = message.getState("OFFLINE");
			if(typeof state !== 'undefined' && !state)
				message.inactive(); 
		},
		open : function(){ 
			message.init();
			var state = message.getState("OFFLINE");
			if(typeof state !== 'undefined' && !state)
				message.active(); 
		},
		reload : function(){ 
			message.reload();
		},
		isOnline : function() {
			return !message.getState("OFFLINE");
		},
		addStateListener : function(callback){
			message.addEventListener("state",callback);
		},
		removeStateListener : function(callback){
			message.removeEventListener("state",callback);
		}
	});
});