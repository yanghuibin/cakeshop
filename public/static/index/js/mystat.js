var glbEvents = {};
var glbStartTime = (new Date()).getTime();
var glbCurlPool = {};

function ajax_request(url, poststr, callback, async) {
	if(async == null) {
		async = true;
	}
	var xhr = null;
    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xhr.status == 200 && callback != null && typeof(callback) == "function") {
			callback(xhr.responseText);
	    }
    };
    xhr.open('POST', url, async);
    //xhr.setRequestHeader("P3P", 'CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(poststr);
}

function curl_request(url, getstr) {
	if(getstr) {
		if(url.indexOf("?") < 0) {
			url += "?";
		} else {
			url += "&";
		}
		url += getstr;
	}
	var img = new Image();
	img.src = url;
	glbCurlPool[url] = img;
}

var _statLog = (new (function() {
	
	var log = {}
	var self = this;
	var isLogoutGame = false;
	var resHostBak = "";
	var firstWaitTime = 500;
	var options = [
	   'Preloader',
	   'WinLoad',
       'ActiveTime',
       'TotalTime',
       'Window',
       'Screen',
       'Zoom',
       'Flash',
       'ResHost',
       'NodeIP1',
       'ResTime1',
       'NodeIP2',
       'ResTime2',
       'Remark'
	];
	
	log.Start = (new Date()).getTime();
	log.UseTimes = 0;
	
	function getWinWH(){
		var o = {}
		if(window.innerWidth){
			o.w = window.innerWidth;
			o.h = window.innerHeight;
		}else{
			o.w = document.documentElement.clientWidth;
			o.h = document.documentElement.clientHeight;
		}
		return o;
	}
	
	self.detectZoom = function() {
		var ratio = 0,
		screen = window.screen,
		ua = navigator.userAgent.toLowerCase();
		
		if (window.devicePixelRatio !== undefined) {
			ratio = window.devicePixelRatio;
		}
		else if (~ua.indexOf('msie')) {
			if (screen.deviceXDPI && screen.logicalXDPI) {
				ratio = screen.deviceXDPI / screen.logicalXDPI;
			}
		} else if (window.outerWidth !== undefined && window.innerWidth !== undefined) {
			ratio = window.outerWidth / window.innerWidth;
		}
		
		if (ratio) {
			ratio = Math.round(ratio * 100);
		}
		
		return ratio;
	};
	
	var win = getWinWH();
	log.Window = win.w+'x'+win.h;
	log.Screen = window.screen.width+'x'+window.screen.height;
	log.Zoom = self.detectZoom();
	
	window.onmouseover = function(){
		if(log.UseTimes > 0){
			log.FocusTimes = new Date().getTime();
		}else{
			log.FocusTimes = log.Start;
		}
	}
	
	window.onmouseout = function(){
		log.BlurTimes = new Date().getTime();
		log.UseTimes = log.UseTimes+(log.BlurTimes - log.FocusTimes);
	}
	
	function post(str,async){
		if(str == "") {
			return;
		}
		var url = "//"+glbStatConfig.stat_host+"/stat/mystat.php";
		//ajax_request(url, str);
		str += "&js_time="+(new Date()).getTime();
		curl_request(url, str);
	}
	
	function toJsonParam(){
		var arr =[],str = 'data=';
		for(var k in options){
			k = options[k];
			if(log[k]){
				var s = '"'+k+'":"'+log[k]+'"';
				arr.push(s);
			}
		}
		str+=encodeURIComponent('{'+arr.join(',')+'}');
		str+='&click_id='+glbStatConfig.click_id;
		return str;
	}
	
	/**
	 * 测速功能
	 */
	self.speedResponse = function(res_id, client_ip, server_host) {
		var time = (new Date()).getTime() - log.Start;
		log['NodeIP'+res_id] = client_ip;
		log['ResTime'+res_id] = time;
		traceLog(server_host+time);
		//0.5s内，主CDN返回后，立即开始加载。0.5s后，先到者先用。
		if(res_id == 1 || time > firstWaitTime) {
			loadGame(res_id, server_host);
		} else {
			if(resHostBak == "") {
				resHostBak = server_host;
				setTimeout(function() {
					loadGame(res_id, resHostBak);
				}, firstWaitTime - time); //0.5s 备用CDN先到，再等到0.5s再加载
			}
		}
		
	}
	
	var events = {
		'Preloader' : function(){
			var str = toJsonParam();
			post(str,true);
			
		},
		'WinLoad' : function(){
			log.ActiveTime = log.UseTimes + (new Date()).getTime() - log.BlurTimes;
			log.TotalTime = (new Date()).getTime() - glbStartTime;
			var str = toJsonParam();
			post(str,true);
		},
		'KeepAlive' : function(){
			log.ActiveTime = log.UseTimes + (new Date()).getTime() - log.BlurTimes;
			log.TotalTime = (new Date()).getTime() - glbStartTime;
			var str = toJsonParam();
			post(str,true);
		}
	}
	
	/**
		JS接口：
		type – 动作类型
		function statLog(type) {
		}
	 * 
	 **/
	
	self.log = function(type){
		log[type] = (new Date()).getTime()-log.Start;
		if(typeof(events[type]) == 'function'){
			events[type].call();
		}
		if(typeof(glbEvents[type]) == 'function'){
			glbEvents[type].call();
		}
		//traceLog("[StatLog] " + type);
	}
	
	self.addLoadEvent = function(func) {
		var oldonload = window.onload;//得到上一个onload事件的函数
		if (typeof window.onload != 'function') {//判断类型是否为'function',注意typeof返回的是字符串
			window.onload = func;
		} else {
			window.onload = function() {
				oldonload();//调用之前覆盖的onload事件的函数---->由于我对js了解不多,这里我暂时理解为通过覆盖onload事件的函数来实现加载多个函数
				func();//调用当前事件函数
			}
		}
	}

	/**
	 *	设置cookie 
	 */
	self.setCookie = function(name,value,time) {
		var exp = null;
		if(typeof(time) !=  "undefined") {
			exp = new Date(); 
			exp.setTime(exp.getTime() + time*1000);
		}
		var str = name + "=" + escape(value);
		if(exp != null) {
			str += ";expires=" + exp.toGMTString();
		}
	    document.cookie = str;
	}
		
	/**
	 *	获取cookie 
	 */
	self.getCookie = function(name) {
		var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
		if(arr!=null) return unescape(arr[2]);
		return null;
	}

	/**
	 * 记录点击事件
	 * @param position 点击位置名称
	 * @param subject 当前点击对象的内容
	 * @param keyClick 是否关键点击。传值true OR false。默认为false
	 * @param clickstr 附加参数，默认空
	 */
	self.logClick = function(position, subject, keyClick, clickstr) {
		if(!glbStatConfig || !glbStatConfig['click_id']) {
			return;
		}
		if(!glbStatConfig['log_event']) {
			glbStatConfig['log_event'] = {};
		}
		var str = "etype=click&click_id=" + glbStatConfig['click_id']
				+ "&position=" + encodeURIComponent(position)
				+ "&subject=" + encodeURIComponent(subject);
		traceLog("click: "+str);
		if(glbStatConfig['log_event'][str]) {
			return;
		}
		glbStatConfig['log_event'][str] = 1;
		var url = "//"+glbStatConfig.stat_host+"/stat/mystat.php?" + str;
		if(keyClick) {
			url += "&key_click=yes"			
		}
		if(clickstr) {
			url += "&clickstr="+encodeURIComponent(clickstr);
		}
		url += "&js_time="+(new Date()).getTime();
		var img = new Image();
		img.src = url;
	}
	

}));

/**
 * 异步，非阻塞加载JS
 */
function asyncLoadJS(url) {
	var headObj = document.getElementsByTagName('HEAD').item(0);
	var scriptObj = document.createElement("script");
	scriptObj.type = "text/javascript";
	scriptObj.src = url;
	headObj.appendChild(scriptObj);
}

/**
 *	离开页面弹窗提示 
 */
//window.onunload = function(){}
//window.onbeforeunload = function(event) {}

function traceLog(str) {
	if(console) console.log(str);
}

function speed_load() {
	var time = (new Date()).getTime();;
	var res1 = glbFirstResURL + "speed.php?res_id=1&callback=speed_callback&js_time="+time;
	var res2 = glbSecondResURL + "speed.php?res_id=2&callback=speed_callback&js_time="+time;
	asyncLoadJS(res1);
	asyncLoadJS(res2);
}

function speed_callback(res_id, client_ip, server_host) {
	_statLog.speedResponse(res_id, client_ip, server_host);
}


//speed_load(); //开始获取“快速响应的CDN服务”
_statLog.log("Preloader");
/*
setTimeout(function() {
	_statLog.log("KeepAlive");
	setTimeout(function() {
		_statLog.log("KeepAlive");
		setTimeout(function() {
			_statLog.log("KeepAlive");
			setTimeout(function() {
				_statLog.log("KeepAlive");
				setTimeout(function() {
					_statLog.log("KeepAlive");
				}, 300000);
			}, 180000);
		}, 60000);
	}, 30000);
}, 10000);
*/
_statLog.addLoadEvent(function() {
//	_statLog.log("WinLoad");
});