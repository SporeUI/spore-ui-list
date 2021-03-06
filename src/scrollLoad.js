/**
下滑更新列表

@example

var list = ScrollLoad({
	listNode : $('ul.list'),
	loadingNode : $('.loading')
});

list.request = function(page){
	var that = this;

	var para = {};
	para.page = page;

	if(that.requesting){return;}
	that.requesting = true;

	$.ajax({
		type : 'POST',
		url : '/api/list',
		data : para,
		timeout : 10000,
		dataType : 'json',
		complete : function(){
			that.requesting = false;
		},
		success : function(rs){
			if(rs && rs.data){
				if(rs.page >= rs.finalPage){
					that.loadedAll = true;
				}
				that.append(rs.data);
			}
		}
	});
};

list.render = function(data){
	var html = [];
	$.each(data, function(key, item){
		html.push('<li>' + item.name + '</li>');
	});
	return html.join('');
};

list.init();

**/

var $win = $(window);

function ScrollLoad(options) {
	var that = {};

	var conf = $.extend(
		{
			curPage: 1,
			listNode: null,
			loadingNode: null,
			loadedNode: null
		},
		options
	);

	that.listNode = $(conf.listNode);
	that.loadingNode = $(conf.loadingNode);
	that.loadedNode = $(conf.loadedNode);

	function setLoading() {
		if (that.loadedAll) {
			that.loadingNode.hide();
			that.loadedNode.show();
		} else {
			that.loadedNode.hide();
			that.loadingNode.show();
		}
	}

	function checkScroll() {
		if (that.loadingNode.offset().top < window.innerHeight + window.scrollY) {
			that.setLoading();
			if (that.loadedAll) {
				$win.off('scroll', that.checkScroll);
			} else {
				that.request(that.curPage + 1);
			}
		}
	}

	function append(data) {
		data = data || {};
		var html = that.render(data) || '';
		html = html.trim();
		if (html) {
			that.listNode.append($(html));
		}

		that.curPage++;
		that.checkScroll();
	}

	function setEvents() {
		$win.on('scroll', that.checkScroll);
	}

	function reset() {
		that.curPage = conf.curPage;
		that.listNode.html('');
		that.setLoading();
		if (that.loadedAll) {
			that.setEvents();
		}
		that.loadedAll = false;
		that.checkScroll();
	}

	function init() {
		that.curPage = conf.curPage;
		that.loadedAll = false;
		that.checkScroll();
		that.setEvents();
	}

	that.init = init;

	// 用于覆盖
	that.request = function(page) {};
	that.render = function(data) {};

	that.setEvents = setEvents;
	that.reset = reset;
	that.append = append;
	that.checkScroll = checkScroll;
	that.setLoading = setLoading;
	return that;
}

module.exports = ScrollLoad;

