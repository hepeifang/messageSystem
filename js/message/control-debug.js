/**
 * 控制层
 * @author Jimmy Song, Chen Peng
 * @date 2014-01-15
 * @version 1.0.12
 */
jBud.define("message/control",function(require,exports,module) {
	/**
	 * 消息模块
	 */
	var Message = function(Data,View) {
		this.Data = Data;
		this.View = View;
		this.Memory = new Memory();
		
		//获得基础BASE ID，用作渲染使用
		this.baseId = this.View.getBaseId();
		
		// 状态列表
		this.state = {};
	};
	
	/**
	 * 为Message启用监听器
	 */
	jBud.enableListener(Message.prototype);
	
	/**
	 * 扩展消息模块对象
	 */
	jBud.extend(Message.prototype,{
		/**
		 * 系统初始化
		 */
		init : function(needShow) {
			var Data = this.Data, View = this.View,Memory = this.Memory, self = this ;
			
			if(this.init.invoked) return ;
			this.init.invoked = true;
			
			// 保存当前标题
			Memory.property("TITLE",document.title);
			this.setState("OFFLINE",true);
			/*
			 * 预加载样式
			 */
			View.renderSkinBase(Data.getStyleBase(),function() {
					//加载默认皮肤
					View.renderSkin(Data.getSkinDefault(),Data.getSkinPath());
					
					self.build(needShow);
			});
			
			/*
			window.onbeforeunload = function() {
				return "leave?";
			};
			*/
		},
		
		/*
		 * 执行构建
		 */
		build : function(needShow) {
			var Data = this.Data, View = this.View,Memory = this.Memory, self = this , message;
			// 判断是否已经存在了消息面板
			message = View.get("message");
			if(message.length > 0) return ;
			
			// 设置默认值，离线为true
			this.setState("OFFLINE",true);
			// 构建基础聊天框架
			// 注：View.node 属于自定义方法， 其实质还是 jBud("body")，只是为了保证不重复调用，提升速率而已
			View.node("body").append(View.renderFramework());
			message = View.reload("message");
			
			this.login(needShow);
			
			// 安装卸载事件
			this.installUnload();
			// 当窗口聚焦时的事件
			this.installFocus();
			// 安装关闭事件
			this.installClose();
			// 安装托盘
			this.installTray();
			// 安装皮肤事件
			this.installSkin();
			// 安装面板中的内容切换
			this.installFunc();
			// 安装所有列表中的点击事件
			this.installPanelList();
			// 监听离线事件
			this.installOffline();
		},
		
		login : function(needShow) {
			var Memory = this.Memory , Data = this.Data , self = this;
			/*
			 * 获取用户是否登陆状态
			 * 1. 登陆成功，将用户对象存储到内存中，并激活消息系统
			 * 2. 登陆失败，关闭消息系统
			 */
			Data.queryIsLogin(function(result,data) {
				if( result ) {
					// 存储用户
					Memory.setUser(data.content);
					// 通知用户上线
					Data.queryLogin({userId:Memory.getUser().userid},function(result,data) {
						if(!result) {
							self.setState("OFFLINE",true);
							// 关闭状态
							self.inactive();
							// 触发状态事件 STATE=400
							self.emit("state",{code:400 , user : Memory.getUser()});
						} else {
							self.setState("OFFLINE",false);
							// 加载皮肤
							self.loadSkin();

							// 根据配置选择是否激活
							if(!!self.getState('needShow')){
								self.active();
							}

							// 触发状态事件 STATE=200
							self.emit("state",{code:200 , user : Memory.getUser()});
						}
					});
					
					// 加载皮肤列表
					self.loadSkinList();
					
					// 加载好友信息
					self.load();
				} else {
					// 清理用户
					Memory.clearUser();
					// 禁止用户
					self.inactive();
				}
			});
		},
		
		/**
		 * 加载皮肤
		 */
		loadSkin : function(){
			var Data = this.Data , Memory = this.Memory , View = this.View , user;
			user = Memory.getUser();
			
			// 加载皮肤
			Data.querySkin({userId:user.userid},function(result,data) {
				var $skin = Memory.getSkin();
				if(result && data.content) {
					var skin = data.content.skinValue;
					if(!skin) Memory.setSkin(Data.getSkinDefault());
					else Memory.setSkin(skin);
				} else {
					if(!$skin) Memory.setSkin(Data.getSkinDefault());
				}
				
				View.renderSkin(Memory.getSkin(),Data.getSkinPath());
			});
		},
		
		/**
		 * 加载皮肤列表
		 */
		loadSkinList : function(){
			var Data = this.Data, View = this.View , traySkinList;
			
			traySkinList = View.get("traySkinList");
			// 加载皮肤列表
			Data.querySkinList(function(data) {
				// 渲染皮肤
				traySkinList.html(View.renderSkinList(data));
			});
			
		},
		
		installUnload : function(){
			var View = this.View , Data = this.Data;
			
			this.installUnload.once = true;
			if(this.installUnload.invoked) return ;
			this.installUnload.invoked = true;
			
			/*
			 * 当离开界面时触发断开连接，不一定会有效，暂时保留
			 */
			View.node(window).on("unload",function(){
				Data.disconnect();
			});
		},
		
		/**
		 * 窗口聚焦事件
		 */
		installFocus : function(){
			var View = this.View , self = this;
			
			this.installFocus.once = true;
			if(this.installFocus.invoked) return ;
			this.installFocus.invoked = true;
			
			jBud(window).on("focus" , function(){
				self.loadSkin();
			});
		},
		
		/**
		 * 安装关闭事件
		 */
		installClose : function() {
			var View = this.View , panelTitle = View.get("panelTitle") , self = this;
			
			if(this.installClose.invoked) return;
			this.installClose.invoked = true;
			
			panelTitle.on("click","._MBTN-WCLOSE_",function(){
				self.inactive(true);
			});

			//面板顶部增加关闭  add by chenpeng
			panelTitle.on("click",function(){
				self.inactive(true);
			});
		},
		
		/**
		 * 安装托盘事件
		 */
		installTray : function(){
			var View = this.View , trayMessage = View.get("trayMessage") , trayTip = View.get("trayTip") , self = this, funcs , timer;
			
			if(this.installTray.invoked) return ;
			this.installTray.invoked = true;
			trayMessage.on("click" , function() {
				var actived = self.getState("ACTIVED");
				var flashTimer = self.showFlashTip.timer;

				if(!actived)
					self.active();
				else {
					if(!flashTimer)
						self.inactive();
				}
			});
			
			var doReload = function(){
				var offline = self.getState("OFFLINE");
				if(offline) {
					self.reload();
				}
			};
			
			trayMessage.once("click",function() {
				if(timer) return ;
				timer = setTimeout(function(){
					doReload();
					clearTimeout(timer);
					delete timer;
				},500);
			});
			
			trayTip.on("click",function(e){
				var panelFunc = View.get("panelFunc"), tabs = panelFunc.children("li");
				var actived = self.getState("ACTIVED");
				
				if(!actived) self.active();
				
				jBud(tabs[0]).emit("click");
				e.stopPropagation();
			});
		},
		
		/**
		 * 安装皮肤事件
		 */
		installSkin : function() {
			var View = this.View , self = this , traySkin , traySkinList , traySkinSelect;
			
			if(this.installSkin.invoked) return ;
			this.installSkin.invoked = true;
			
			traySkin = View.get("traySkin") , traySkinList = View.get("traySkinList");
			traySkinSelect = View.get("traySkinSelect");
			// 绑定事件
			traySkin.on("click",function(e) {
				traySkinSelect.toggleClass("_MHIDDEN_");
				e.stopPropagation();
			});
			
			// 皮肤列表
			traySkinList.on("click","._MT-SKIN-ITEM_",function(e){
				var target = e.target , skin ;
				skin = target.getAttribute("data-skin");
				self.pushSkin(skin);
				//e.stopPropagation();
			});
		},
		
		/**
		 * 选择皮肤
		 */
		pushSkin : function(name) {
			var View = this.View ,Data = this.Data , Memory = this.Memory , self = this , user;
			user = Memory.getUser();
			Data.pushSkin({userId:user.userid, skinValue : name} , function(result,data){
				if(result) {
					Memory.setSkin(name);
					View.renderSkin(Memory.getSkin(),Data.getSkinPath());
				}
			});
		},
		
		/**
		 * 安装面板中的内容切换
		 */
		installFunc : function(){
			var View = this.View,panelFunc,tabs , panelList;
			
			if(this.installFunc.invoked) return ;
			this.installFunc.invoked = true;
			
			// 单元移动值
			var cell = -255;
			
			panelFunc = View.get("panelFunc"), tabs = panelFunc.children("li");
			panelList = View.get("panelList");
			
			// 为TAB设定要移动的属性值
			tabs.each(function(index){
				this.setAttribute("data-move",cell*index);
			});
			
			// 为TAB绑定事件
			tabs.on("click",function(e){
				var move = View.parseFloat(this.getAttribute("data-move"));
				panelList.action({
					marginLeft:move
				},{queue:false});
				tabs.removeClass("_SELECTED_");
				jBud(this).addClass("_SELECTED_");
			});
			
			// 将第一个TAB展开
			jBud(tabs[1]).emit("click");
		},
		
		/**
		 * 执行锁定，暂时废弃
		 */
		doLockScroll : function(dom,event) {
				var delta = 0 , $dom = jBud(dom);
		        if (!event) 
		                event = window.event;
		                
		        if (event.wheelDelta) { 
		                delta = event.wheelDelta/120;
		        } else if (event.detail) { 
		                delta = -event.detail/3;
		        }
		        
		        var top = $dom.scrollTop();
		        $dom.scrollTop(top-delta*30);
		},
		/**
		 * 安装所有列表中的 好友和讨论组 点击事件
		 */
		installPanelList : function(){
			var View = this.View, panelList = View.get("panelList") , self = this;
			
			if(this.installPanelList.invoked) return ;
			this.installPanelList.invoked = true;
			
			// 通过代理触发点击事件的入口
			panelList.on("click","._MPL-NAME_" , function(e) {
				var target = e.target,id , type;
				if(!target) return ;
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				self.activeChat(id,type);
			});
		},
		
		/**
		 * 监听离线事件
		 */
		/**
		 * 监听离线事件
		 */
		installOffline : function(){
			var Data = this.Data , Memory = this.Memory, self = this;
			
			if(this.installOffline.invoked) return;
			this.installOffline.invoked = true;
			
			var execOffline = function(){
				self.setState("OFFLINE",true);				
				self.inactive();
				// 触发状态事件 STATE=400
				self.emit("state",{code:400 , user : Memory.getUser()});
			};

			Data.onOffline(function() {
				//判断是否真正离线
				Data.queryIsLogin(function(result,data){
					var user = Memory.getUser();
					if(result) {
						/**
						if(data.content.userid == user.userid) {
							// 存储用户
							Memory.setUser(data.content);
							self.emit("state",{code:250 , user : Memory.getUser()});
							Data.isReconnect = true;
							Data.queryLogin({userId:Memory.getUser().userid},function(result,data) {
								if(!result) {
									self.setState("OFFLINE",true);
									// 关闭状态
									if(Memory.isActive()) self.inactive();
									// 触发状态事件 STATE=400
									self.emit("state",{code:400 , user : Memory.getUser()});
								} else {
									self.setState("OFFLINE",false);
									// 激活消息系统
									if(!Memory.isActive()) self.active();
									// 触发状态事件 STATE=200
									self.emit("state",{code:200 , user : Memory.getUser()});
								}
							});
						} else {
							execOffline();
						}
						**/
						execOffline();
					} else {
						execOffline();
					}
				});
				
			});
		},
		
		/**
		 * 安装讨论组创建按钮事件
		 */
		installTalkCreate : function(){
			var View = this.View , Memory = this.Memory , panelCreateTalk = View.get("panelCreateTalk") , self = this , user;
			
			if(this.installTalkCreate.invoked) return ;
			this.installTalkCreate.invoked = true;
			
			user = Memory.getUser();
			
			panelCreateTalk.on("click" , function(){
				self.activeTalk(user.userid , 1);
			});
		},
		
		/**
		 * 重新加载
		 */
		reload : function(){
			var View = this.View, Data = this.Data , Memory = this.Memory , self = this , times , title;
			
			this.setState("OFFLINE",true);
			title = document.title;
			// 清空所有
			Memory.clearAll();
			// 清空数据
			Data.clear();
			
			// 删除对话面板
			View.get("chat").remove();
			// 删除讨论组面板
			View.get("talk").remove();
			View.get("message").remove();
			// 清理缓存
			View.clear();
			this.clearState();
			
			// 清空所有的事件监听
			this.removeEventListeners(function(name){
				return name != "state";
			});
			
			for(var key in this) {
				var func = this[key];
				if(typeof func === 'function' && !func.once) {
					func.invoked = undefined;
					func.installed = undefined;
				}
			}
			document.title = title;
			this.init();
		},
		
		/**
		 * 加载数据信息
		 */
		load : function() {
			var View = this.View,Data = this.Data,Memory = this.Memory, self = this,user;
			//判断是否处于活跃状态，否则执行关闭功能
			if(!Memory.isActive()) return this.inactive();
			
			if(this.load.invoked) return ;
			this.load.invoked = true;
			
			//从内存中获取好友信息
			user = Memory.getUser();
			/*
			 * 为加载好友和对话添加
			 */
			this.addEventListener("loadFriendTalk",function() {
				// 当好友和讨论组全部加载完之后做处理
				if(!!this.getState("LOAD-FRIEND") && !!this.getState("LOAD-TALK")) {
					
					// 加载最近联系人
					Data.queryRecent({userId:user.userid},function(result,data) {
						if( result ) {
							//保存到内存
							var relationship = Memory.saveRecent(data.content);
							// 渲染最近联系人
							View.get("panelRecent").append(View.renderRecentList(relationship.originalRecent));
							// 获取离线消息
							Data.queryOfflineMessage({userId:user.userid},function(result,data){
								if(result && data.content) {
									var groups = data.content.group;
									
									/*
									 * 讨论组 出现在 最近联系人以及讨论组列表中
									 * 通过class获取所有的讨论组对象，
									 * 其class结构为：ID(全局随机ID) + TALKID(讨论组ID) + 'TALKTIP'
									 */
									// 讨论组未读消息
									for(var key in groups) {
										var $group = jBud('.'+View.getBaseId()+key+'TALKTIP');
										$group.removeClass("_MHIDDEN_");
										
										var talk = Memory.getTalk(key);
										if(talk) talk.offlineCount = groups[key];
										
										$group.text(self.getMaxCount(groups[key]));
									}
									
									/*
									 * 联系人 出现在 最近联系人以及我的好友列表中
									 * 通过class获取所有的讨论组对象，
									 * 其class结构为：ID(全局随机ID) + FRIENDID(好友ID) + 'FRIENDTIP'
									 */
									// 好友未读消息
									var friends = data.content.person;
									for(var key in friends) {
										var $friend = jBud('.'+View.getBaseId()+key+'FRIENDTIP');
										$friend.removeClass("_MHIDDEN_");
										
										var friend = Memory.getFriend(key);
										if(friend) friend.offlineCount = friends[key];
 										
										$friend.text(self.getMaxCount(friends[key]));
									}
									
									self.installTalkCreate();
									/*
									 * 安装消息监听系统
									 */
									self.installMessage();
									// 为搜索绑定事件
									self.installSearch();
									
									// STATE=210
									self.emit("state",{code:210 , user : Memory.getUser()});
								}
							});
						}
					});
					
					// 清理该事件
					this.removeEventListener("loadFriendTalk",arguments.callee);
				} 
			});
			
			//查询好友列表
			Data.queryFriend({userId:user.userid},function(result,data) {
				if(result) {
					//将好友信息存储起来
					var relationship = Memory.saveRelationship(data.content);
					
					var panelFriend = View.get("panelFriend");
					// 如果成功获取，那么渲染好友列表
					panelFriend.append(View.renderFriendTree(relationship.originalFriend));
					
					// 为好友列表添加事件
					self.installFriend();
					//设置状态
					self.setState("LOAD-FRIEND",true);
					// 触发激活
					self.emit("loadFriendTalk");
				} else {
					self.setState("LOAD-FRIEND",false);
				}
			});
			
			// 查询讨论组列表
			Data.queryTalk({userId:user.userid},function(result,data){
				if(result) {
					// 将讨论组数据存储起来
					var relationship = Memory.saveTalk(data.content);
					
					var panelTalk = View.get("panelTalk");
					// 如果成功获取， 那么渲染讨论组列表
					panelTalk.append(View.renderTalkList(relationship.originalTalk));
					//设置状态
					self.setState("LOAD-TALK",true);
					// 触发激活
					self.emit("loadFriendTalk");
					
					/*
					 * 安装修改名称
					 */
					self.installTalkUpdate();
				} else {
					self.setState("LOAD-TALK",false);
				}
			});
		},
		
		/**
		 *  计算最大的消息计数
		 */
		getMaxCount : function(value) {
			if(value > 99) value = 99;
			return value;
		},
		
		/**
		 * 激活消息系统
		 */
		active : function() {
			var View = this.View,self = this , height , state;
			
			state = this.getState("OFFLINE");
			if(state) return ;
			
			this.setState("ACTIVED",true);
			// 修改状态 从 离线 改为 上线
			View.get("trayState").removeClass(View.style("TRAY_OFFLINE")).addClass(View.style("TRAY_ONLINE"));
			// 设置面板高度为0
			View.get("panel").height("0px").show();
			// 设置默认的一些属性值
			this.setProperties();
			// 计算面板实际高度
			height = this._panelHeight();
			// 执行展开动作
			View.get("panel").action({
				height:height
			},{
				complete:function() {
					self.resizePanel();
					self.installResize();
				}
			});
			// STATE=300
			this.emit("state",{code:300,width:View.get("message").outerWidth(true)});
		},
		
		/**
		 * 屏蔽消息系统
		 */
		inactive : function(keep) {
			var View = this.View , state;
			state = this.getState("OFFLINE");
			
			//修改状态 从 上线 改为 离线
			if(state) {
				View.get("trayState").removeClass(View.style("TRAY_ONLINE")).addClass(View.style("TRAY_OFFLINE"));
			}
			this.setState("ACTIVED",false);
			
			this.inactiveChat();
			this.inactiveTalk();
			if(!keep) this.showFlashTip(false);
			
			//执行展开动作
			View.get("panel").action({
				height:0
			},{
				complete:function(){
				}
			});
			// STATE=301
			this.emit("state",{code:301,width:View.get("message").outerWidth(true)});
		},
		
		/**
		 * 激活聊天，同时指定打开聊天内容，根据ID和类型
		 */
		activeChat : function( id , type ) {
			var Data = this.Data,View = this.View, chat = View.get("chat") , Memory = this.Memory , self = this , chatTitle , chatPanel , $title;
			
			// 如果不存在 聊天框，那么进行构建聊天框
			if(chat.length <= 0) {
				View.node("body").append(View.renderChatFramework());
				// 重新加载聊天框
				chat = View.reload("chat");
				// 设置聊天框的属性
				chat.css({
					opacity:0,
					right:"240px"
				});
			}
			
			// 安装对话框相关事件
			this.installChat();
			chat.show();
			// 执行动画效果
			chat.action({
				opacity:1,
				right:260
			},{queue:false});
			
			chatTitle = View.get("chatTitle") , chatPanel = View.get("chatPanel");
			
			if(type == 1) {
				var friend = Memory.getFriend(id), $friend, $friendPanel, friendId,friendPanelId;
				if(!friend) return ;
				 
				 friendId = "#"+View.getBaseId()+friend.userId+"CHAT-FRIEND-TITLE";
				 // 获得好友已经存在的节点
				 $friend = jBud(friendId);
				 if($friend.length <= 0) {
				 	$friend = Memory.getTemp(friendId);
				 	if($friend && $friend.length > 0) {
				 		chatTitle.prepend($friend);
				 	} else {
				 		chatTitle.prepend(View.renderChatTitleFriend(friend));
				 		$friend = jBud(friendId);
				 	}
				 }
				 
				 friendPanelId = "#"+View.getBaseId()+friend.userId+"CHAT-FRIEND-PANEL";
				 // 好友对话面板如上执行
				 
				 $friendPanel = jBud(friendPanelId);
				 
				 if($friendPanel.length <= 0) {
				 	$friendPanel = Memory.getTemp(friendPanelId);
				 	if($friendPanel && $friendPanel.length > 0) { 
				 		chatPanel.prepend($friendPanel) ;
				 	} else {
				 		chatPanel.prepend(View.renderChatPanelFriend(friend));
				 		$friendPanel = jBud(friendPanelId);
				 	}
				 }
				 
				 $title = $friend;
			} else if(type == 2) {
				var talk = Memory.getTalk(id),$talk,$talkPanel,talkId,talkPanelId;
				
				if(!talk) return ;
				
				talkId = "#"+View.getBaseId()+talk.g_id+"CHAT-TALK-TITLE";
				 // 获得讨论组已经存在的节点
				 $talk = jBud(talkId);
				 
				 // 如果讨论组节点不存在，那么进行构建
				 if($talk.length <= 0) {
				 	$talk = Memory.getTemp(talkId);
				 	if($talk && $talk.length > 0) {
				 		chatTitle.prepend($talk);
				 	} else {
				 		chatTitle.prepend(View.renderChatTitleTalk(talk));
				 		$talk = jBud(talkId);
				 	}
				 }
				 
				 // 实时更新TITLE
				 $talk.find("._MC-TAB-NAME_").text(talk.title);
				 
				 talkPanelId = "#"+View.getBaseId()+talk.g_id+"CHAT-TALK-PANEL";
				 // 讨论组面板如上执行
				 $talkPanel = jBud(talkPanelId);
				 
				 if($talkPanel.length <= 0) {
				 	$talkPanel = Memory.getTemp(talkPanelId);
				 	if($talkPanel && $talkPanel.length > 0) {
				 		chatPanel.prepend($talkPanel);
				 		if(talk.reload) {
				 			self.loadTalkMember(talk.g_id);
				 			talk.reload = false;
				 		}
				 	} else {
				 		// 如果不存在讨论组，那么进行渲染基础框架
				 		chatPanel.prepend(View.renderChatPanelTalk(talk));
				 		// 加载讨论组成员
				 		self.loadTalkMember(talk.g_id);
				 		$talkPanel = jBud(talkPanelId);
				 	}
				 }
				 $title = $talk;
			}
			
			// 计算整体宽度
			var chatPanelWidth = (chatPanel.children().length*700) + "px"; 
			chatPanel.width(chatPanelWidth);
			
			if(typeof id === 'undefined' || typeof type === 'undefined') return ;
			
			// 触发构建后的标题
			$title.find("._MC-TAB-NAME_").emit("click");
			
			// 安装上传图片的事件
			this.installChatImage( id , type );
			// 安装上传的文件事件
			if(type == 1)
				this.installChatAnnex( id , type );
			Memory.property({
				"CURRENT-CHAT":{id:id , type : type}
			});
		},
		
		/**
		 * 关闭聊天
		 */
		inactiveChat : function() {
			var Data = this.Data,View = this.View, chat = View.get("chat");
			if(chat.length <= 0) return ;
			
			chat.action({
				opacity:0,
				right : 240
			},{queue:false,complete:function(){
				chat.hide();
			}});
		},
		
		/**
		 *  监听消息
		 * 包括好友消息监听和讨论组消息监听
		 * 其逻辑都为
		 * 1. 如果对话窗口没有打开，那么存储到内存中，并同时将消息记录数归并到用户或者讨论组的提示处
		 * 2. 如果窗口已打开，那么输出到窗口中
		 */
		installMessage : function(){
			var View = this.View, Data = this.Data , Memory = this.Memory , self = this;
			
			/**
			 *  监听好友消息
			 */
			Data.onFriendMessage(function(data) {
				self.dispatch(data,1);
			});
			
			/**
			 *  监听讨论组消息
			 */
			Data.onTalkMessage(function(data){
				self.dispatch(data,2);
			});
		},
		
		/**
		 * 为搜索绑定事件
		 */
		installSearch : function() {
			var View = this.View , Memory = this.Memory , self = this , panelSearch, panelSearchResult , panelTop;
			
			if(this.installSearch.invoked) return ;
			this.installSearch.invoked = true;
			
			panelSearch = View.get("panelSearch") , panelSearchResult = View.get("panelSearchResult") , panelTop = View.get("panelTop");
			
			// 执行搜索
			var doSearch = function() {
				text = jBud.trim(panelSearch.val());
				if(text.length <= 0) {
					panelSearchResult.addClass("_MHIDDEN_");
					return ;
				}
				
				// 通过索引进行匹配
				results = Memory.matchIndexes(text);
				// 通过已有的值进行渲染
				panelSearchResult.html(View.renderSearch(results));
				// 显示搜索结果
				panelSearchResult.removeClass("_MHIDDEN_");
			};
			
			// 点击搜索触发事件
			panelTop.on("click","._MP-SEARCH-BUTTON_",function(e){
				doSearch();
			});
			
			// 回车进行搜索触发
			panelSearch.on("keydown" , function(e){
				var code = e.which;
				var $this = jBud(this) , text , results;
				
				switch(code){
					case 13:
						doSearch();
						break;
					case 27:
						$this.val("");
						doSearch();
						break;
					default:
						break;
				}
			});
			
			// 字符空表示关闭
			panelSearch.on("keyup",function(e) {
				var $this = jBud(this) , text;
				text = jBud.trim($this.val());
				if(text.length <= 0) {
					panelSearchResult.addClass("_MHIDDEN_");
					return ;
				}
			});
			
			// 点击搜索的结果页
			panelSearchResult.on("click","._MPL-NAME_",function(e){
				var target = e.target ,id , type;
				
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				
				// 激活对话框
				self.activeChat(id,type);
				
				// 隐藏搜索结果
				panelSearchResult.addClass("_MHIDDEN_");
			});
		},
		
		/**
		 *  消息调度
		 */
		dispatch : function(data, type) {
			var Memory = this.Memory , self = this , state;
			
			if(!data) return ;
			state = data.state;
			
			if (type == 1) {
				
				if(state == 2)
					self.chatFriendMessage(data);
				
			}  else if (type == 2) {
				
				if(state == 2)
					// 接受消息
					self.appendBubble(self.transferMessage(data,type));
				else if (state == 3)
					// 创建讨论组
					self.createTalkMessage(data);
				else if (state == 4)
					// 讨论组加入人员
					self.joinTalkMessage(data);
				else if (state == 5)
					// 讨论组修改名称
					self.updateTalkMessage(data);
				else if (state == 6)
					// 讨论组人员退出
					self.quitTalkMessage(data);
				else if (state == 1)
					//预留
					;
			}
		},
		
		/**
		 * 转换数据成为标准消息格式
		 */
		transferMessage : function(data , type) {
			var Memory = this.Memory, result;
			if(!data) return undefined;
			
			if(type == 1) {
				var toId = !data.is_self ? data.t_id : data.f_id;
				var fromId = !data.is_self ? data.f_id : data.t_id;
				var method = !data.is_self ? "PUSH" : "PULL";
				result = {
					type : type,
					id : toId,
					fromId : fromId,
					toId : toId,
					context : data.context,
					method : method,
					time : data.time
				};
			} else if ( type == 2 ) {
				var user = Memory.getUser();
				var method = user.userid == data.send_id ? "PUSH" : "PULL";
				result = {
					type : type,
					id : data.g_id,
					fromId : data.send_id,
					toId : data.g_id,
					context : data.context,
					method : method,
					time : data.time
				};
			} 
			
			return result;
		},
		
		/*
		 * 接受消息
		 */
		chatFriendMessage : function(data) {
			var View = this.View , Memory = this.Memory , target;
			target = this.transferMessage(data,1);
			// 保证好友正确性
			this.guaranteeFriend(target);
			// 追加冒泡
			this.appendBubble(target);
			// 修改好友状态
			this.turnFriendLine(target.id,target.method=='PULL');
		},
		
		/**
		 * 保证好友信息正确性
		 */
		guaranteeFriend : function(target) {
			var View = this.View , Memory = this.Memory , Data = this.Data , self = this , bid = View.getBaseId() , $treeRoot , friend , cache;
			
			// 目前只针对好友做处理
			if(!target || target.type != 1) return ;
			
			// 通过ID获得好友，如果存在，则返回
			friend = Memory.getFriend(target.id);
			if(friend) return ;
			
			// 将消息暂时保存到 消息缓存中
			Memory.pushMessageCache(target);
			
			// 由于无法获取到用户的分组，所以暂时放置在 我的好友 中
			$treeRoot = jBud("#"+bid+"panelTreeNode"+"ROOT");
			
			// 如果不存在，那么进行好友存储
			Data.queryFriendInfo({userId : target.id} , function(result,data) {
				if(result && data && data.content) {
					jBud.extend(data.content,target);
					
					// 从内存中获取消息
					var msg = Memory.pickMessageCache(target.id);
					data.content.online = true;
					data.content.message = msg || [];
					
					// 将当前好友信息进行保存
					Memory.saveFriend(data.content);
					
					// 渲染数据模型
					var html = View.renderFriend(data.content,{groupId:"ROOT"});
					$treeRoot.next().prepend(html);
					
					// 新增到最近联系人中
					self.prependRecent(target.id, 1);
					// 显示未读的消息数
					self.showUnknownMessage(target.id, 1);
				}
			});
		},
		
		/**
		 * 转换用户状态
		 */
		turnFriendLine : function(id,online) {
			var View = this.View , friends , friend , state;
			friends = jBud("."+View.getBaseId()+id+"FRIEND-ICON");
			friendItems = jBud("."+View.getBaseId()+id+"TREE-FRIEND");
			
			state = this.getState("FRIEND-ONLINE");
			
			if(online) {
				friends.removeClass("_OFFLINE_").addClass("_ONLINE_");
				friendItems.removeClass("_MPL-OFFLINE_");
			} else {
				friends.removeClass("_ONLINE_").addClass("_OFFLINE_");
				friendItems.addClass("_MPL-OFFLINE_");
			}

			friendItems.each(function(){
				var friend = jBud(this);
				if(friend.hasClass("_MPL-OFFLINE_")) {
					if(state) friend.hide();
				} else {
					friend.show();
				}
			});
		},
		
		/**
		 *  加载讨论组成员
		 */
		loadTalkMember : function(id) {
			var Data = this.Data , View = this.View , Memory = this.Memory , self = this;
	 		Data.queryTalkMember( {g_id : id} ,function(result, data){
	 			if(result) {
	 				// 进行成员渲染
	 				jBud("#"+View.getBaseId()+id+"CHAT-TALK-MEMBER-LIST").html(View.renderChatPanelTalkMember(data.content));
	 				var count = 0,list;
	 				if(data && data.content && (list = data.content.g_members)){
	 					count = list.length || 0;
	 				}
	 				jBud("#"+View.getBaseId()+id+"CHAT-TALK-MEMBER-COUNT").html(count);
	 				// 保存数据
	 				Memory.saveTalkMembers(id,list);
	 				// 处理延迟的冒泡数据
	 				self.activeDeferBubble(id);
	 			}
	 		});
		},
		
		/**
		 * 创建讨论组
		 */
		createTalkMessage : function(data) {
			var View = this.View , Memory = this.Memory , talk , user, $recent, $panelTalkList;
			if(!data) return ;
			
			$panelTalkList = View.get("panelTalkList");
			
			talk = Memory.getTalkOrSave(data);
			user = Memory.getUser();
			
			$panelTalkList.append(View.renderTalk(talk));
			this.prependRecent(data.g_id , 2);
			
			if(talk.owner == user.userid) {
				this.activeChat(data.g_id,2);
			}
		},
		
		/**
		 *  加入讨论组
		 */
		joinTalkMessage : function(data) {
			var View = this.View , Memory = this.Memory , talk , talkList,exist , $panelList;
			if(!data) return ;
			
			exist = Memory.existTalk(data.g_id);
			talk = Memory.getTalkOrSave(data);
			
			if(exist) {
				talkList = jBud("#"+View.getBaseId()+data.g_id+"CHAT-TALK-MEMBER-LIST");
				
				/*
				 * 如果当前面板存在，那么进行数据加载  
				 */
				if(talkList.length > 0) {
					this.loadTalkMember(data.g_id);
				} else {
					/*
					 * 否则标记，当再次打开需要重载数据
					 */
					talk.reload = true;
				}	
			} else {
				$panelTalkList = View.get("panelTalkList");
				
				$panelTalkList.append(View.renderTalk(talk));
				this.prependRecent(data.g_id , 2);
			}
		},
		
		/**
		 * 退出讨论组
		 */
		quitTalkMessage : function(data) {
			var View = this.View , Memory = this.Memory , bid = View.getBaseId() , user , $recent , $talk, $title, talkList,talkItem;
			
			if(!data) return ;
			user = Memory.getUser();
			
			if( user.userid == data.send_id ) {
				$recent = jBud("#"+bid+data.g_id+"RECENT-TALK");
				$talk = jBud("#"+bid+data.g_id+"PANEL-TALK");
				$title = jBud("#"+bid+data.g_id+"CHAT-TALK-TITLE");
				
				$recent.remove();
				$talk.remove();
				$title.find("._MC-TAB-CLOSE_").emit("click");
				
				Memory.removeTalk(data.g_id);
				Memory.removeTemp("#"+bid+data.g_id+"CHAT-TALK-TITLE");
			} else {
				talkItem = jBud("#"+View.getBaseId()+data.send_id+"CHAT-TALK-MEMBER-ITEM");
				talkList = jBud("#"+View.getBaseId()+data.g_id+"CHAT-TALK-MEMBER-LIST");
				
				talkItem.remove();
				
				Memory.removeTalkMember(data.g_id,data.send_id);
				
				/*
				 * 如果当前面板存在，那么进行数据加载  
				 */
				if(talkList.length > 0) {
					this.loadTalkMember(data.g_id);
				} else {
					/*
					 * 否则标记，当再次打开需要重载数据
					 */
					talk.reload = true;
				}
			}
		},
		
		/**
		 * 修改讨论组信息
		 */
		updateTalkMessage : function(data) {
			var View = this.View , Memory = this.Memory , bid = View.getBaseId() , $talkName , $talkTitle ,talk;
			
			if(!data) return ;
			user = Memory.getUser();
			
			// 将所有的名称进行更新
			$talkName = jBud("."+bid+data.g_id+"TALK-NAME").text(data.title);
			$talkTitle = jBud("#"+bid+data.g_id+"CHAT-TALK-TITLE");
			
			// 更新当前正在聊天的名称
			if($talkTitle) $talkTitle.find("._MC-TAB-NAME_").text(data.title);
			
			// 同步更新讨论组名称
			talk = Memory.getTalk(data.g_id);
			if(talk) talk.title = data.title;
		},
		
		/**
		 * 安装好友链表的触发事件
		 */
		installFriend : function() {
			var View = this.View,self = this, panelFriend = View.get("panelFriend"),panelFriendOnline = View.get("panelFriendOnline");
						
			if(this.installFriend.invoked) return ;
			this.installFriend.invoked = true;
			
			// 为标题绑定事件
			panelFriend.on("click",'._MPL-TREE-TITLE_',function(e) {
				var $target = jBud(e.target);
				$target.next().toggleClass("_MHIDDEN_");
				$target.toggleClass("_SELECTED_");
			});
			
			// 默认将第一个节点触发
			View.get("panelTreeNode","ROOT").emit("click");
			
			panelFriendOnline.on("click" , function(e) {
				var $this = jBud(this) , value = $this.prop("checked") , list ;
				list = panelFriend.find("._MPL-OFFLINE_");
				if(value) list.hide();
				else list.show();
				self.setState("FRIEND-ONLINE",value);
			});
			
			//self._installLockScroll(panelFriend[0]);
		},
		
		/**
		 * 更新讨论组名称修改
		 */
		installTalkUpdate : function() {
			var View = this.View , self = this , panelTalk;
			
			if(this.installTalkUpdate.invoked) return ;
			this.installTalkUpdate.invoked = true;
			
			panelTalk = View.get("panelTalk");
			
			/*
			 * 触发修改事件
			 */
			panelTalk.on("click","._MPL-EDIT_" , function(e) {
				var target = e.target , id , type , $target, $parent,$edit,$name;
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				
				$target = jBud(target) , $parent = $target.parent();
				$edit = $parent.children("._MPL-NAME-EDIT_");
				$name = $parent.children("._MPL-NAME_");
				
				$edit.removeClass("_MHIDDEN_");
				$name.hide();
				$edit.val($name.text());

				//jBud不支持focus，使用原生
				target.parentNode.childNodes[2].focus();
			});
			
			panelTalk.on("keydown","._MPL-NAME-EDIT_",function(e) {
				var target = e.target , id , type , $target , $text , orgName, newName;
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				
				$target = jBud(target) , $text = $target.prev();
				orgName = jBud.trim($text.text());
					
				if(e.which == 27) {
					$target.addClass("_MHIDDEN_");
					$text.show();
					return ;
				} else if (e.which == 13) {
					newName = jBud.trim($target.val());
					
					if(newName.length <= 0 || newName == orgName ) {
						$target.addClass("_MHIDDEN_");
						$text.show();
						return ;
					}
					
					if(newName.length > 10) {
						alert("讨论组名称不能超过10个字符！");
						return ;
					}
					
					/*
					 * 执行讨论组名称修改
					 */
					self.updateTalkTitle({id:id,title:newName},function(result) {
						if(result) {
							$target.addClass("_MHIDDEN_");
							$text.show();
						} else {
							alert("修改失败。");
						}
					});
				}
				
			});
		},
		
		/**
		 * 更新讨论组名称
		 */
		updateTalkTitle : function(data , callback) {
			var Data = this.Data , Memory = this.Memory , self = this , user;
			
			user = Memory.getUser();
			
			/*
			 * 修改标题
			 */
			Data.pushTalkUpdate({g_id:data.id, title : data.title , send_id :  user.userid} , function(data){
				if(data.flag) {
					self.dispatch(data,2);
				}
				if(jBud.isFunction(callback)) callback(data.flag);
			});
		},
		
		/**
		 *  安装对话框时间
		 */
		installChat : function() {
			var View = this.View, Memory = this.Memory, self = this, chatTitle, chatPanel;
			
			if(this.installChat.invoked) return ;
			this.installChat.invoked = true;
			
			/*
			 * 安装聊天面板关闭
			 */
			this._installChatClose();
			
			/*
			 * 安装TAB切换
			 */
			this._installChatTabSwitch();
			
			/*
			 * 安装TAB关闭
			 */
			this._installChatTabClose();
			
			/*
			 * 安装消息记录事件
			 */
			this._installChatRecord();
			
			/**
			 *  安装消息发送事件
			 */
			this._installChatPost();
			
			/**
			 * 安装讨论组创建或者添加成员功能
			 */
			this._installChatTalk();
			
			/*
			 * 安装退出讨论组
			 */
			this._installChatTalkQuit();
			
			/*
			 * 安装表情
			 */
			this._installChatFaces();
			
			/**
			 * 安装预览
			 */
			this._installChatPreview();
		},
		
		/**
		 * 私有方法
		 * 安装聊天面板关闭
		 */
		_installChatClose : function(){
			var View = this.View , self = this , chat;
			chat = View.get("chat");
			
			chat.on("click","._MBTN-WCLOSE_" , function(e){
				self.inactiveChat();
			});
			
			chat.on("click","._MBTN-WNARROW_" , function(e){
				self.inactiveChat();
			});
		},
		
		/*
		 * 私有方法
		 * 安装TAB切换
		 */
		_installChatTabSwitch : function() {
			var View = this.View, Memory = this.Memory, self = this, chatTitle, chatPanel;
			// 默认值移动700像素
			var move = -700;
			chatTitle = View.get("chatTitle") , chatPanel = View.get("chatPanel");
			
			// 为切换触发事件
			chatTitle.on("click","._MC-TAB-NAME_",function(e) {
				var target = e.target , id , type,$title, $panel , index , marginLeft, object;
				// 获得对应的数据结构
				id = target.getAttribute("data-id"), type = target.getAttribute("data-type");
				
				var tp = self.getChatTitleAndPanel(id,type);
				$title = tp.title, $panel = tp.panel;
				object = Memory.getObject(id,type);
				
				// 如果面板不存在则返回
				if(!$panel || (index = $panel.index()) < 0) return ;
				
				chatTitle.children("li").removeClass("_SELECTED_");
				$title.addClass("_SELECTED_");
				
				// 暂时取消读取 离线消息，避免发生二义性，使用在 消息记录 中出现提示框的形式
				/*
				if(object && !object.readOffline) {
					// 读取未读消息
					self.readOfflineMessage(id,type);
					object.readOffline = true;
				} else {
					self.clearOfflineMessage(id,type);
				}
				*/
				// 由于上述代码被注释，特此摘出 清理清理离线消息的控制
				self.clearOfflineMessage(id,type);
				
				/*
				 * 延迟渲染，这个只有在讨论组会出现这样的情况
				 * 由于在讨论组会出现不属于 自身好友的的情况
				 */
				if(type == 2) self.activeDeferBubble(id);
				
				/*
				 * 设定当前的聊天页签
				 */
				Memory.property({
					"CURRENT-CHAT" : {id : id , type : type}
				});
				
				/*
				 * 判断当前的页签是否已经超出的可视范围，
				 * 如果超出可视范围，那么进行移位
				 */
				var tabIndex = $title.index();
				var tabWidth = $title.outerWidth(true);
				var titleWidth = chatTitle.width();
				var tabSwap =(tabIndex+1)*tabWidth > (titleWidth);
				
				/*
				 * 判断是否要移形换位，如果发现标题不在可视区域内，那么执行换位
				 */
				if(tabSwap) {
					chatTitle.prepend($title);
					chatPanel.prepend($panel);
					/*
					 * 将对话面板前插，但是由于动画面板是可移动的
					 * 为了正确定位，需要判断当前面板位置是否在开始0点
					 * 否则进行移动
					 */
					chatPanel.css("marginLeft","0px");
					self.appendHistoryBubble(id,type);
					return;
				}
				
				// 计算要移动的距离
				marginLeft = index*move;
				
				// 对聊天面板执行移动
				chatPanel.action({
					marginLeft:marginLeft
				},{queue:false,complete:function(){
				}});
				
				// 追加历史消息内容
				self.appendHistoryBubble(id,type);
			});
		},
		
		/*
		 * 私有方法
		 * 安装TAB关闭
		 */
		_installChatTabClose : function() {
			var View = this.View, Memory = this.Memory, self = this, chatTitle, chatPanel;
			
			chatTitle = View.get("chatTitle") , chatPanel = View.get("chatPanel");
			/*
			 * 点击关闭的事件，实际是做了隐藏处理
			 */
			chatTitle.on("click","._MC-TAB-CLOSE_",function(e) {
				var target = e.target , id , type,$title, $panel , $around, chatTitle,titles , current;
				// 获得对应的数据结构
				id = target.getAttribute("data-id"), type = target.getAttribute("data-type");
				
				// 获得标题和内容的面板对象
				var tp = self.getChatTitleAndPanel(id,type);
				$title = tp.title, $panel = tp.panel;
				chatTitle = View.get("chatTitle");
				
				/*
				 * 判断当前节点如果被移除，应该锁定到哪一个节点当中
				 */
				$title.hasClass("_SELECTED_") ? 
					(($around = $title.next()).length > 0 || ($around = $title.prev()).length >0 || undefined) : 
					undefined;
				
				// 获得当前有效节点
				current = self.getProperty("CURRENT-CHAT");
				// 如果当前要关闭的节点 与 有效节点 不一致，那么触发节点 设置为 当前有效节点
				if(current && !(current.id == id && current.type == type)) {
					if(current.type == 1) {
						$around = jBud("#"+View.getBaseId()+current.id+"CHAT-FRIEND-TITLE");
					} else if (current.type == 2) {
						$around = jBud("#"+View.getBaseId()+current.id+"CHAT-TALK-TITLE");
					}
				}
				/*
				 * 将标题和内容移除，并缓存到内存当中，这样可以保证之前的信息能够被保留，不需要重新构建
				 */
				$title.remove();
				$panel.remove();
				Memory.pushTemp(tp.titleSelector,$title).pushTemp(tp.panelSelector,$panel);
				
				if((titles = chatTitle.children()).length == 1) {
					$around = jBud(titles[0]);
				}
				
				/*
				 * 如果存在周边触发目标，那么执行触发
				 */
				if(!!$around) $around.find("._MC-TAB-NAME_").emit("click");
				
				if(titles.length <= 0 ) { 
					self.inactiveChat();
					self.removeProperty("CURRENT-CHAT");
				}
			});
		},
		
		/**
		 * 私有方法
		 * 安装对话中的聊天记录事件
		 * 对于查询的处理，如果查询的页数在[1,最大页数]，那么正确执行
		 * 如果小于 1 ，那么执行1
		 * 如果大于最大页数，执行最大页数
		 */
		_installChatRecord : function(){
			var View = this.View, Memory = this.Memory, self = this, chatPanel;
			
			chatPanel = View.get("chatPanel");
			/*
			 * 绑定消息记录事件
			 */
			chatPanel.on("click",'._MTOOLS-RECORD_', function(e) {
				var target = e.target , id , type , $main , $record , $member, $target;
				id = target.getAttribute("data-id"), type = target.getAttribute("data-type");
				
				$target = jBud(target);
				
				if(type == 1) {
					$main = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-MAIN");
					$record = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-RECORD");
					$member = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-MEMBER");
				} else if (type == 2){
					$main = jBud("#"+View.getBaseId()+id+"CHAT-TALK-MAIN");
					$record = jBud("#"+View.getBaseId()+id+"CHAT-TALK-RECORD");
					$member = jBud("#"+View.getBaseId()+id+"CHAT-TALK-MEMBER");
				}
				
				if(type == 1)
					$main.toggleClass("_MCP-SHOWINFO_");
				$member.toggleClass("_MHIDDEN_");
				$record.toggleClass("_MHIDDEN_");
				$target.next().addClass("_MHIDDEN_");
				
				/*
				 * 读取历史消息
				 */
				if(!$record.hasClass("_MHIDDEN_")) 
					self.readHistoryMessage(id, type);
			});
			
			
			var getSearch = function( e) {
				var target  = e.target , parent, id , type , $text , $total;
				if(!target) return ;
				parent = target.parentNode;
				id = parent.getAttribute("data-id") , type = parent.getAttribute("data-type");
				
				if ( type == 1 ) {
					$text = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-RECORD-TEXT");
					$total = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-RECORD-TOTAL");
				} else if (type == 2) {
					$text = jBud("#"+View.getBaseId()+id+"CHAT-TALK-RECORD-TEXT");
					$total = jBud("#"+View.getBaseId()+id+"CHAT-TALK-RECORD-TOTAL");
				}
				
				return {id:id, type : type , pageNum : View.parseFloat($text.val()) , min : 1 , max : View.parseFloat($total.text())};
			};
			
			/**
			 *  安装上一页事件
			 */
			chatPanel.on("click","._MINFO-MSEARCH-LEFT_" , function(e) {
				var value = getSearch(e) , prev ; 
				prev = value.pageNum - 1;
				prev = prev < value.min ? value.min : prev;
				self.readHistoryMessage(value.id, value.type ,prev);
			});
			
			/**
			 *  安装下一页事件
			 */
			chatPanel.on("click","._MINFO-MSEARCH-RIGHT_" , function(e){
				var value = getSearch(e), next;
				next = value.pageNum + 1;
				next = next > value.max ? value.max : next;
				self.readHistoryMessage(value.id, value.type , next);
			});
			
			/**
			 *  安装当前事件
			 */
			chatPanel.on("keydown","._MINFO-MSEARCH-TEXT_" , function(e) {
				if(e.which != 13) return ;
				var value = getSearch(e) , index;
				index = value.pageNum;
				index = index < value.min ? value.min : index;
				index = index > value.max ? value.max : index;
				self.readHistoryMessage(value.id, value.type , index);
			});
		},
		
		/**
		 *  私有方法
		 * 安装消息发送
		 */
		_installChatPost : function(){
			var Data = this.Data,View = this.View, Memory = this.Memory, self = this, chatPanel,max;
			
			chatPanel = View.get("chatPanel");
			max = Data.getText("max");
			
			/*
			 * 为发送绑定事件
			 */
			chatPanel.on("click","._MPUBLISH-POST_",function(e) {
				var target = e.target , id , type , textId;
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				
				if(type == 1) {
					textId = "#"+View.getBaseId()+id+"CHAT-FRIEND-TEXT";
				} else if (type == 2) {
					textId = "#"+View.getBaseId()+id+"CHAT-TALK-TEXT";
				}
				
				self.pushMessage(textId);
			});
			
			/**
			 * 为输入框绑定事件
			 */
			chatPanel.on("keydown","._MPUBLISH-TEXT_",function(e) {
				
			    /*
			     * 判断掩码 是否为 CTRL+ENTER
			     */
			    if(!((typeof e.ctrlKey != 'undefined') ?
			            e.ctrlKey : e.modifiers & Event.CONTROL_MASK > 0)){
			        return false;
			    }
			    var whichCode = e.which || e.button;
			    
			    if(whichCode == 13) {
			    	self.pushMessage(e.target);
			    }
			});
			
			/*
			 * 为输入框构建最大输入限制
			 */
			chatPanel.on("keyup","._MPUBLISH-TEXT_",function(e) {
				var target = e.target , id , type , $target,text;
				
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				$target = jBud(target) , text = jBud.trim($target.val());
				
				if(type == 1) $tip = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-TEXT-TIP");
				else if (type == 2) $tip = jBud("#"+View.getBaseId()+id+"CHAT-TALK-TEXT-TIP");
				
				if($tip && max > 0) {
					if(text.length > max) {
						$tip.addClass("_OVERFLOW_").html("您已经超出"+(text.length-max)+"个字符。");
					} else {
						$tip.removeClass("_OVERFLOW_").html("您还能输入"+(max-text.length)+"个字符。");
					}
				}
			});
		},
		
		/**
		 * 读取历史消息
		 */
		readHistoryMessage : function( id , type , pageNum ) {
			var View = this.View, Data = this.Data , Memory = this.Memory , self = this, bid = View.getBaseId(), $recordList,$recordTotal,$recordText,user;
			
			if( type == 1 ) {
				$recordList = jBud("#"+bid+id+"CHAT-FRIEND-RECORD-LIST");
				$recordTotal = jBud("#"+bid+id+"CHAT-FRIEND-RECORD-TOTAL");
				$recordText = jBud("#"+bid+id+"CHAT-FRIEND-RECORD-TEXT");
			} else if ( type == 2 ) {
				$recordList = jBud("#"+bid+id+"CHAT-TALK-RECORD-LIST");
				$recordTotal = jBud("#"+bid+id+"CHAT-TALK-RECORD-TOTAL");
				$recordText = jBud("#"+bid+id+"CHAT-TALK-RECORD-TEXT");
			}
			
			if( $recordList.length <= 0 ) return ;
			
			user = Memory.getUser();
			if(typeof pageNum === 'undefined' ) {
				pageNum = View.parseFloat($recordText.val());
				if(pageNum === 0) pageNum = undefined;
			}
			
			if ( type == 1 ) {
				Data.queryHistoryMessageFriend( { userId : user.userid, t_id : id ,pageNum : pageNum } ,function( result, data ) {
					var record;
					if(result && data && (record = data.content)) {
						var list = record.message , datas = [], item;
						for( var i = 0 ; i < list.length ; i++ ) {
							item = list[i];
							item.is_self = !(user.userid == item.f_id);
							item.time = item.c_time;
							item = self.transferMessage(item, type);
							item = self.transferBubbleData(item, type);
							datas.push(item);
						}
						
						$recordList.html(View.renderRecordList(datas));
						$recordTotal.text(record.totalNum);
						$recordText.val(record.pageNum);
						
						delete data;
					}
				} );
			} else if ( type == 2 ) {
				Data.queryHistoryMessageTalk( { g_id : id  , pageNum : pageNum } , function(result , data) {
					var record ; 
					if(result && data && (record = data.content)) {
						var list = record.message , datas = [], item;
						for( var i = 0 ; i < list.length ; i++ ) {
							item = list[i];
							item.send_id = item.f_id;
							item.time = item.c_time;
							item = self.transferMessage(item, type);
							item = self.transferBubbleData(item, type);
							datas.push(item);
						}
						
						$recordList.html(View.renderRecordList(datas));
						$recordTotal.text(record.totalNum);
						$recordText.val(record.pageNum);
						
						delete data;
					}
				} );
			}
		},
		
		/**
		 * 读取离线消息
		 */
		readOfflineMessage : function(id, type){
			var View = this.View, Data = this.Data , Memory = this.Memory , self = this, user, object;
			
			user = Memory.getUser();
			object = Memory.getObject(id, type);
			if(type == 1) {
				Data.queryHistoryMessageFriend({userId:user.userid,t_id:id} , function(result,data){
					if(result && data && data.content) {
						var messages = data.content.message , count = View.parseFloat(object.offlineCount), start = count < messages.length ?  messages.length - count : 0;
						
						/*
						 * 消息一定要进行倒叙排布，否则时间错位
						 */
						messages = messages.slice(start).reverse();
						
						for( var i = 0;i<messages.length;i++ ){
							messages[i].is_self = !(user.userid == messages[i].f_id);
							messages[i].time = messages[i].c_time;
							// 向前插入
							self.prependBubble(self.transferMessage(messages[i],type));
						}
						
						// 执行清空离线消息记录
						self.clearOfflineMessage(id,type);
					}
				});
			} else if (type == 2) {
				Data.queryHistoryMessageTalk( { g_id : id } , function(result , data) {
					if(result && data && data.content) {
						var messages = data.content.message , count = View.parseFloat(object.offlineCount), start = count < messages.length ?  messages.length - count : 0;
						
						messages = messages.slice(start).reverse();
						
						for( var i = 0;i<messages.length;i++ ){
							messages[i].send_id = messages[i].f_id;
							messages[i].time = messages[i].c_time;
							self.prependBubble(self.transferMessage(messages[i],type));
						}
						
						// 执行清空离线消息记录
						self.clearOfflineMessage(id,type);
					}
				});
			}
		},
		
		/**
		 * 清空离线消息记录 
		 */
		clearOfflineMessage : function(id,type){
			var View = this.View, Data = this.Data, Memory = this.Memory, self = this, $tip, user , object;
			if(type == 1) {
				$tip = jBud("."+View.getBaseId()+id+"FRIENDTIP");
			} else if(type == 2) {
				$tip = jBud("."+View.getBaseId()+id+"TALKTIP");
			}
			$tip.addClass("_MHIDDEN_");
			
			/*
			 * 向服务器发送清空未读消息记录
			 */
			user = Memory.getUser();
			Data.pushClearOfflineMessage({type : type, send_id : user.userid, d_id:id});
			/*
			 * 将临时保存的离线消息数进行处理
			 */
			object = Memory.getObject(id, type);
			object.offlineCount = 0;
			
			this.showFlashTip(false);
		},
		
		/**
		 *  展示未读消息
		 */
		showUnknownMessage : function(id, type) {
			var View = this.View, Data = this.Data, Memory = this.Memory, self = this, $tip  , object;
			if(type == 1) {
				$tip = jBud("."+View.getBaseId()+id+"FRIENDTIP");
			} else if(type == 2) {
				$tip = jBud("."+View.getBaseId()+id+"TALKTIP");
			}
			
			$tip.removeClass("_MHIDDEN_");
			object = Memory.getObject(id,type);
			if(!object || !object.message) return ;
			var count = this.getMaxCount(object.message.length+View.parseFloat(object.offlineCount));
			$tip.text(count <= 0 ? "!"  : count);
			
			this.showFlashTip(true);
		},
		
		/**
		 * 展示闪烁的提示
		 */
		showFlashTip : function(flag) {
			var View = this.View, Data = this.Data, Memory = this.Memory, self = this , flash = true , $trayTip, timer;
			
			$trayTip = jBud("#"+View.getBaseId()+"trayTip");
			
			timer = this.showFlashTip.timer;
			
			if(!flag) {
				if(timer) clearInterval(timer);
				timer = this.showFlashTip.timer = undefined;
				$trayTip.text("");
				document.title = this.getProperty("TITLE");
				jBud("#_MPF-LATEST-TIP_").css("display", "none");
				
				return ;
			}
			callback = this.showFlashTip.callback;
			
			if(!callback) callback = this.showFlashTip.callback = function() {
				if(flash) {
					document.title = "【您有新消息】";
				} else {
					document.title = self.getProperty("TITLE");
				}
				$trayTip.text("【新消息】");
				jBud("#_MPF-LATEST-TIP_").css("display", "block");
				flash = !flash;
			};
			
			if(!timer) timer = this.showFlashTip.timer = setInterval(callback,1000);
		},
		
		/**
		 *  发送消息
		 * selector : text的选择器或者DOM对象，或者jBud对象
		 */
		pushMessage : function(selector) {
			var Data = this.Data , View = this.View, Memory = this.Memory, self = this, id , type, $text, text, $tip,max;
			
			max = Data.getText("max");
			
			if(jBud.isPlainObject(selector)) {
				id = selector.id , type = selector.type , text = selector.text;
			} else {
				$text = jBud(selector);
				
				if($text.length <= 0) return;
				// 获取相关的数据类型
				id = $text.attr("data-id") , type = $text.attr("data-type");
				
				if(type == 1) $tip = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-TEXT-TIP");
				else if (type == 2) $tip = jBud("#"+View.getBaseId()+id+"CHAT-TALK-TEXT-TIP");
				
				// 获得发送字符串
				text = jBud.trim($text.val());
				
				if(text.length <= 0) {
					$tip.html("难道没有什么要说的吗？");
					$text.val(text);
					return ;
				}
				
				if(max > 0 && text.length > max) {
					// #修改超出字符算出负数的BUG
					$tip.html("您已经超出"+(text.length-max)+"个字符。");
					return ;
				}
				
				$tip.html("");
				
				text = View.renderChatText(text);
			}
			// 获得当前用户
			user = Memory.getUser();
			
			// 如果用户失效，则返回
			if(!Memory.isActive()) return ;
			
			// 判断以什么类型进行发送消息
			if(type == 1) {
				Data.pushFriendMessage({userId:user.userid, toId : id , context : text} , function(data) {
					if(data.flag) {
						self.appendBubble({
							type : 1,
							id : id,
							fromId : user.userid,
							toId : id,
							context : text,
							method : "PUSH",
							time : data.time
						});
						self.turnFriendLine(id,data.online);
						if($text)
							$text.val("");
					} else {
						
					}
				});
			} else if(type == 2) {
				Data.pushTalkMessage({ send_id : user.userid, g_id : id , context : text }, function(data) {
					if( data.flag ) {
						self.appendBubble({
							type : 2,
							id : id,
							fromId : user.userid,
							toId : id,
							context : text,
							method : "PUSH",
							time : data.time
						});
						if($text)
							$text.val("");
					} else {
						
					}
				});
			}
		},
		
		/**
		 *  将数据转换为冒泡的数据格式
		 */
		transferBubbleData : function(data) {
			var Data = this.Data , View = this.View , Memory = this.Memory , id = data.id , method = data.method , type = data.type ,user;
			/*
			 * 如果是PUSH形式，表示自发送；PULL表示通过对方接收
			 * PUSH：获取自己的用户信息
			 * PULL：通过以保存的用户信息进行保存
			 * 对于PULL逻辑
			 * 1.如果存在该用户那么就构建消息泡
			 * 2.如果不存在，那么就临时构建该用户进行消息冒泡
			 */
			if(method == 'PUSH') {
				user = Memory.getUser();
				jBud.extend(data,{
					userName : user.username,
					nickName : user.nickname
				});
			} else if(method == 'PULL') {
				if(type == 1) {
					user = Memory.getFriend(data.id);
				} else if(type == 2) {
					user = Memory.getFriend(data.fromId);
					if(!user) {
						user = Memory.getTalkMember(data.id, data.fromId);
					}
				}
				/*
				 * 如果用户信息不存在，那么进行延迟加载，
				 * 主要针对群而言
				 */
				if(!user) {
					user = {userName : "", nickName:""};
					data.defer = true;
				}
				jBud.extend(data,{
					userName : user.userName,
					nickName : user.nickName
				});
			}
			
			// 根据内容和数据，转换表情
			data.context = View.parseFaces(data.context,Data.getFaceNames(),Data.getFace());
			
			return data;
		},
		
		/**
		 * 最近联系人 
		 */
		prependRecent : function(id, type){
			var View = this.View , Data = this.Data , Memory = this.Memory , panelRecentList , $recent , rid;
			
			panelRecentList = View.get("panelRecentList");
			
			if(type == 1) {
				rid = "#"+View.getBaseId()+id+"RECENT-FRIEND";
			} else if( type == 2) {
				rid = "#"+View.getBaseId()+id+"RECENT-TALK";
			}
			
			$recent = jBud(rid);
			
			/*
			 * 最新联系人排布顺序
			 */
			if($recent.length > 0) {
				panelRecentList.prepend($recent);
			} else {
				// 如果不存在，那么就进行构造渲染最近联系人数据
				var html = '';
				if(type == 1) html = View.renderFriend(Memory.getFriend(id),'RECENT');
				else if(type == 2) html = View.renderTalk(Memory.getTalk(id),'RECENT');
				panelRecentList.prepend(html);
			}
			/*
			 * 如果超出了10个限制，那么就进行删除
			 */
			var recentList = panelRecentList.children();
			var recentMax = Data.getRecent("max");
			if(recentList.length > recentMax) {
				for(var i = recentMax;i<recentList.length;i++) {
					jBud(recentList[i]).remove();
				}
			}
		},
		
		/**
		 *  为聊天面板添加 对话泡
		 */
		appendBubble : function(data) {
			var Data = this.Data, View = this.View, Memory = this.Memory, self = this, id = data.id , type = data.type, method = data.method, $bubble,$content,$chat, user,current,display;
			
			
			if(type == 1) {
				$bubble = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-BUBBLE");
				$content = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-CONTENT");
			} else if (type == 2) {
				$bubble = jBud("#"+View.getBaseId()+id+"CHAT-TALK-BUBBLE");
				$content = jBud("#"+View.getBaseId()+id+"CHAT-TALK-CONTENT");
			}
			
			$chat = View.get("chat"), display = $chat.css("display");
			
			this.prependRecent(id, type);
					
			if($bubble.length <= 0 || display == 'none') {
				Memory.saveMessage(data);
				this.showUnknownMessage(id, type);
				return ;
			}
			
			current = this.getProperty("CURRENT-CHAT");
			
			if(current && !(current.id == id && current.type == type)) {
				this.showUnknownMessage(id, type);
			}
			
			data = this.transferBubbleData(data);
			// 将数据渲染成消息泡并追加
			$bubble.append(View.renderChatBubble(data));
			$content.scrollTop($bubble.height());
		},
		
		/**
		 *  向前插入数据
		 */
		prependBubble : function(data) {
			var View = this.View , id = data.id , type = data.type ,$bubble , $content;
			if(type == 1) {
				$bubble = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-BUBBLE");
				$content = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-CONTENT");
			} else if (type == 2) {
				$bubble = jBud("#"+View.getBaseId()+id+"CHAT-TALK-BUBBLE");
				$content = jBud("#"+View.getBaseId()+id+"CHAT-TALK-CONTENT");
			}
			
			if($bubble.length <= 0) return ; 
			
			data = this.transferBubbleData(data);
			
			// 将数据渲染成消息泡并追加
			$bubble.prepend(View.renderChatBubble(data));
			$content.scrollTop($bubble.height());
		},
		
		/**
		 *  加载历史消息泡
		 */
		appendHistoryBubble : function(id,type) {
			var Memory = this.Memory , View = this.View, data, item, message;
			if(type == 1) item = Memory.getFriend(id);
			else if(type == 2) item = Memory.getTalk(id);
			if(!item) return ;
			data = item.message;
			while((message = data.shift())){
				this.appendBubble(message);
			}
		},
		
		/**
		 * 激活冒泡延迟
		 */
		activeDeferBubble : function (id) {
			var View = this.View, Memory = this.Memory , talks, members;
			talks = Memory.getTalk(id);
			if(!talks || !(members = talks.members)) return ;
			
			for(var key in members) {
				var friend = members[key];
				jBud("."+View.getBaseId()+"2"+friend.userId+"BUBBLE-DEFER-NAME").html(friend.nickName);
				jBud("."+View.getBaseId()+"2"+friend.userId+"BUBBLE-DEFER-HEAD").attr("src",View.getHead().small + friend.userName);
			}
		},
		
		/**
		 *  私有方法
		 * 安装创建讨论组或添加成员
		 */
		_installChatTalk : function() {
			var View = this.View, Data = this.Data, self = this, chatPanel;
			
			 chatPanel = View.get("chatPanel");
			 
			 chatPanel.on("click","._MTOOLS-TALK_",function( e ){
			 	var target = e.target , id , type;
			 	
			 	id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
			 	
			 	self.activeTalk(id, type);
			 });
		},
		
		/**
		 *  安装退出讨论组
		 */
		_installChatTalkQuit : function() {
			var View = this.View, self = this , chatPanel;
			
			chatPanel = View.get("chatPanel");
			
			chatPanel.on("click" , "._MTOOLS-TALK-QUIT_" , function( e ){
				var target = e.target , id , type;
				
				id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
				
				self.quitTalk(id,type);
			});
		},
		
		/**
		 * 退出讨论组 
		 */
		quitTalk : function(id , type) {
			var Data = this.Data , Memory = this.Memory , self = this, user , talk ;
			
			talk = Memory.getTalk(id);
			user  = Memory.getUser();
			
			if(confirm("确定要退出\""+talk.title+"\"讨论组吗？")) {
				Data.pushTalkQuit( {g_id:id , userId : user.userid , exitId : user.userid} , function(data) {
					if(data.flag)
						self.dispatch(data,2);
					else 
						alert("操作失败，"+data.desc);
				} );
			}
		},
		
			
		/**
		 * 安装表情
		 */
		_installChatFaces : function(){
			var View = this.View , Data = this.Data , self = this , chatPanel;
			
			 chatPanel = View.get("chatPanel");
			 
			 // 点击表情，进行渲染
			 chatPanel.on("click","._MTOOLS-FACE_", function(e) {
			 	var target = e.target , id , type, $target , $face , rendered;
			 	id = target.getAttribute("data-id") , type = target.getAttribute("data-type");
			 	$target = jBud(target) , $face = $target.next();
			 	
			 	rendered = $face.attr("rendered");
			 	
			 	if(rendered != "true") {
			 		$face.attr("rendered","true");
			 		$face.html(View.renderChatFaces(Data.getFaceNames(),Data.getFace(),id , type));
			 	}
			 	$face.toggleClass("_MHIDDEN_");
			 });
			 
			 // 表情添加
			 chatPanel.on("click","._MFACE-ITEM_",function(e){
			 	var target = e.target , id , type,face,$text,$face;
			 	id = target.getAttribute("data-id") , type = target.getAttribute("data-type") , face = target.getAttribute("data-face");
			 	
			 	$face = jBud("#"+View.getBaseId()+id+type+"FACES-LAYER");
			 	
			 	if(type == 1) $text = jBud("#"+View.getBaseId()+id+"CHAT-FRIEND-TEXT");
			 	else if (type == 2) $text = jBud("#"+View.getBaseId()+id+"CHAT-TALK-TEXT");
			 	
			 	if(!$text || $text.length <= 0) return ;
			 	
			 	View.renderLightToText($text[0],View.renderFaceFlag(face));
			 	$face.addClass("_MHIDDEN_");
			 });
			 
			 // 隐藏表情
			 chatPanel.on("click","._MPUBLISH-TEXT_",function(e) {
			 	var target = e.target , id , type,$face;
			 	id = target.getAttribute("data-id") , type = target.getAttribute("data-type")
			 	$face =jBud("#"+View.getBaseId()+id+type+"FACES-LAYER");
			 	$face.addClass("_MHIDDEN_");
			 });
		},
		
		/**
		 * 安装预览
		 */
		_installChatPreview : function() {
			var View = this.View, self = this , chatPanel;
			
			 chatPanel = View.get("chatPanel");
			 
			 chatPanel.on("click","._MPREVIEW-IMAGE_",function(e) {
			 	var target = e.target;
			 	self.showPreviewImage({
			 		src : target.src,
			 		title : target.getAttribute("title")
			 	});
			 });
		},
		
		/**
		 * 图片预览
		 */
		showPreviewImage : function(data) {
			var View = this.View , preview , previewContent , previewImage, img , win ,width,height , maxWidth , maxHeight;
			
			preview = View.get("preview");
			win = jBud(window) , width = win.width() , height = win.height();
			maxWidth = width * 0.8 , maxHeight = height * 0.8;
			if(preview.length <= 0) {
				View.node("body").append(View.renderPreview());
				preview = View.reload("preview");
			}
			
			previewContent = View.get("previewContent") , previewImage = View.reload("previewImage");
			if(previewImage.length > 0) {
				previewImage.remove();
			}
			
			
			preview.show();
			preview.width(win.width()+"px");
			preview.height(win.height()+"px");
			
			img = new Image();
			img.title = data.title;
			img.src = data.src;
			img.id = View.getBaseId()+"previewImage";
			
			var doResizeImage = function(){
				var imgWidth = img.width , imgHeight = img.height , cWidth = preview.width() , cHeight = preview.height();
				if(imgWidth > maxWidth) {
					 imgHeight = Math.floor(imgHeight * (maxWidth / imgWidth)) , imgWidth = maxWidth;
				}
				
				if(imgHeight > maxHeight) {
					imgWidth = Math.floor(imgWidth * (maxHeight / imgHeight)) , imgHeight = maxHeight ;
				}
				
				img.width = imgWidth , img.height = imgHeight;
				
				previewContent.css({
					left : (cWidth-imgWidth)+"px",
					top : (cHeight-imgHeight)/2 + "px",
					opacity:0
				});
				
				previewContent.action({
					left : (cWidth-imgWidth)/2,
					top : (cHeight - imgHeight)/2,
					opacity:1
				},{
					queue:false,
					duration:400
				});
			};
			
			if(img.readyState == 'complete') {
				doResizeImage();
			} else {
				img.onload = function() {
					doResizeImage();
				};
			}
			
			previewContent.prepend(img);
			preview.css("opacity",0);
			preview.action({
				opacity:1
			},{
				duration:800,
				queue:false
			});
			this.installPreviewImage();
		},
		
		/**
		 * 关闭预览
		 */
		closePreviewImage : function(){
			var View = this.View , preview , previewContent;
			
			preview = View.get("preview");
			previewContent = View.get("previewContent");
			
			previewContent.action({
				left : 0,
				opacity : 0
			},{
				queue:false,
				duration:800,
				complete : function(){
					preview.hide();
				}
			});
			preview.action({
				opacity : 0
			},{queue:false,duration:800});
		},
		
		/**
		 * 安装图片预览事件
		 */
		installPreviewImage : function() {
			var View = this.View, self = this , preview , previewContent;
			
			if(this.installPreviewImage.invoked ) return ;
			this.installPreviewImage.invoked = true;
			
			preview = View.get("preview");
			previewContent = View.get("previewContent");
			
			preview.on("click","._MPREVIEW-CLOSE_",function(e) {
				self.closePreviewImage();
			});
			
			preview.on("click",function(e){
				self.closePreviewImage();
				e.stopPropagation();
			});
			
			jBud(window).on("resize",function(){
				var $window = jBud(this) , width = $window.width() , height = $window.height();
				cWidth = previewContent.width(), cHeight = previewContent.height();
				
				preview.width(width+"px");
				preview.height(height+"px");
				
				previewContent.action({
					left : (width - cWidth)/2,
					top : (height - cHeight)/2
				},{
					queue:false,
					duration:800
				});
			});
			
		},
		
		/**
		 * 安装图片
		 */
		installChatImage : function(id,type) { 
			var View = this.View, Data = this.Data , bid = View.getBaseId() , self = this, targetId, installed;
			
			installed = this.installChatImage.installed;
			if(!installed) installed = this.installChatImage.installed = {};
			if(installed[id+"-"+type]) return ;
			installed[id+'-'+type] = true;
			
			targetId = bid+id+type+"CHAT-IMAGE-UPLOAD";
			tipId = "#"+bid+id+type+"CHAT-UPLOAD-TIP";
			// 渲染图片上传组件
			View.renderImageUpload({
				uploadUrl : Data.getUpload(),
				flashUrl : Data.getSWFUpload(),
				targetId : targetId,
				callback : function(code , data ) {
					if(code == 200) {
						if(data.code == 200 || data.flag ) {
							self.pushMessage({
								id:id,type:type,text:'<img src="'+data.url+'" alt="'+data.fileName+'" title="'+data.fileName+'" class="_MPREVIEW-IMAGE_"/>'
							});
						} else {
							alert(data.description || data.desc);
						}
						jBud(tipId).addClass("_MHIDDEN_");
					} else if (code == 201) { 
						jBud(tipId).removeClass("_MHIDDEN_").text(data);
					} else  {
						jBud(tipId).addClass("_MHIDDEN_");
						alert(data);
					}
				}
			});
		},
		
		/**
		 * 安装图片
		 */
		installChatAnnex : function(id,type) { 
			var View = this.View, Data = this.Data , bid = View.getBaseId() , self = this, targetId, installed ,tipId;
			
			installed = this.installChatAnnex.installed;
			if(!installed) installed = this.installChatAnnex.installed = {};
			if(installed[id+"-"+type]) return ;
			installed[id+'-'+type] = true;
			
			targetId = bid+id+type+"CHAT-ANNEX-UPLOAD";
			tipId = "#"+bid+id+type+"CHAT-UPLOAD-TIP";
			View.renderAnnexUpload({
				uploadUrl : Data.getUpload(),
				flashUrl : Data.getSWFUpload(),
				targetId : targetId,
				callback : function(code , data ) {
					if(code == 200) {
						if(data.code == 200 || data.flag ) {
							self.pushMessage({
								id:id,type:type,text:'<a href="'+data.url+'" target="_blank">点击下载"'+data.fileName+'"</a>'
							});
						} else {
							alert(data.description || data.desc);
						}
						jBud(tipId).addClass("_MHIDDEN_");
					} else if (code == 201) {
						console.log("there");
						jBud(tipId).removeClass("_MHIDDEN_").text(data);
					} else {
						alert(data);
						jBud(tipId).addClass("_MHIDDEN_");
					}
				}
			});
		},
		
		/**
		 * 激活讨论组的创建
		 */
		activeTalk : function(id, type) {
			var View = this.View , Data = this.Data , Memory = this.Memory , talk;
			
			talk = View.get("talk");
			
			if( talk.length <= 0) {
				View.node("body").append(View.renderTalkFramework());
				// 重新加载聊天框
				talk = View.reload("talk");
				// 设置聊天框的属性
				talk.css({
					opacity:0,
					right:"240px"
				});
			}
			
			// 安装事件
			this.installTalk();
			talk.show();
			// 执行动画效果
			talk.action({
				opacity:1,
				right:365
			},{queue:false});
			
			if(typeof id === 'undefined' || typeof type === 'undefined') return ;
			// 对树进行渲染
			this.buildTalkTree(id , type);
		},
		
		/**
		 * 构建讨论组树
		 */
		buildTalkTree : function(id , type) {
			var View = this.View , Data = this.Data , Memory = this.Memory , talkTemp, talk , talkTree , talkMax , talkName , talkTitle , build , user , $talk , $friends,$id, $type;
			
			talk = View.get("talk");
			if(talk.length <= 0) return ;
			
			/**
			 * 构建树，判断是否需要重构
			 * 如果在某个时刻好友的数据发生了变化，那么需要将talk中的data-build修改为true
			 */
			talkTree = View.get("talkTree") , 	build = talk.attr("data-build"), $id = talk.attr("data-id"), $type = talk.attr("data-type");
			
			if(build == 'true') {
				talkTree.html(View.renderTalkTree(Memory));
				talk.attr("data-build",false);
			}
			
			/*
			 * 最大人员数量
			 */
			talkMax = View.get("talkMax");
			talkMax.text(Data.getTalk("max"));
			
			/*
			 * 判断是否为上一个已经打开的窗口，如果不是，那么认为新窗口，那么清空所有的数据
			 */
			if(!($id == id && $type == type)) {
				this.clearTalkFriend();
			}
			
			/*
			 * 为临时的窗口设定数据
			 */
			talk.attr({
				"data-id" : id,
				"data-type" : type
			});
			
			/*
			 * 窗口的标题
			 */
			talkTitle = View.get("talkTitle");
			talkTitle.text("创建讨论组");
			
			/*
			 * 讨论组名称
			 */
			talkName = View.get("talkName");
			talkName.val("").removeAttr("readonly");
			
			/*
			 * 获取到当前用户和临时讨论组数据
			 */
			user = Memory.getUser();
			talkTemp = Memory.getTalkTemp();
			
			/*
			 * 将自己推送到已选项，并且不可删除
			 */
			this.pushTalkFriend("SELF",type,true);
			
			/*
			 * 如果类型为1，那么将现有的用户推送到已选项中
			 */
			if(type == 1) {
				this.pushTalkFriend(id,type);
			} else if (type == 2) {
				/*
				 * 如果类型为2 ，那么标题修改为修改讨论组
				 * 如果讨论组存在，那么读取讨论组数据，并且不可修改名称，同时推送已选好友
				 */
				talkTitle.text("添加讨论组成员");
				
				$talk = Memory.getTalk(id);
				if($talk) {
					talkTemp.name = $talk.title , talkTemp.id = $talk.g_id;
					talkName.val($talk.title);
					talkName.attr("readonly","readonly");
					$friends = $talk.members;
					if($friends) {
						for(var key in $friends ){
							this.pushTalkFriend({talkId:id,friendId:key},type,true);
						}
					}
				}
			}
		},
		
		/**
		 * 禁用创建讨论组
		 */
		inactiveTalk : function() {
			var View = this.View , self = this , talk;
			talk = View.get("talk");
			if(talk.length <= 0) return ;
			
			talk.action({
				opacity:0,
				right : 240
			},{queue:false,complete:function(){
				talk.hide();
			}});
		},
		
		/**
		 * 安装创建讨论组事件
		 */
		installTalk : function() {
			var View = this.View , Memory = this.Memory , self = this , talk;
			
			if(this.installTalk.invoked) return ;
			this.installTalk.invoked = true;
			
			talk = View.get("talk");
			
			// 关闭窗口
			talk.on("click","._MTOOLS-CLOSE_" , function(e) {
				// 执行禁用讨论组
				self.inactiveTalk();
			});
			
			// 触发树事件
			talk.on("click","._MTG-TREE-TITLE_", function(e){
				var target = e.target , $target = jBud(target);
				$target.toggleClass("_SELECTED_");
				$target.next().toggleClass("_MHIDDEN_");
			});
			
			// 安装选择好友
			talk.on("click","._MTOOLS-USER_", function(e){
				var target = e.target, id ;
				id = target.getAttribute("data-id");
				self.pushTalkFriend(id,1);
			});
			
			// 安装删除已选好友
			talk.on("click" , "._MTOOLS-REMOVE_" , function(e){
				var target = e.target;
				id = target.getAttribute("data-id");
				self.removeTalkFriend(id);
			});
			
			// 安装推送整个分组
			talk.on("click","._MTOOLS-GROUP_" , function(e) {
				var target = e.target , id , group , friends;
				id = target.getAttribute("data-id");
				group = Memory.getGroup(id);
				if(!group || !(friends = group.users)) return ;
				
				for(var i = 0 ;i < friends.length ;i ++){
					self.pushTalkFriend(friends[i],1);
				}
			});
			
			// 安装讨论组创建提交
			talk.on("click","._MTOOLS-SUBMIT_" , function(e) {
				self.submitTalkFriend();
			});
		},
		
		/**
		 * 清空所选的所有的内容
		 */
		clearTalkFriend : function() {
			var View = this.View , Memory = this.Memory , talkPool;
			talkPool = View.get("talkPool");
			jBud("._MTG-LIST-ITEM_").removeClass("_SELECTED");
			talkPool.empty();
			Memory.clearTalkTemp();
		},
		
		/**
		 * 将选择好友推送到已选列表中
		 */
		pushTalkFriend : function(id,type,fixed) {
			var View = this.View , Data = this.Data, Memory = this.Memory , talkPool , talkSelected , friend , talkTemp;
			
			talkPool = View.get("talkPool") , friend;
			if(id == "SELF") {
				 friend = Memory.getUser();
			} else {
				if(type == 1) {
					 friend = Memory.getFriend(id);
				} else if (type == 2) {
					friend = Memory.getFriend(id.friendId);
					if(!friend) {
						friend = Memory.getTalkMember(id.talkId, id.friendId);
					}
				}
			}
			
			if(talkPool.length<=0 || !friend) return ;
			
			if(id == 'SELF') {
				jBud.extend(friend, {
					userName : friend.username,
					nickName : friend.nickname,
					userId : friend.userid
				});
			}
			
			talkTemp = Memory.getTalkTemp();
			if(!Memory.existTalkTempFriend(friend.userId)) {
				if(talkTemp.length >= Data.getTalk("max")) {
					alert("讨论组人数已经达到上限");
					return ;
				}
				talkPool.append(View.renderTalkPoolItem(friend,!!fixed));
				Memory.pushTalkTempFriend(friend.userId,!!fixed);
				jBud("."+View.getBaseId()+friend.userId+"TALK-USER").addClass("_SELECTED_");
			}
			
			talkSelected = View.get("talkSelected");
			talkSelected.text(talkTemp.length);
		},
		
		/**
		 * 删除已选择的好友
		 */
		removeTalkFriend : function(id) {
			var View = this.View , Memory = this.Memory , bid = View.getBaseId() , talkSelected, talkTemp;
			
			jBud("#"+bid+id+"TALK-POOL").remove();
			jBud("."+bid+id+"TALK-USER").removeClass("_SELECTED_");
			Memory.removeTalkTempFriend(id);
			
			talkTemp = Memory.getTalkTemp();
			talkSelected = View.get("talkSelected");
			talkSelected.text(talkTemp.length);
		},
		
		/**
		 * 提交创建组
		 */
		submitTalkFriend : function() {
			var View =this.View , Memory = this.Memory , Data = this.Data , self = this , bid = View.getBaseId() , talkTemp , talkName,name , user, joinIds;
			talkTemp = Memory.getTalkTemp() , talkName = View.get("talkName");
			
			name = jBud.trim(talkName.val());
			user = Memory.getUser();
			
			if(!talkTemp) return ;
			
			joinIds = [];
			for(var k in talkTemp.friends){
				joinIds.push({id:k});
			}
			
			if(typeof talkTemp.id === 'undefined') {
				if(name.length <= 0 ) {
					talkName.emit("focus");
					alert("请填写讨论组名称");
					return ;
				} else if (name.length > 10) {
					alert("讨论组名字不能超过10个字符");
					return ;
				}
				talkTemp.name = name;
				
				Data.pushTalkCreate( {send_id:user.userid, title : talkTemp.name , join_ids:joinIds } , function(data) {
					if(data.flag) {
						self.dispatch(data,2);
						self.inactiveTalk();
					} else {
						alert("操作失败，"+data.desc);
					}
				} );
				
			} else {
				Data.pushTalkJoin( {g_id : talkTemp.id , send_id :user.userid , join_ids : joinIds} ,function(data){
					if(data.flag) {
						self.dispatch(data,2);
						self.inactiveTalk();
					} else {
						alert("操作失败，"+data.desc);
					}
				} );
			}
		},
		
		/**
		 *  获得聊天中的标题和面板
		 */
		getChatTitleAndPanel : function(id,type) {
			var View = this.View,$title,$panel,$titleSelector,$panelSelector;
			if(type == 1) {
				$titleSelector = "#"+View.getBaseId()+id+"CHAT-FRIEND-TITLE";
				$panelSelector = "#"+View.getBaseId()+id+"CHAT-FRIEND-PANEL";
			} else if(type == 2){
				$titleSelector = "#"+View.getBaseId()+id+"CHAT-TALK-TITLE";
				$panelSelector = "#"+View.getBaseId()+id+"CHAT-TALK-PANEL";
			}
			$title = jBud($titleSelector), $panel = jBud($panelSelector);
			return {title:$title,panel:$panel,titleSelector : $titleSelector, panelSelector : $panelSelector};
		},
		
		/**
		 * 重新计算 PANEL 高度
		 */
		installResize : function() {
			var View = this.View , self = this;
			
			// 防止重复被调用
			this.installResize.once = true;
			if(this.installResize.invoked) return ;
			this.installResize.invoked = true;
			
			// 为window绑定变化窗口时处理操作
			View.node(window).on("resize",function(){
				var state = self.getState("ACTIVED");
				if(state)
					self.resizePanel();
			});
		},
		
		/**
		 * 重新计算面板中的高度值
		 */
		resizePanel : function(){
			var View = this.View;
			// 重新计算高度
			var height = this._panelHeight(), 
				contentHeight = height-this.getProperty("panelTitleHeight") - this.getProperty("panelContentBorder"),
				listHeight = contentHeight - this.getProperty("panelTopHeight") - this.getProperty("panelFuncHeight")-5,
				searchHeight = listHeight + this.getProperty("panelFuncHeight");
			View.get("panelContent").height(contentHeight+"px");
			View.get("panelList").children("li").height(listHeight+"px");
			View.get("panelSearchResult").height(searchHeight+"px");
			View.get("panel").action({
				height:height
			},{queue:false});
		},
		
		/**
		 * 私有方法
		 * 获取面板的实际高度
		 */
		_panelHeight : function(){
			var View = this.View, win = View.node(window), message = View.get("message"), tray = View.get("tray"), result;
			result =  View.parseFloat(win.height()) - this.getProperty("trayHeight") - this.getProperty("messageBorder");
			return result; 
		},
		
		/**
		 * 设置固有属性
		 */
		setProperties : function() {
			var View = this.View , Memory = this.Memory,tray = View.get("tray"), message = View.get("message"), 
				panelTitle = View.get("panelTitle"), panelTop = View.get("panelTop") , panelFunc = View.get("panelFunc");
			Memory.property({
				"trayHeight" : View.parseFloat(tray.outerHeight(true)),
				"messageBorder" :  View.parseFloat(message.borderHeight()),
				"panelTitleHeight" : View.parseFloat(panelTitle.outerHeight(true)) + View.parseFloat(panelTitle.borderHeight()),
				"panelContentBorder" : View.parseFloat(View.get("panelContent").borderHeight()),
				"panelTopHeight" : View.parseFloat(panelTop.outerHeight(true)) + View.parseFloat(panelTop.borderHeight()),
				"panelFuncHeight" : View.parseFloat(panelFunc.outerHeight(true)) + View.parseFloat(panelFunc.borderHeight())
			});
		},
		
		/**
		 * 获取属性值
		 */
		getProperty : function(key) {
			var Memory = this.Memory;
			return Memory.property(key) || 0;
		},
		
		/*
		 * 删除属性
		 */
		removeProperty : function(key){
			var Memory = this.Memory;
			Memory.removeProperties(key);
		},
		
		/**
		 * 设置状态
		 */
		setState : function(key,value){
			this.state[key] = value;
		},
		
		/**
		 * 获得状态
		 */
		getState : function(key) {
			return this.state[key];
		},
		
		clearState : function() {
			delete this.state;
			this.state = {};
		}
 	});
	
	/**
	 * 内存对象，专门存储数据对象
	 */
	var Memory = function() {
		/*
		 * 当前用户数据对象
		 */
		this.user = {
				nickname:undefined,
				userid:undefined,
				username:undefined
		};
		
		/*
		 * 好友数据结构
		 * {
		 * 		groups:{
		 * 			id : {
		 * 				name:"", users : []
		 * 			}
		 * 		},
		 * 		friends:{
		 * 			id : {
		 * 				nickName : "", userName : "", online : true , groupId : 1
		 * 			} 
		 * 		},
		 * 		talks:{
		 * 			id : {
		 * 				title:"", owner:""
		 * 			}
		 * 		},
		 * 		recent : {
		 * 			
		 * 		}
		 *	
		 *		originalFriend : object,
		 * 		originalTalk : object,
		 * 		originalRecent : object
		 * }
		 */
		this.relationship = {
				groups:{},
				friends:{},
				talks:{},
				recent:{},
				originalFriend:undefined,
				originalTalk:undefined,
				originalRecent:undefined
		};
		
		/**
		 * 消息缓存，只作为当前不存在指定用户时才有作用
		 */
		this.messageCache = {};
		
		/*
		 * 存储当前中需要计算的相关值
		 * 而这些值应该是不可变化的
		 */
		this.properties = {};
		
		/**
		 * 临时数据
		 */
		this.temp = {};
		
		/**
		 * 讨论组构建数据内存
		 */
		this.talk = {
			id : undefined,
			name : undefined,
			friends : {},
			length : 0
		};
		
		/**
		 * 索引
		 */
		this.indexes = {
			friends : {},
			talks : {}
		};
		
		/**
		 * 皮肤 
		 */
		this.skin = undefined;
	};
	
	/**
	 * 内存对象进行扩展
	 */
	jBud.extend(Memory.prototype,{
		setSkin : function(value){
			this.skin = value;
		},
		
		getSkin : function() {
			return this.skin;
		},
		/**
		 * 设置用户信息
		 */
		setUser:function(user) {
			jBud.extend(this.user,user);
		},
		
		/**
		 * 清空用户信息
		 */
		clearUser:function() {
			jBud.extend(this.user, {
				nickname : undefined,
				userid : undefined,
				username : undefined
			});
		},
		
		/**
		 * 获得用户信息
		 */
		getUser : function(){
			return this.user;
		},
		
		/**
		 * 清空所有
		 */
		clearAll : function(){
			this.clearUser();
			
			delete this.relationship;
			this.relationship = {
					groups:{},
					friends:{},
					talks:{},
					recent:{},
					originalFriend:undefined,
					originalTalk:undefined,
					originalRecent:undefined
			};
			
			delete this.messageCache;
			this.messageCache = {};
			
			delete this.properties;
			this.properties = {};
		
			delete this.temp;
			this.temp = {};
		
			delete this.talk;
			this.talk = {
				id : undefined,
				name : undefined,
				friends : {},
				length : 0
			};
		
			delete this.indexes;
			this.indexes = {
				friends : {},
				talks : {}
			};
		
			delete this.skin;
			this.skin = undefined;
		},
		
		/**
		 * 是否处于活跃状态
		 */
		isActive : function(){
			return this.user && this.user.userid !== undefined;
		},
		
		/**
		 * 保存好友
		 */
		saveRelationship : function(data) {
			if(!data) return this.relationship;
			var rs = this.relationship, groups = rs.groups, friends = rs.friends , indexes = this.indexes;
			if(!groups) groups = rs.groups = {};
			if(!friends) friends = rs.friends = {};
			// 遍历已获得的数据
			for(var i = 0 ;i < data.length; i ++) {
				var group = data[i];
				// 将组的结构替换为 组ID为 KEY ， 组名称以及所包含成员ID为内容的结构
				groups[group.groupId] = {
						name:group.groupName,
						isRoot:false,
						users:[],
						groupId : group.groupId
				};
				var members = group.groupMember, users = groups[group.groupId].users;
				for(var j = 0; j<members.length; j++){
					var member = members[j];
					// 将好友ID推入到组中
					users.push(member.userId);
					
					// 将好友关系已队列的方式存储到结构中
					friends[member.userId] = {
							nickName : member.nickName,
							online : member.online,
							userName : member.userName,
							groupId : group.groupId,
							userId : member.userId,
							message : []
					};
				}
			}
			
			/*
			 * 构建索引
			 */
			for(var userId in friends) {
				var friend = friends[userId] , index;
				// 将好友的昵称作为索引，存储起来
				index = indexes.friends[friend.nickName];
				if( !index ) {
					index = indexes.friends[friend.nickName] = [];
				}
				index.push(friend.userId);
			}
			
			//设置默认的 我的好友 用于在顶端显示
			data.root = {
					groupName : "我的好友",
					groupMember :rs.friends ,
					groupId : "ROOT"
			};
			groups["ROOT"] = {
					isRoot : true,
					groupName : "我的好友",
					users : rs.friends
			};
			rs.originalFriend = data;
			return this.relationship;
		},
		
		/**
		 * 保存好友
		 */
		saveFriend : function(data){
			if(!data) return ;
			var rs = this.relationship, groups = rs.groups , friends = rs.friends , indexes =  this.indexes, friend , index;
			friends[data.userId] = {
				nickName : data.nickName,
				online : data.online,
				userName : data.userName,
				groupId : data.groupId,
				userId : data.userId,
				message : data.message
			};
			
			index = indexes.friends[data.nickName];
			if( !index ) {
				index = indexes.friends[data.nickName] = [];
			}
			index.push(data.userId);
		},
		
		/**
		 * 获得好友
		 */
		getRelationship : function(){
			return this.relationship;
		},
		
		/**
		 * 获取所有分组
		 */
		getGroups : function() {
			return this.relationship.groups;
		},
		
		/**
		 * 获得分组所有好友 
		 */
		getGroup: function(groupId){
			return this.getGroups()[groupId];
		},
		
		/**
		 * 保存讨论组结构
		 */
		saveTalk : function(data) {
			if(!data || !data.groupInfo) return this.relationship;
			var rs = this.relationship, talks = rs.talks , indexes = this.indexes;
			if(!talks) talks = rs.talks = {};
			
			// 遍历已获得的数据
			for(var i = 0 ;i<data.groupInfo.length;i++){
				var t = data.groupInfo[i] , index;
				talks[t.g_id] = {
						owner:t.owner,
						title:t.title,
						g_id : t.g_id,
						message : [],
						members:{}
				};
				
				index = indexes.talks[t.title];
				if(!index) index = indexes.talks[t.title] = [];
				index.push(t.g_id);
			}
			rs.originalTalk = data;
			return this.relationship;
		},
		
		/**
		 *  保存讨论组成员
		 */
		saveTalkMembers : function(id,data) {
			if(!data) return this.relationship;
			var rs = this.relationship, talks = rs.talks, talk;
			if(!talks) talks = rs.talks = {};
			talk = talks[id];
			if(!talk) {
				talk = talks[id] = {
					owner : undefined,
					title : 'UNKNOWN',
					g_id : id,
					message : [],
					members:{}
				};
			}
			
			for(var i = 0;i<data.length;i++ ) {
				var friend = data[i];
				talk.members[friend.userId] = {
					userId : friend.userId,
					userName : friend.userName,
					nickName : friend.nickName
				};
			}
			return this.relationship;
		},
		
		/**
		 * 保存最近联系人
		 */
		saveRecent : function(data) {
			if(!data || !data.userInfo) return this.relationship;
			var rs = this.relationship, recents = rs.recents;
			if(!recents) recents = rs.recents = {};
			
			for(var i = 0;i < data.userInfo.length ; i++){
				var r = data.userInfo[i];
				recents[r.type+"-"+r.userId] = {
						type : r.type,
						id : r.userId
				};
				// 表示个人
				if(r.type == 1) {
					r.target = rs.friends[r.userId];
				} else if(r.type == 2) {
					r.target = rs.talks[r.userId];
				}
			}
			
			rs.originalRecent = data;
			return this.relationship;
		},
		
		/**
		 *  保存消息
		 * {
		 			type : 1,
					id : toId,
					fromId : fromId,
					toId : toId,
					context : data.context,
					method : method,
					time : data.time
		 * }
		 * 			
		 */
		saveMessage : function(data) {
			if(!data) return ;
			var $item ;
			if(data.type == 1) {
				 $item = this.getFriend(data.id);
			} else if(data.type == 2) {
				$item = this.getTalk(data.id);
			}
			if(!$item) return ;
			$item.message.push(data);
		},
		
		/**
		 *  获得好友对象
		 */
		getFriend : function(id) {
			return this.relationship.friends[id];
		},
		
		/**
		 *  获得讨论组数据
		 */
		getTalk : function(id) {
			return this.relationship.talks[id];
		},
		
		existTalk : function(id){
			return id in this.relationship.talks;
		},
		
		/**
		 * 删除讨论组
		 */
		removeTalk : function(id) {
			var talks = this.relationship.talks;
			if(id in talks) delete talks[id];
		},
		
		/**
		 * 获取或者保存
		 */
		getTalkOrSave : function(data) {
			if(!data) return undefined;
			var talk = this.getTalk(data.g_id) , indexes = this.indexes ,index;
			if(talk) return talk;
			var talks = this.relationship.talks;
			talks[data.g_id] = {
					owner:data.send_id,
					title:data.title,
					g_id : data.g_id,
					message : [],
					members:{}
			};
			
			// 将新的保存到索引中
			index = indexes.talks[data.title];
			if(!index) index = indexes.talks[data.title] = [];
			index.push(data.g_id);
			
			return talks[data.g_id];
		},
		
		/**
		 *  统一接口
		 */
		getObject : function(id , type) {
			if(type == 1) return this.getFriend(id);
			else if(type == 2) return this.getTalk(id);
		},
		
		/**
		 *  获得成员ID
		 */
		getTalkMember : function(talkId , friendId){
			var talks = this.getTalk(talkId);
			if(!talks || !talks.members) return undefined;
			return talks.members[friendId];
		},
		
		/*
		 * 删除成员
		 */
		removeTalkMember : function(talkId , friendId){
			var talks = this.getTalk(talkId);
			if(!talks || !talks.members) return undefined;
			delete talks.members[friendId];
		},
		
		/**
		 * 清除讨论组临时数据 
		 */
		clearTalkTemp : function(){
			var talk = this.talk;
			talk.name = undefined , talk.id = undefined,  talk.friends = undefined , talk.length = 0;
			talk.friends = {};
		},
		
		/**
		 * 判断临时讨论组是否为空 
		 */
		isTalkTempEmpty : function(){
			return this.talk.length <= 0;
		},
		
		/**
		 * 获得临时数据 
		 */
		getTalkTemp : function(){
			return this.talk;
		},
		
		/**
		 *  添加临时讨论组数据
		 */
		pushTalkTempFriend : function(id,fixed) {
			this.talk.friends[id] = !!fixed;
			this.talk.length ++;
		},
		
		/**
		 * 删除临时讨论组数据
		 */
		removeTalkTempFriend : function(id) {
			if(id in this.talk.friends) {
				delete this.talk.friends[id];
				this.talk.length --;
			}
			if(this.talk.length < 0) this.talk.length = 0;
		},
		
		/**
		 * 是否存在好友 
		 */
		existTalkTempFriend : function(id){
			return id in this.talk.friends;
		},
		
		/**
		 * 检索出结果
		 */
		matchIndexes : function(name) {
			if(typeof name === 'undefined') return undefined;
			var friends = this.indexes.friends , talks = this.indexes.talks , reg = new RegExp("("+name+")","ig") , results = {friends:{},talks:{}};
			for(var key in friends) {
				var fs = friends[key];
				if(reg.test(key)) {
					for(var i = 0 ; i<fs.length;i++) {
						var friend = this.getFriend(fs[i]);
						if(!friend) continue;
						results.friends[friend.userId] = friend;
					}
				}
			}
			
			for(var key in talks) {
				var ts = talks[key];
				if(reg.test(key)) {
					for(var i = 0 ; i<ts.length;i++) {
						var talk = this.getTalk(ts[i]);
						if(!talk) continue;
						results.talks[talk.g_id] = talk;
					}
				}
			}
			
			return results;
		},
		
		/**
		 * 设置以及取值，对于value为undefined的状况，则认为在取值
		 */
		property : function(key,value) {
			if(typeof value === 'undefined') {
				if(jBud.isPlainObject(key)) {
					for(var k in key){
						this.properties[k] = key[k];
					}
					return this;
				}
				return this.properties[key];
			}
			this.properties[key] = value;
			return this;
		},
		
		/**
		 * 删除一些属性值
		 */
		removeProperties : function() {
			if(arguments.length <= 0) return;
			for(var i =0;i<arguments.length;i++) {
				var key = arguments[i];
				if(typeof key !== 'undefiend' && this.properties[key]) {
					delete this.properties[key];
				}
			}
		},
		
		/**
		 * 清空所有的属性值
		 */
		clearProperties : function(){
			delete this.properties;
			this.properties = {};
		},
		
		/**
		 * 推入到临时空间中
		 */
		pushTemp : function(selector,element) {
			this.temp[selector] = element;
			return this;
		},
		
		/**
		 *  从内存中获取对应的ELEMENT
		 */
		getTemp : function(selector) {
			var t = this.temp[selector];
			delete this.temp[selector];
			return t;
		},
		
		/**
		 * 删除临时ELEMENT
		 */
		removeTemp : function(selector) {
			delete this.temp[selector];
		},
		
		/**
		 * 消息存储
		 */
		pushMessageCache : function(message) {
			var cache = this.messageCache , msg;
			if(!message) return ;
			msg = cache[message.id];
			if(!msg) msg = cache[message.id] = [];
			msg.push(message);
		},
		/**
		 * 取出消息
		 */
		pickMessageCache : function(id) {
			var cache = this.messageCache , msg;
			msg = cache[id];
			if(msg) delete cache[id];
			return msg;
		}
	});
	
	/**
	 * 消息模型链
	 */
	module.exports = {
			Message:Message
	};
});