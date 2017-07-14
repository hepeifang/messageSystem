/**
 * 数据层
 * @author Jimmy Song, Chen Peng
 * @date 2014-01-15
 * @version 1.0.12
 */
jBud.define('message/data',['socket.io'],function(require,exports,module) {
	// 获取到 WebSocket IO 接口
	var IO = require("socket.io");
	/**
	 * 基本数据地址API
	 */
	var base = "http://chat.xuan.news.cn/api";

	var socketServer = "http://chat.xuan.news.cn:80/"
	//var socketServer = "http://172.18.11.103:8041";

	var styleServer = "http://tmisc.home.news.cn/chat/css";
	//var styleServer = "http://jimmy.news.cn:90/css";
	
	/**
	 * 基础数据配置
	 */
	var config = {
			urls: {
				//是否登录请求
				isLogin:base+"/checkLoginStatus.do",
				//用户信息
				userInfo:base+"/userInfo.do",
				//对话消息
				chat:base+'/chatInfo.do',
				//上传接口
				upload : base+'/uploadFile.do',
				// 上传的SWFUpload组件
				swfupload : base+ '/swfupload.swf'
			},
			
			styles : {
				// 基础
				base : styleServer+'/message.main.css',
				// 表情
				faces : styleServer + '/faces/',
				// 皮肤
				skins : styleServer+'/skins/'
			},
			
			recent : {
				max : 15
			},
			talk : {
				max : 50
			},
			text : {
				max : 1000
			},
			faces : ["傲慢","白眼","闭嘴","呲牙","大哭","得意","调皮","发呆","发怒","尴尬","害羞","惊讶","可爱","酷","冷汗","流泪","难过","撇嘴","色","睡觉","偷笑","吐","微笑","抓狂"],
			skins : ["skin001","skin002","skin003","skin004","skin005"]
	};
	
	// socket 链接池
	var socketConnect;
	
	/**
	 * 数据模型链
	 */
	module.exports = {
			isReconnect : false,
			/**
			 * 获得基础的样式配置
			 */
			getStyleBase : function(){
				return config.styles.base;
			},
			
			/**
			 * 获得默认的皮肤
			 */
			getSkinDefault : function(){
				return config.skins[1];
			},
			
			getSkinPath : function(){
				return config.styles.skins;
			},
			
			/**
			 * 获得最近联系人的配置
			 */
			getRecent : function(name) {
				if(typeof name === 'undefined') return config.recent;
				return config.recent[name];
			},
			
			/**
			 * 获得讨论组配置
			 */
			getTalk : function(name){
				if(typeof name === 'undefined') return config.talk;
				return config.talk[name];
			},
			/**
			 * 获得上传地址
			 */
			getUpload : function() {
				return config.urls.upload;
			},
			/**
			 * 获得上传的组件
			 */
			getSWFUpload : function(){
				return config.urls.swfupload;
			},
			
			/**
			 * 获得表情所有的名称
			 */
			getFaceNames : function(){
				return config.faces;
			},
			
			/**
			 * 获得所有的表情，未来可以通过配置方式进行构建
			 */
			getFace : function(){
				return config.styles.faces;
			},
			
			/**
			 * 获取文本的配置
			 */
			getText : function(name){
				if(typeof name === 'undefined') return config.talk;
				return config.text[name];
			},
			
			/**
			 * 请求与服务器连接
			 */
			connect:function() {
				if(!socketConnect) {
					socketConnect = IO.connect(socketServer,{reconnect:false});
				}
				if(this.isReconnect && socketConnect) {
					if(typeof socketConnect.socket.reconnect == 'function')
						socketConnect.socket.reconnect();
					this.isReconnect = false;
				}		
				return socketConnect;
			},
			/**
			 * 请求与服务器断开连接
			 */
			disconnect:function() {
				if(socketConnect) {
					socketConnect.removeAllListeners();
					socketConnect.disconnect();
				}
				this.isReconnect = true;
			},
			
			/**
			 * 执行清理
			 */
			clear : function() {
				this.disconnect();
				delete socketConnect;
			},
			/**
			 * 查询是否处于登陆状态
			 */
			queryIsLogin : function(callback) {
				jBud.jsonp(config.urls.isLogin,function(data){
					if( jBud.isFunction(callback) ) 
						callback(data.code == 200, data);
				});
			},
			
			/**
			 * 用户上线
			 */
			queryLogin : function(params,callback){
				var p = {userId:undefined};
				var socket = this.connect();
				
				jBud.extend(p,params);
				socket.emit("userOnLine",p, function(data) {
					if(jBud.isFunction(callback))
						callback(data.flag , data);
				});
				
			},
			
			/**
			 * 查询最近联系人
			 */
			queryRecent:function(params,callback){
				var p = {method:'getRecentContacts',userId:undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if(jBud.isFunction(callback)) 
						callback(data.code == 200,data);
				});
			},
			
			/**
			 * 查询好友
			 */
			queryFriend : function(params,callback){
				var p = {method:'friendsInfo',userId:undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if( jBud.isFunction(callback) ) 
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 查询好友信息 
			 */
			queryFriendInfo : function(params,callback) {
				var p = {method:'nickNameInfo',userId:undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if( jBud.isFunction(callback) ) 
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 查询讨论组
			 */
			queryTalk : function(params,callback){
				var p = {method:'getAllGroup',userId:undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if(jBud.isFunction(callback))
						callback(data.code == 200, data);
				});
			},
			
			/**
			 * 获得离线消息数
			 */
			queryOfflineMessage : function(params,callback){
				var p = {method:'getOutlineCnt',userId:undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.chat,p,function(data){
					if(jBud.isFunction(callback))
						callback(data.code == 200, data);
				});
			},
			
			/**
			 * 获取讨论组成员
			 */
			queryTalkMember : function(params, callback) {
				var p = {method:'groupMemberInfo',g_id : undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo , p , function(data){
					if(jBud.isFunction(callback)) 
						callback( data.code == 200 , data );
				});
			},
			
			/**
			 * 好友的历史消息
			 */
			queryHistoryMessageFriend : function(params,callback){
				var p = {method:"chat",userId:undefined,t_id:undefined,pageNum:undefined};
				jBud.extend(p,params);
				if(typeof p.pageNum === "undefined") delete p.pageNum;
				jBud.jsonp(config.urls.chat , p , function(data){
					if(jBud.isFunction(callback)) 
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 讨论组的历史消息
			 */
			queryHistoryMessageTalk : function(params,callback){
				var p = {method:"chatGid",g_id:undefined,pageNum:undefined};
				jBud.extend(p,params);
				if(typeof p.pageNum === "undefined") delete p.pageNum;
				jBud.jsonp(config.urls.chat , p , function(data){
					if(jBud.isFunction(callback)) 
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 获取皮肤
			 */
			querySkin : function( params , callback ) {
				var p = {method:"getSkin" , userId : undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if(jBud.isFunction(callback))
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 保存皮肤
			 */
			pushSkin : function(params, callback) {
				var p = {method : "setSkin" , userId : undefined , skinValue : undefined};
				jBud.extend(p,params);
				jBud.jsonp(config.urls.userInfo,p,function(data){
					if(jBud.isFunction(callback))
						callback(data.code == 200 , data);
				});
			},
			
			/**
			 * 获得所有皮肤
			 */
			querySkinList : function(callback){
				var result =  {skins:config.skins,path:this.getSkinPath()};
				if(jBud.isFunction(callback)) callback(result);
			},
			
			/**
			 * 监听事件
			 */
			on : function(type, callback){
				var socket = this.connect();
				socket.on(type,function(data){
					if(jBud.isFunction(callback))
						callback(data);
				});
			},
			
			/**
			 * 监听好友推送的消息
			 */
			onFriendMessage : function(callback){
				this.on("msg_show_persion",callback);
			},
			
			/**
			 * 监听讨论组推送的消息
			 */
			onTalkMessage : function(callback){
				this.on("msg_show_public",callback);
			},
			
			/**
			 * 监听离线事件
			 */
			onOffline : function(callback){
				this.on("disconnect" , callback);
			},
			
			/**
			 * 推送消息
			 */
			push : function(type,params,callback){
				var socket = this.connect();
				socket.emit(type,params,function(data){
					if(jBud.isFunction(callback))
						callback(data);
				});
			},
			
			/**
			 * 推送好友消息
			 */
			pushFriendMessage : function(params,callback){
				var p = {userId:undefined,toId:undefined,state:2,context:undefined};
				jBud.extend(p,params);
				this.push("send",p,callback);
			},
			
			/**
			 * 推送讨论组消息
			 */
			pushTalkMessage : function(params,callback){
				var p = {g_id:undefined,send_id:undefined,state:2,context:undefined};
				jBud.extend(p,params);
				this.push("sendGroup",p,callback);
			},
			
			/**
			 * 清空离线消息
			 */
			pushClearOfflineMessage : function(params,callback) {
				var p = {send_id:undefined , type : -1 , d_id:undefined};
				jBud.extend(p,params);
				this.push("offlineDel",p,callback);
			},
			
			/**
			 * 创建讨论组
			 */
			pushTalkCreate : function(params, callback) {
				var p = {g_id:jBud.uuid(),send_id : undefined , state : 3, title : undefined , join_ids : undefined};
				jBud.extend(p,params);
				this.push("joinGroup",p , callback);
			},
			
			/**
			 * 加入讨论组
			 */
			pushTalkJoin : function(params, callback) {
				var p = {g_id:undefined,send_id : undefined , state : 4, join_ids : undefined};
				jBud.extend(p,params);
				this.push("joinGroup", p ,callback);
			},
			
			/**
			 * 修改讨论组名称
			 */
			pushTalkUpdate : function(params,callback) {
				var p = {g_id:undefined,send_id : undefined , state : 5, title : undefined};
				jBud.extend(p,params);
				this.push("joinGroup", p ,callback);
			},
			
			/**
			 * 退出讨论组
			 */
			pushTalkQuit : function(params , callback ){
				var p = {g_id:undefined,userId : undefined , exitId : undefined , state : 6};
				jBud.extend(p,params);
				this.push("exitGroup", p ,callback);
			}
			
	};
});