/**
 * 渲染层
 * @author Jimmy Song, Chen Peng
 * @date 2014-01-15
 * @version 1.0.12
 */
jBud.define("message/view",['swfupload'],function(require,exports,module) {
	/**
	 * 视图层统一接口
	 */
	var View = function() {
		// 构建基础UUID，全局唯一ID
		this.baseId = "MSG"+Math.floor(Math.random()*99999);
		
		/**
		 * 头像地址
		 */
		this.head = {
				small:'http://tpic.home.news.cn/userIcon/s/',
				middle:'http://tpic.home.news.cn/userIcon/m/',
				large:'http://tpic.home.news.cn/userIcon/l/'
		};
		
		this.styles = {
			base : "BASESTYLE",
			skin : "SKIN"
		};
		
		// 全局选择ID
		this.selector = {
				message : "message",
				
				panel : "panel",
				panelTitle : "panelTitle",
				panelContent : "panelContent",
				panelTop : "panelTop",
				panelSearch : "panelSearch",
				panelSearchResult : "panelSearchResult",
				panelCreateTalk : "panelCreateTalk",
				panelFunc : "panelFunc",
				panelList : "panelList",
				panelFriend : "panelFriend",
				panelFriendOnline : "panelFriendOnline",
				panelTreeNode:"panelTreeNode",
				panelTalk : "panelTalk",
				panelTalkList : "panelTalkList",
				panelRecent : "panelRecent",
				panelRecentList : "panelRecentList",
				
				tray : "tray",
				trayTip : "trayTip",
				trayState : "trayState",
				traySkin : "traySkin",
				traySkinSelect : "traySkinSelect",
				traySkinList : "traySkinList",
				trayMessage : "trayMessage",
				
				chat : "chat",
				chatTitle : "chatTitle",
				chatPanel : "chatPanel",
				
				talk : "talk",
				talkTitle : "talkTitle",
				talkSelected : "talkSelected",
				talkMax : "talkMax",
				talkTree : "talkTree",
				talkPool : "talkPool",
				talkName : "talkName",
				
				preview : "preview",
				previewContent : "previewContent",
				previewImage : "previewImage"
		};
		
		// 全局样式
		this.css = {
				TRAY_OFFLINE : "_OFFLINE_",
				TRAY_ONLINE : "_ONLINE_",
				TREE_TITLE : "_MPL-TREE-TITLE_"
		};
		
		// 全局节点ID
		this.nodes = {
				
		};
	};
	
	/**
	 * 扩展视图接口
	 */
	jBud.extend( View.prototype , {
		/**
		 * 获得当前基本ID
		 */
		getBaseId : function() {
			return this.baseId;
		},
		
		getHead : function(){
			return this.head;
		},
		
		getStyleId : function(name) {
			if(typeof name !== 'string') return undefined;
			return this.styles[name];
		},
		
		/**
		 * DOM Node 临时存储环境 ， 防止多次存储
		 */
		node : function(selector) {
			var nodes = this.nodes;
			if(selector in nodes) return nodes[selector];
			return (nodes[selector] = jBud(selector));
		},
		
		/**
		 * 通过已经存储的 ID 获得 node 对象
		 * 实际最终调用 node 方法
		 */
		get : function(name,suffix) {
			var selector = this.selector;
			if(typeof suffix !== 'string') suffix = "";
			if(!selector[name]) return undefined;
			return this.node("#"+this.baseId+selector[name]+suffix);
		},
		
		/**
		 * 重新加载节点 
		 */
		reload : function(name, suffix) {
			var selector = this.selector;
			if(typeof suffix !== 'string') suffix = "";
			if(!selector[name]) return undefined;
			var id = "#"+this.baseId+selector[name]+suffix;
			delete this.nodes[id];
			return this.get(name,suffix);
		},
		
		clear : function(){
			delete this.nodes;
			this.nodes = {};
		},
		
		/**
		 * 获取已经存储的样式
		 */
		style : function (name,selector) {
			if(!this.css[name]) return "";
			return (selector?'.':'')+this.css[name];
		},
		
		/**
		 * 将数值转换为FLOAT类型，如果错误，则默认为 0
		 */
		parseFloat : function (value) {
			return parseFloat(value) || 0;
		},
		
		/**
		 * 渲染基础框架
		 */
		renderFramework : function() {
			var id = this.baseId , selector = this.selector, h;
			// 消息主体 #MESSAGE#
			h = '<div id="'+id+selector.message+'" class="_MESSAGE_">';
			// 消息主体 - 面板 
			h += this.renderPanel();
			// 消息主题 - 托盘
			h += this.renderTray();
			
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染面板
		 */
		renderPanel : function() {
			var id = this.baseId, selector = this.selector, h, title , content;
			// 主面板 #PANEL#
			h = '<div id="'+id+selector.panel+'" class="_MESSAGE-PANEL_">';
			
			// 主面板 标题 #PANEL-TITLE#
			title = '<div id="'+id+selector.panelTitle+'"class="_MP-TITLE_ _MSKIN-BAR_">炫聊<ul class="_MBTN-WINDOW_ _MCLEARFIX_"><li class="_MBTN-WCLOSE_">&nbsp;</li></ul></div>';
			
			// 主面板 内容 #PANEL-CONTENT#
			content = '<div id="'+id+selector.panelContent+'" class="_MP-CONTENT_">';
			// 主面板 顶端控制 #PANEL-CONTENT-TOP#
			content += '<ul class="_MP-TOP_ _MCLEARFIX_" id="'+id+selector.panelTop+'"><li class="_MP-SEARCH_"><ul class="_MP-SEARCH-ITEM_ _MCLEARFIX_"><li class="_MP-SEARCH-INPUT_"><input type="text" id="'+id+selector.panelSearch+'"/><div class="_MP-SEARCH-RESULT_ _MHIDDEN_" id="'+id+selector.panelSearchResult+'"></div></li><li class="_MP-SEARCH-BUTTON_">&nbsp;</li></ul></li><li class="_MP-TALK_" id="'+id+selector.panelCreateTalk+'">创建组</li></ul>';
			// 主面板 类型控制 #PANEL-CONTENT-FUNC#
			content += '<ul class="_MP-FUNC_ _MCLEARFIX_" id="'+id+selector.panelFunc+'"><li class="_MPF-LATEST_" title="最近联系人"><span class="_MPF-LATEST-TIP_" id="_MPF-LATEST-TIP_">&nbsp;</span></li><li class="_MPF-FRIEND_" title="好友">&nbsp;</li><li class="_MPF-TALK_" title="讨论组">&nbsp;</li></ul>';
			// 主面板 列表控制 #PANE-CONTENT-LIST#
			content += '<div class="_MP-LIST_"><ul class="_MP-LAYER_ _MCLEARFIX_" id="'+id+selector.panelList+'"><li id="'+id+selector.panelRecent+'"></li><li id="'+id+selector.panelFriend+'"></li><li id="'+id+selector.panelTalk+'"></li></ul></div>';
			content += '</div>';
			
			h += title + content;
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染托盘
		 */
		renderTray : function() {
			var id = this.baseId, selector = this.selector , h;
			// 托盘 #TRAY#
			h = '<ul id="'+id+selector.tray+'"class="_MESSAGE-TRAY_ _MCLEARFIX_ _MSKIN-BAR_"><li class="_MT-STATE_ _OFFLINE_" id="'+id+selector.trayState+'">&nbsp;</li><li class="_MT-MESSAGE_" id="'+id+selector.trayMessage+'">炫聊<em id="'+id+selector.trayTip+'"></em></li><li class="_MT-SKIN_" id="'+id+selector.traySkin+'"><div class="_MT-SKIN-SELECT_ _MHIDDEN_" id="'+id+selector.traySkinSelect+'"><ul class="_MT-SKIN-LIST_ _MCLEARFIX_" id="'+id+selector.traySkinList+'"></ul><div class="_MT-SKIN-ARROW_">&nbsp;</div></div></li></ul>';
			return h;
		},
		
		/**
		 * 渲染好友树
		 */
		renderFriendTree : function(tree) {
			if(!tree) return '';
			var id = this.baseId , selector = this.selector , h;
			// 好友树 #FRIEND-TREE#
			h = '<div class="_MPL-TREE-ONLINE_"><input type="checkbox" id="'+id+selector.panelFriendOnline+'"/>只显示在线好友</div>';
			h += '<div class="_MPL-TREE_">';
			// 加载 我的好友 
			h += this.renderFriendTreeNode(tree.root);
			for(var i = 0;i<tree.length;i++){
				// 渲染好友节点树
				h += this.renderFriendTreeNode(tree[i]);
			}
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染好友树节点
		 */
		renderFriendTreeNode : function(node){
			if(!node) return '';
			var id = this.baseId , selector = this.selector , h;
			// 好友树节点 #FRIEND-TREE-NODE#
			h = '<div class="_MPL-TREE-ITEM_">';
			
			// 好友树节点名称 #FRIEND-TREE-NODE-TITLE#
			h += '<div class="_MPL-TREE-TITLE_" id="'+id+selector.panelTreeNode+node.groupId+'">'+node.groupName+'</div>';
			// 渲染好友列表
			h += this.renderFriendList(node.groupMember,node);
			
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染好友列表
		 */
		renderFriendList : function(list,node) {
			if(!list) return '';
			var id = this.baseId, selector = this.selector , head = this.head , h;
			// 好友列表#FRIEND-LIST#
			h = '<div class="_MPL-LIST_ _MHIDDEN_">';
			for(var k in list){
				var friend = list[k];
				h += this.renderFriend(friend,node);
			}
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染好友
		 */
		renderFriend : function(friend,node) {
			if(!friend) return '';
			var id = this.baseId, selector = this.selector , head = this.head , h;
			// 好友 #FRIEND-ITEM#
			// 判断是否在线
			var online = friend.online ? '_ONLINE_' : '_OFFLINE_';
			var offline = friend.online ? '' : '_MPL-OFFLINE_';
			// 判断是否为根节点，如果为根节点添加相应的CLASS
			var tipClass = "", rid = "",iconClass = "" , friendClass = "";
			if(node)  {
				if(node == 'RECENT' || node.groupId == 'ROOT')
					tipClass = (id+friend.userId+"FRIENDTIP");
					
				if(node == 'RECENT') 
					rid = 'id="'+id+friend.userId + 'RECENT-FRIEND"';
				else 
					friendClass = id+friend.userId + 'TREE-FRIEND';
			}
			
			iconClass = id+friend.userId+"FRIEND-ICON";
			
			h = '<div class="'+friendClass+' _MPL-LIST-ITEM_ '+offline+'" '+rid+'><a class="_MPL-ICON_"><img src="'+(head.small+friend.userName)+'" class=" '+online+' '+iconClass+'"/><em class="_MHIDDEN_ '+tipClass+'"></em></a><a class="_MPL-NAME_" data-type="1" data-id="'+friend.userId+'">'+friend.nickName+'</a></div>';
			return h;
		},
		
		/**
		 * 渲染讨论组列表
		 */
		renderTalkList : function(list) {
			var id = this.baseId, selector = this.selector , head = this.head , h;

			// 讨论组列表#TALK-LIST#
			if(!list || !list.groupInfo) return '<div class="_MPL-LIST_" id="'+id+selector.panelTalkList+'"></div>';

			h = '<div class="_MPL-LIST_" id="'+id+selector.panelTalkList+'">';
			for(var k = 0; k < list.groupInfo.length; k ++){
				var talk = list.groupInfo[k];
				h += this.renderTalk(talk);
			}
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染讨论组
		 */
		renderTalk : function(talk,type){
			if(!talk) return '';
			var id = this.baseId, selector = this.selector , head = this.head , h;
			// 讨论组 #TALK-ITEM#
			var tipClass = id+talk.g_id+"TALKTIP", rid = "" , edit = '', talkClass = '';
			if(type == 'RECENT') {
				rid = 'id="'+id+talk.g_id+'RECENT-TALK"';
			} else {
				rid = 'id="'+id+talk.g_id+'PANEL-TALK"';
				edit = '<input type="text" class="_MPL-NAME-EDIT_ _MHIDDEN_" data-id="'+talk.g_id+'" data-type="2"/><a class="_MPL-EDIT_" data-id="'+talk.g_id+'" data-type="2" title="Esc取消 Enter确认">&nbsp;</a>';
			}
			
			talkClass = id+talk.g_id+"TALK-NAME";
			
			h = '<div class="_MPL-LIST-ITEM_" '+rid+'><a class="_MPL-ICON_ _MICON-TALK_">&nbsp;<em class="_MHIDDEN_ '+tipClass+'"></em></a><a class="_MPL-NAME_ '+talkClass+'" data-type="2" data-id="'+talk.g_id+'">'+talk.title+'</a>'+edit+'</div>';
			return h;
		},
		
		/**
		 * 渲染最近联系人
		 */
		renderRecentList : function(recent){
			if(!recent || !recent.userInfo) return '';
			var id = this.baseId, selector = this.selector , h;
			// 最近联系人 #RECENT#
			h = '<div class="_MPL-LIST_" id="'+id+selector.panelRecentList+'">';
			for(var i = 0;i<recent.userInfo.length;i++){
				var info = recent.userInfo[i];
				if(info.type == 1) {
					h += this.renderFriend(info.target,'RECENT');
				} else if(info.type == 2) {
					h += this.renderTalk(info.target,'RECENT');
				}
			}
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染聊天对话框结构
		 */
		renderChatFramework : function() {
			var id = this.baseId, selector = this.selector, h;
			// 聊天主体 #MESSAGE-CHAT#
			h = '<div class="_MESSAGE-CHAT_" id="'+id+selector.chat+'">';
			
			// 对话框标题 #MESSAGE-CHAT-TITLE#
			var title = '<div class="_MC-TITLE_ _MSKIN-BAR_"><div class="_MC-TAB-MAIN_"><ul class="_MC-TAB_ _MCLEARFIX_" id="'+id+selector.chatTitle+'"></ul></div><ul class="_MBTN-WINDOW_ _MCLEARFIX_"><li class="_MBTN-WNARROW_">&nbsp;</li><li class="_MBTN-WCLOSE_">&nbsp;</li></ul></div>';
			// 对话框标题 #MESSAGE-CHAT-PANEL#
			var panel = '<div class="_MC-PANEL_"><div class="_MCP-LAYER_ _MCLEARFIX_" id="'+id+selector.chatPanel+'"></div></div>';
			
			h += title + panel;			
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染好友聊天内容
		 */
		renderChatTitleFriend : function(friend) {
			if(!friend) return '';
			var id = this.baseId, selector = this.selector, head = this.head, h, tipClass;
			tipClass = id+friend.userId + "FRIENDTIP";
			// 对话标题 #MESSAGE-CHAT-TITLE-FRIEND#
			h = '<li id="'+id+friend.userId+"CHAT-FRIEND-TITLE"+'"><div class="_MC-TAB-INFO_ _MCLEARFIX_"><h3><img src="'+(head.small+friend.userName)+'"/></h3><p class="_MC-TAB-NAME_"  data-id="'+friend.userId+'" data-type="1">'+friend.nickName+'</p></div><div class="_MC-TAB-CLOSE_"  data-id="'+friend.userId+'" data-type="1">&nbsp;</div><div class="_MC-TAB-TIP_ _MHIDDEN_ '+tipClass+'"></div></li>';
			
			return h;
		},
		
		/**
		 * 渲染讨论组聊天内容
		 */
		renderChatTitleTalk : function(talk){
			if(!talk) return '';
			var id = this.baseId, selector = this.selector, head = this.head, h , tipClass;
			
			tipClass = id+talk.g_id + "TALKTIP";
			// 对话标题 #MESSAGE-CHAT-TITLE-TALK#
			h = '<li id="'+id+talk.g_id+"CHAT-TALK-TITLE"+'"><div class="_MC-TAB-INFO_ _MCLEARFIX_"><h3 class="_MICON-TALK-TINY_">&nbsp;</h3><p class="_MC-TAB-NAME_" data-id="'+talk.g_id+'" data-type="2">'+talk.title+'</p></div><div class="_MC-TAB-CLOSE_" data-id="'+talk.g_id+'" data-type="2">&nbsp;</div><div class="_MC-TAB-TIP_ _MHIDDEN_ '+tipClass+'"></div></li>';
			
			return h;
		},
		
		/**
		 *  渲染对话面板
		 */
		renderChatPanelFriend : function(friend) {
			if(!friend) return '';
			var id = this.baseId , selector = this.selector , h, offlineCount, offlineClass;
			
			// 离线消息数
			offlineCount = this.parseFloat(friend.offlineCount);
			offlineClass = offlineCount > 0 ? "" : " _MHIDDEN_ ";
			offlineCount = offlineCount > 99 ? 99 : offlineCount;
			
			
			// 对话面板 #MESSAGE-CHAT-PANEL-FRIEND#
			h = '<div class="_MCP-LAYER-ITEM_" id="'+id+friend.userId+"CHAT-FRIEND-PANEL"+'">';
			
			// 对话主题框 #MESSAGE-CHAT-PANEL-MAIN#
			var main = '<div class="_MCP-LAYER-MAIN_"  id="'+id+friend.userId+"CHAT-FRIEND-MAIN"+'">';
			
			// 对话泡 #MESSAGE-CHAT-PANEL-BUBBLE#
			var bubble = '<div class="_MCPL-CONTENT_" id="'+id+friend.userId+"CHAT-FRIEND-CONTENT"+'"><ul class="_MCPL-CONTENT-LIST_" id="'+id+friend.userId+"CHAT-FRIEND-BUBBLE"+'"></ul></div>';
			
			// 对话发布 #MESSAGE-CHAT-PANEL-PUBLISH#
			var publish = '<div class="_MCPL-PUBLISH_">';
			
			var tip = '<div class="_MCPL-UPLOAD-TIP_ _MHIDDEN_"  id="'+id+friend.userId+"1CHAT-UPLOAD-TIP"+'"></div>';
			// 对话工具 #MESSAGE-CHAT-PANEL-TOOLS#
			var tools = '<div class="_MCPL-TOOLS_"><ul class="_MBTN-TOOLS_ _MCLEARFIX_"><li class="_MBTN-FACES_"><button class="_MBTN-ICON-FACE_  _MTOOLS-FACE_" title="表情" data-id="'+friend.userId+'" data-type="1">&nbsp;</button><div class="_MBTN-FACES-LAYER_ _MCLEARFIX_ _MHIDDEN_" id="'+id+friend.userId+'1FACES-LAYER"></div></li><li class="_MBTN-SWF_" title="图片"><button class="_MBTN-ICON-IMAGE_ _MTOOLS-IMAGE_" title="图片" >&nbsp</button><button id="'+id+friend.userId+1+'CHAT-IMAGE-UPLOAD'+'" class="_MBTN-SWF-BUTTON_">&nbsp;</button></li><li class="_MBTN-SWF_"  title="附件"><button class="_MBTN-ICON-ANNEX_  _MTOOLS-ANNEX_" title="附件">&nbsp;</button><button id="'+id+friend.userId+1+'CHAT-ANNEX-UPLOAD'+'" class="_MBTN-SWF-BUTTON_">&nbsp;</button></li><li><button class="_MBTN-ICON-USER_ _MTOOLS-TALK_" title="创建讨论组"  data-id="'+friend.userId+'" data-type="1">&nbsp;</button></li></ul><ul class="_MBTN-DIALOG_ _MCLEARFIX_"><li class="_MINFO-RECORD-BUTTON_"><button class="_MBTN-ICON-GRAY_ _MTOOLS-RECORD_" data-id="'+friend.userId+'" data-type="1">消息记录</button><div class="_MINFO-RECORD-TIP_ '+offlineClass+' ">'+offlineCount+'</div></li></ul></div>';
			// 对话文本 #MESSAGE-CHAT-PANEL-TEXT#
			var text = '<div class="_MCPL-TEXT_"><textarea placeholder="准备发出消息的内容（Ctrl+Enter快速发送）" class="_MPUBLISH-TEXT_"   id="'+id+friend.userId+"CHAT-FRIEND-TEXT"+'" data-id="'+friend.userId+'" data-type="1"></textarea></div>';
			// 对话按钮 #MESSAGE-CHAT-PANEL-BUTTON#
			var button = '<div class="_MCPL-SEND_"><h3 id="'+id+friend.userId+'CHAT-FRIEND-TEXT-TIP"></h3><div class="_MCPL-SEND-TIP_">Ctrl+Enter快速发送</div><ul class="_MBTN-DIALOG_ _MCLEARFIX_"><li><button class="_MBTN-ICON-BUTTON_ _MPUBLISH-POST_" data-id="'+friend.userId+'" data-type="1" title="Ctrl+Enter快速发送">发送</button></li></ul></div>';
			
			publish += tip+tools+text+button;
			publish += '</div>';
			
			// 消息记录
			var record = '<div class="_MCP-LAYER-INFO_ _MHIDDEN_" id="'+id+friend.userId+"CHAT-FRIEND-RECORD"+'"><div class="_MINFO-TITLE_">消息记录</div><div class="_MINFO-MESSAGE_" id="'+id+friend.userId+"CHAT-FRIEND-RECORD-LIST"+'"></div><div class="_MINFO-MESSAGE-SEARCH_"><div class="_MINFO-MSEARCH-PAGE_" data-id="'+friend.userId+'" data-type="1"><button class="_MINFO-MSEARCH-LEFT_"  id="'+id+friend.userId+"CHAT-FRIEND-RECORD-PREV"+'">&nbsp;</button><input class="_MINFO-MSEARCH-TEXT_"  id="'+id+friend.userId+"CHAT-FRIEND-RECORD-TEXT"+'"/>/<span class="_MINFO-MSEARCH-TOTAL_"  id="'+id+friend.userId+"CHAT-FRIEND-RECORD-TOTAL"+'"></span><button class="_MINFO-MSEARCH-RIGHT_"  id="'+id+friend.userId+"CHAT-FRIEND-RECORD-NEXT"+'">&nbsp;</button></div></div></div>';
			
			main += bubble+publish;
			main += '</div>';
			
			h += main + record;
			
			h += '</div>';
			return h;
		},
		
		/**
		 *  渲染对话面板
		 */
		renderChatPanelTalk : function(talk){
			if(!talk) return "";
			var id = this.baseId , selector = this.selector , h , offlineCount , offlineClass;
			
			// 离线消息数
			offlineCount = this.parseFloat(talk.offlineCount);
			offlineClass = offlineCount > 0 ? "" : " _MHIDDEN_ ";
			offlineCount = offlineCount > 99 ? 99 : offlineCount;
			
			// 对话面板 #MESSAGE-CHAT-PANEL-FRIEND#
			h = '<div class="_MCP-LAYER-ITEM_" id="'+id+talk.g_id+"CHAT-TALK-PANEL"+'">';
			
			// 对话主题框 #MESSAGE-CHAT-PANEL-MAIN#
			var main = '<div class="_MCP-LAYER-MAIN_ _MCP-SHOWINFO_" id="'+id+talk.g_id+"CHAT-TALK-MAIN"+'">';
			
			// 对话泡 #MESSAGE-CHAT-PANEL-BUBBLE#
			var bubble = '<div class="_MCPL-CONTENT_" id="'+id+talk.g_id+"CHAT-TALK-CONTENT"+'"><ul class="_MCPL-CONTENT-LIST_" id="'+id+talk.g_id+"CHAT-TALK-BUBBLE"+'"></ul></div>';
			
			// 对话发布 #MESSAGE-CHAT-PANEL-PUBLISH#
			var publish = '<div class="_MCPL-PUBLISH_">';
			
			var tip = '<div class="_MCPL-UPLOAD-TIP_ _MHIDDEN_"  id="'+id+talk.g_id+"2CHAT-UPLOAD-TIP"+'"></div>';
			// 对话工具 #MESSAGE-CHAT-PANEL-TOOLS#
			var tools = '<div class="_MCPL-TOOLS_"><ul class="_MBTN-TOOLS_ _MCLEARFIX_"><li class="_MBTN-FACES_"><button class="_MBTN-ICON-FACE_  _MTOOLS-FACE_" title="表情" data-id="'+talk.g_id+'" data-type="2">&nbsp;</button><div class="_MBTN-FACES-LAYER_ _MCLEARFIX_ _MHIDDEN_" id="'+id+talk.g_id+'2FACES-LAYER"></div></li><li  class="_MBTN-SWF_" title="图片"><button class="_MBTN-ICON-IMAGE_ _MTOOLS-IMAGE_" title="图片">&nbsp;</button><button id="'+id+talk.g_id+2+'CHAT-IMAGE-UPLOAD'+'" class="_MBTN-SWF-BUTTON_">&nbsp;</button></li><li><button class="_MBTN-ICON-USER_ _MTOOLS-TALK_"title="添加成员"  data-id="'+talk.g_id+'" data-type="2">&nbsp;</button></li></ul><ul class="_MBTN-DIALOG_ _MCLEARFIX_"><li><button class="_MBTN-ICON-GRAY_ _MTOOLS-TALK-QUIT_"   data-id="'+talk.g_id+'" data-type="2">退出讨论</button></li><li  class="_MINFO-RECORD-BUTTON_"><button class="_MBTN-ICON-GRAY_ _MTOOLS-RECORD_"  data-id="'+talk.g_id+'" data-type="2">消息记录</button><div  class="_MINFO-RECORD-TIP_ '+offlineClass+'">'+offlineCount+'</div></li></ul></div>';
			// 对话文本 #MESSAGE-CHAT-PANEL-TEXT#
			var text = '<div class="_MCPL-TEXT_"><textarea placeholder="准备发出消息的内容（Ctrl+Enter快速发送）" class="_MPUBLISH-TEXT_"  id="'+id+talk.g_id+"CHAT-TALK-TEXT"+'" data-id="'+talk.g_id+'" data-type="2"></textarea></div>';
			// 对话按钮 #MESSAGE-CHAT-PANEL-BUTTON#
			var button = '<div class="_MCPL-SEND_"><h3 id="'+id+talk.g_id+'CHAT-TALK-TEXT-TIP"></h3><div class="_MCPL-SEND-TIP_">Ctrl+Enter快速发送</div><ul class="_MBTN-DIALOG_ _MCLEARFIX_"><li><button class="_MBTN-ICON-BUTTON_ _MPUBLISH-POST_" data-id="'+talk.g_id+'" data-type="2"  title="Ctrl+Enter快速发送">发送</button></li></ul></div>';
			
			publish += tip+tools+text+button;
			publish += '</div>';
			
			// 讨论组成员 
			var member = '<div class="_MCP-LAYER-INFO_"  id="'+id+talk.g_id+"CHAT-TALK-MEMBER"+'"><div class="_MINFO-TITLE_" >讨论组成员(<em  id="'+id+talk.g_id+"CHAT-TALK-MEMBER-COUNT"+'"></em>)</div><div class="_MINFO-LIST_"   id="'+id+talk.g_id+"CHAT-TALK-MEMBER-LIST"+'"></div></div>';
			
			// 消息记录
			var record = '<div class="_MCP-LAYER-INFO_  _MHIDDEN_"  id="'+id+talk.g_id+"CHAT-TALK-RECORD"+'"><div class="_MINFO-TITLE_">消息记录</div><div class="_MINFO-MESSAGE_"  id="'+id+talk.g_id+"CHAT-TALK-RECORD-LIST"+'"></div><div class="_MINFO-MESSAGE-SEARCH_"><div class="_MINFO-MSEARCH-PAGE_" data-id="'+talk.g_id+'" data-type="2"><button class="_MINFO-MSEARCH-LEFT_"   id="'+id+talk.g_id+"CHAT-TALK-RECORD-PREV"+'">&nbsp;</button><input class="_MINFO-MSEARCH-TEXT_"   id="'+id+talk.g_id+"CHAT-TALK-RECORD-TEXT"+'"/>/<span class="_MINFO-MSEARCH-TOTAL_"   id="'+id+talk.g_id+"CHAT-TALK-RECORD-TOTAL"+'"></span><button class="_MINFO-MSEARCH-RIGHT_"   id="'+id+talk.g_id+"CHAT-TALK-RECORD-NEXT"+'">&nbsp;</button></div></div></div>';
			
			main += bubble+publish;
			main += '</div>';
			
			h += main + member + record;
			
			h += '</div>';
			return h;
		},
		
		/**
		 * 渲染讨论组成员列表
		 */
		renderChatPanelTalkMember : function(members) {
			if(!members || !members.g_members) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h;
			h = '';
			for(var i = 0;i < members.g_members.length ;i ++){
				var friend = members.g_members[i];
				h += '<div class="_MINFO-LIST-ITEM_" id="'+id+friend.userId+'CHAT-TALK-MEMBER-ITEM"><a class="_MINFO-ICON_"><img src="'+(head.small+friend.userName)+'"/></a><a class="_MINFO-NAME_">'+friend.nickName+'</a></div>';
			}
			return h;
		},
		
		/**
		 *  渲染时间
		 */
		renderDate : function(date,format) {
			var temp = undefined;
			if(jBud.isString(date) || jBud.isNumeric(date)) {
				temp = new Date(parseFloat(date));
			} else {
				temp = date;
			} 
			if(!jBud.isDate(temp) || temp == 'Invalid Date'){
				return date;
			}
			if(typeof format !== 'string') format = 'yyyy-MM-dd HH:mm:ss';
			var o = {
			"M+" : temp.getMonth()+1, //month
			"d+" : temp.getDate(), //day
			"H+" : temp.getHours(), //hour
			"m+" : temp.getMinutes(), //minute
			"s+" : temp.getSeconds(), //second
			"q+" : Math.floor((temp.getMonth()+3)/3), //quarter
			"S" : temp.getMilliseconds() //millisecond
			}
			if(/(y+)/.test(format)) {
				format=format.replace(RegExp.$1,(temp.getFullYear()+"").substr(4 - RegExp.$1.length));
			} 
			for(var k in o) {
				if(new RegExp("("+ k +")").test(format)) {
					format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] :("00"+ o[k]).substr((""+ o[k]).length));	
				}
			}
			return format;
		},
		
		/**
		 *  渲染文本
		 */
		renderChatText : function(text) {
			if(typeof text !== 'string') return '';
			return text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/(\n|\r)/g,"<br/>");
		},
		
		/**
		 *  构建冒泡，只作为统一构建冒泡的中转
		 */
		renderChatBubble : function(data) {
			if(!data) return '';
			if(data.method == 'PULL') {
				return this.renderChatFromBubble(data);
			} else if (data.method == 'PUSH') {
				return this.renderChatToBubble(data);
			}
			return '';
		},
		
		/**
		 * 渲染来源的冒泡
		 */
		renderChatFromBubble : function(data) {
			if(!data) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h , headClass , nameClass;
			if(data.defer) {
				nameClass = id+data.type+data.fromId+"BUBBLE-DEFER-NAME";
				headClass = id+data.type+data.fromId+"BUBBLE-DEFER-HEAD";
			}
			h = '<li class="_MCLEARFIX_"><div class="_MCPL-BUBBLE_"><div class="_MCPL-ICON_"><img src="'+(head.small+data.userName)+'"   class="'+headClass+'"/></div><div class="_MCPL-MESSAGE_"><p>'+data.context+'</p><h3>&nbsp;<div class="_MCPL-MESSAGE-NAME_">'+this.renderDate(data.time)+',<span class="'+nameClass+'">'+data.nickName+'</span></div></h3><div class="_MCPL-ARROW_">&nbsp;</div></div></div></li>';
			return h;
		},
		
		/**
		 * 渲染来源的冒泡 
		 */
		renderChatToBubble : function(data) {
			if(!data) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h , nameClass , headClass;
			if(data.defer) {
				nameClass = id+data.type+data.fromId+"BUBBLE-DEFER-NAME";
				headClass = id+data.type+data.fromId+"BUBBLE-DEFER-HEAD";
			}
			h = '<li class="_MCLEARFIX_"><div class="_MCPL-BUBBLE_ _MBUBBLE-RIGHT_"><div class="_MCPL-MESSAGE_"><p>'+data.context+'</p><h3>&nbsp;<div class="_MCPL-MESSAGE-NAME_">'+this.renderDate(data.time)+',<span class="'+nameClass+'">'+data.nickName+'</span></div></h3><div class="_MCPL-ARROW_">&nbsp;</div></div><div class="_MCPL-ICON_"><img src="'+(head.small+data.userName)+'"  class="'+headClass+'"/></div></div></li>';
			return h;
		},
		
		/**
		 * 渲染消息记录列表
		 */
		renderRecordList : function(data) {
			if( !data ) return '';
			var messages = data , h = '';
			for (var i = 0;i < messages.length; i ++) {
				var item = messages[i];
				h += '<div class="_MINFO-MESSAGE-ITEM_"><h3>'+item.nickName+'<em>'+this.renderDate(item.time)+'</em></h3><p>'+item.context+'</p></div>';
			}
			return h;
		},
		
		/**
		 * 渲染讨论组框架
		 */
		renderTalkFramework : function() {
			var id = this.baseId , selector = this.selector , h;
			
			// 构建讨论组 #MESSAGE-TALK#
			h = '<div class="_MESSAGE-TALKGROUP_" id="'+id+selector.talk+'" data-build="true">';
			
			// 构建讨论组标题 #MESSAGE-TALK-TITLE#
			var title = '<div class="_MTG-TITLE_  _MSKIN-BAR_"><span  id="'+id+selector.talkTitle+'">创建讨论组</span><ul class="_MBTN-WINDOW_ _MCLEARFIX_"><li class="_MBTN-WCLOSE_ _MTOOLS-CLOSE_">&nbsp;</li></ul></div>'; 			
			
			// 主题内容框 #MESSAGE-TALK-MAIN#
			var main = '<div class="_MTG-PANEL_ _MCLEARFIX_">';
			// 好友树 #MESSAGE-TALK-TREE#
			var tree = '<div class="_MTG-TREE_"><div class="_MTG-TREE-SEARCH_">全部好友列表</div><div class="_MTG-TREE-LAYER_"  id="'+id+selector.talkTree+'"></div></div>';
			// 已选的联系人 #MESSAGE-TALK-POOL#
			var pool = '<div class="_MTG-POOL_"><div class="_MTG-POOL-TITLE_">已选联系人(<em class="_MTG-POOL-VALUE_"  id="'+id+selector.talkSelected+'">0</em>/<em class="_MTG-POOL-MAX_"  id="'+id+selector.talkMax+'">0</em>)</div><div class="_MTG-POOL-LAYER_" id="'+id+selector.talkPool+'"></div></div>';
			
			main += tree + pool;
			main += '</div>';
			
			// 讨论组控制 #MESSAGE-TALK-BUTTON#
			var button = '<div class="_MTG-CONTROL_ _MCLEARFIX_"><div class="_MTG-CONTROL-NAME_">讨论组名称：<input type="text"placeholder="请输入讨论组名称"  id="'+id+selector.talkName+'"/></div><ul class="_MBTN-DIALOG_ _MCLEARFIX_"><li><button class="_MBTN-ICON-BUTTON_ _MTOOLS-SUBMIT_">确定</button></li><li><button class="_MBTN-ICON-CANCEL_ _MTOOLS-CLOSE_">取消</button></li></ul></div>';
			
			h += title + main + button;
			h += '</div>';
			
			return h;
		},
		
		/**
		 * 渲染讨论组树
		 */
		renderTalkTree : function(data) {
			if(!data) return '';
			var id = this.baseId , selector = this.selector , h , groups;
			// 构建讨论组树 #MESSAGE-TALK-TREE-ITEM#
			h = '';
			groups = data.getGroups();
			for(var key in groups) {
				var group = groups[key] , list;
				if(group.isRoot) continue;
				list = this.renderTalkTreeList(group.users,data);
				h += '<div class="_MTG-TREE-ITEM_"><div class="_MTG-TREE-TITLE_">'+group.name+'<a class="_MTG-ADD_ _MTOOLS-GROUP_" data-id="'+key+'">&nbsp;</a></div><div class="_MTG-LIST_ _MHIDDEN_">'+list+'</div></div>';
			}
			return h;
		},
		
		/**
		 * 构建讨论组树成员列表
		 */
		renderTalkTreeList : function(users , data) {
			if(!users || !data) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h;
			h = '';
			for(var i = 0;i<users.length; i ++) {
				var user = data.getFriend(users[i]) , nameClass;
				if(!user) continue;
				nameClass = id+user.userId+"TALK-USER";
				h += '<div class="_MTG-LIST-ITEM_ '+nameClass+'"><a class="_MTG-ICON_"><img src="'+(head.small+user.userName)+'"/></a><a class="_MTG-NAME_ _MTOOLS-USER_" data-id="'+user.userId+'" title="'+user.nickName+'">'+user.nickName+'</a></div>';
			}
			return h;
		},
		
		/**
		 * 渲染单个元素
		 */
		renderTalkPoolItem : function(friend,fixed) {
			if(!friend) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h , remove;
			remove = !fixed ? '<a class="_MTG-REMOVE_ _MTOOLS-REMOVE_" data-id="'+friend.userId+'">&nbsp;</a>' : '';
			h = '<div class="_MTG-LIST_" id="'+id+friend.userId+'TALK-POOL" data-id="'+friend.userId+'"><div class="_MTG-LIST-ITEM_"><a class="_MTG-ICON_"><img src="'+(head.small+friend.userName)+'"/></a><a class="_MTG-NAME_">'+friend.nickName+'</a>'+remove+'</div></div>';
			return h;
		},
		
		/**
		 * 渲染图片上传
		 */
		renderImageUpload : function(opts) {
			var queue = [] , options = {
				callback : function(){},
				uploadType : "photo",
				uploadUrl : undefined,
				flashUrl : undefined,
				targetId : undefined,
				sizeLimit : '200 KB',
				types : "*.jpg;*.gif;*.png;*.bmp"
			};
			
			options.done = function(code , data){
				switch(code) {
					case 401:
						//options.callback(code,"您没有选择图片哦~");
					break;
					case 402:
						options.callback(code,"一次只能上传一张图片哦~");
					break;
					case 403:
						options.callback(code,"图片大小只能在200 KB范围内哦，并且只能上传JPG|PNG|GIF|BMP的图片哦~");
					break;
					case 404:
						options.callback(code,"图片上传失败");
					break;
					case 200:
						options.callback(code,data);
					break;
					case 201:
						options.callback(code,"正在上传...");
					break;
				}
			};
			
			jBud.extend(options,opts);
			return this.renderUpload(options);
		},
		
		/**
		 * 上传附件
		 */
		renderAnnexUpload : function(opts){
			var queue = [] , options = {
				callback : function(){},
				uploadType : "file",
				uploadUrl : undefined,
				flashUrl : undefined,
				targetId : undefined,
				sizeLimit : '2 MB',
				types : "*.doc;*.docx;*.xls;*.xlsx;*.txt;*.ppt;*.pptx;*.zip;*.rar;*.tar;*.tar.gz"
			};
			
			options.done = function(code , data){
				switch(code) {
					case 401:
						//options.callback(code,"您没有选择文件哦~");
					break;
					case 402:
						options.callback(code,"一次只能上传一个文件哦~");
					break;
					case 403:
						options.callback(code,"文件大小只能在2 MB范围内哦，并且只能上传 doc|docx|xls|xlsx|txt|ppt|pptx|zip|rar|tar|tar.gz 的文件哦~");
					break;
					case 404:
						options.callback(code,"文件上传失败");
					break;
					case 200:
						options.callback(code,data);
					break;
					case 201:
						options.callback(code,"正在上传...");
					break;
				}
			};
			
			jBud.extend(options,opts);
			return this.renderUpload(options);
		},
		
		/**
		 * 上传统一接口
		 */
		renderUpload : function(opts) {
			var queue = [] , options = {
				done : function(){},
				uploadType : undefined,
				uploadUrl : undefined,
				flashUrl : undefined,
				targetId : undefined,
				sizeLimit:undefined,
				queueLimit : 1,
				types : undefined
			};
			
			jBud.extend(options,opts);
			
			var fileDialogStart = function(){
				while(queue.length > 0) {
					this.cancelUpload(queue.shift(),false);
				}
			};
			var uploadDialogComplete = function(selected, queued) {
				if(selected <= 0) {
					options.done(401);
					return ;
				}
				if(selected > 1) {
					options.done(402);
					return ;
				}
				if(selected == 1 && queued == 0) {
					options.done(403);
					return ;
				}
				options.done(201);
				this.startUpload();
			};
			var uploadStart = function(file) {
				//上传开始，阻止用户再添加文件
				this.setButtonDisabled(true);

				var _uploadBtn = jBud("#"+this.movieName).prev('button');
				if(options.uploadType == "photo"){
					_uploadBtn.addClass('_MBTN-ICON-IMAGE-GREY_');
				}else{
					_uploadBtn.addClass('_MBTN-ICON-ANNEX-GREY_');
				}

				return true;
			};
			var uploadError = function(file,code){
				if(code == -270) return ;
				options.done(404);
			};
			var uploadSuccess = function(file,data,response){
				var status = file.filestatus;
				if(status == SWFUpload.FILE_STATUS.COMPLETE) {
					options.done(200,jBud.parseJSON(data));
				} else {
					options.done(404);
				}

				//上传结束，用户可以重新选择文件
				this.setButtonDisabled(false);

				var _uploadBtn = jBud("#"+this.movieName).prev('button');
				if(options.uploadType == "photo"){
					_uploadBtn.removeClass('_MBTN-ICON-IMAGE-GREY_');
				}else{
					_uploadBtn.removeClass('_MBTN-ICON-ANNEX-GREY_');
				}
			};
			var fileQueued = function(file) {
				queue.push(file.id);
			};

			var swfconfig = {
				upload_url: options.uploadUrl,
				flash_url: options.flashUrl,
				file_size_limit: options.sizeLimit,
				file_types: options.types,
				file_queue_limit: options.queueLimit,
				post_params: {},
				button_placeholder_id: options.targetId ,
				button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
				button_cursor: SWFUpload.CURSOR.HAND,
				button_width: "30",
				button_height: "30",
				prevent_swf_caching: false,
        		preserve_relative_urls: false,
        		upload_error_handler: uploadError,
				upload_success_handler: uploadSuccess,
				upload_start_handler: uploadStart,
				file_dialog_complete_handler: uploadDialogComplete,
				file_queued_handler: fileQueued,
				file_dialog_start_handler: fileDialogStart
			};
			return new SWFUpload(swfconfig);
		},
		
		/**
		 *  渲染表情
		 */
		renderChatFaces : function(names, path , id , type){
			if(!names) return ;
			var h = '<ul class="_MFACE-ICONS_ _MCLEARFIX_">';
			for(var i = 0 ;i<names.length;i++){
				h += '<li><img src="'+path+names[i]+'.gif" class="_MFACE-ITEM_" data-id="'+id+'" data-type="'+type+'" data-face="'+names[i]+'" title="'+names[i]+'" alt="'+names[i]+'"/></li>';
			}
			h += '</ul>';
			return h;
		},
		
		/**
		 * 渲染应该具有的表情标记  
		 */
		renderFaceFlag : function(name) {
			if(!name) return '';
			return "[/"+name+"]";
		},
		
		/**
		 * 将光标出添加字符串
		 */
		renderLightToText : function(text,value) {
			if(!text || !value) return ;
			text.focus();
			if(document.selection){
				var sel = document.selection.createRange();  
	            sel.text = value;
	            sel.select();
			} else if (text.selectionStart || text.selectionEnd == '0') {
				var start = text.selectionStart;
				var end = text.selectionEnd;
				var top = text.scrollTop;
				text.value = text.value.substring(0, start) + value + text.value.substring(end, text.value.length);
				if (top > 0) {
					text.scrollTop = top;
				}
				text.selectionStart = text.selectionEnd = start+(value.length);
			} else {
				text.value += value;
			}
		},
		
		/**
		 *  转换表情
		 */
		parseFaces : function(context,names,path) {
			if(!context || !names || !path) return context;
			for(var i = 0;i<names.length;i++) {
				var name = names[i] , reg = new RegExp("\\[/"+name+"\\]","g");
				context = context.replace(reg,'<img src="'+path+name+'.gif"/>');
			}
			return context;
		},
		
		/**
		 * 渲染搜索结果
		 */
		renderSearch : function(results) {
			if(!results ) return '';
			var id = this.baseId , selector = this.selector , head = this.head , h , friends, talks;
			
			friends = results.friends , talks = results.talks;
			
			h = '<div class="_MPL-LIST_">';
			
			if(friends) {
				for(var key in friends) {
					var friend = friends[key];
					if(!friend) continue;
					h += '<div class="_MPL-LIST-ITEM_ "><a class="_MPL-ICON_"><img src="'+(head.small+friend.userName)+'"/></a><a class="_MPL-NAME_" data-id="'+friend.userId+'" data-type="1">'+friend.nickName+'</a></div>';
				}
			}
			
			if(talks) {
				for(var key in talks) {
					var talk = talks[key];
					if(!talk) continue;
					h += '<div class="_MPL-LIST-ITEM_ "><a class="_MPL-ICON_ _MICON-TALK_">&nbsp;</a><a class="_MPL-NAME_" data-id="'+talk.g_id+'" data-type="2">'+talk.title+'</a></div>';
				}
			}
			h += '<div class="_MPL-LIST-ITEM_ _MPL-LIST-MORE_"><a href="http://my.xuan.news.cn/friend/friendCenter.do?tag=menu-f" target="_blank">更多精确搜索</a></div>';
			h += '</div>';
			return h;
		},
		/*
		 * 获得样式
		 */
		getStyle : function(opts) {
			var bid = this.baseId , options = {
				href : undefined,
				callback : function(){},
				id : ""
			};
			
			jBud.extend(options,opts);
			
			var head = document.getElementsByTagName("head")[0];
			
			var link = document.createElement("link");
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = options.href;
			link.id = bid+options.id;
			
			// 取消对样式的 onload和onreadystatechange事件监听，在低版本FF，Safari中不支持该方法
			/*
			link.onload = function() {
				options.callback(true,link.id);
				link.onload = null;
			};
			
			link.onreadystatechange = function() {
				if(/loaded|complete/.test( link.readyState )){
					options.callback(true,link.id);
					link.onreadystatechange = null;
				}
			}
			*/
			
			head.appendChild(link);
			
			options.callback(true,link.id);
		},
		
		/**
		 * 渲染基础皮肤
		 */
		renderSkinBase : function(href,callback) {
			var id = this.getStyleId("base"), $base;
			$base = jBud("#"+this.baseId+id);
			if($base.length > 0) return  jBud.isFunction(callback) ? callback() : true;
			
			this.getStyle({
				href : href,
				id : id,
				callback : function(result) {
					if(result && jBud.isFunction(callback)) callback();
				}
			});
		},
		
		/**
		 * 渲染皮肤
		 */
		renderSkin : function(name,path,callback) {
			var id = this.getStyleId("skin") , $skin , url;
			
			url = path+name+"/message.skin.css";
			$skin = jBud("#"+this.baseId+id);
			
			if($skin.length > 0) {
				if($skin.attr("href") == url) return jBud.isFunction(callback) ? callback() : true;
				else $skin.remove();
			}
			
			this.getStyle({
				href : url,
				id : id ,
				callback : function(result){
					if(result && jBud.isFunction(callback)) callback();
				}
			});
		},
		
		/**
		 * 渲染皮肤列表
		 */
		renderSkinList : function(data) {
			if(!data) return '';
			var list = data.skins , path = data.path , name = "icon.png";
			var h = '';
			
			for(var i = 0; i <list.length;i++){
				h += '<li><img class="_MT-SKIN-ITEM_" src="'+path+list[i]+'/'+name+'" data-skin="'+list[i]+'"/></li>';
			}
			
			return h;
		},
		
		/**
		 * 渲染预览
		 */
		renderPreview : function() {
			var id = this.baseId , selector = this.selector;
			var h = '<div class="_MESSAGE-PREVIEW_" id="'+id+selector.preview+'"><div class="_MPREVIEW-LAYER_">&nbsp;</div><div class="_MPREVIEW-CONTENT_" id="'+id+selector.previewContent+'"><div class="_MPREVIEW-CLOSE_"></div></div></div>';
			return h;
		}
		
	} );
	
	module.exports = View;
});