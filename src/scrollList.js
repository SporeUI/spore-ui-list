/**
下滑更新列表

@example

var list = ScrollList({
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

var $win = window;

function ScrollList(options) {
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
		if (that.loadingNode.offset().top < $win.innerHeight + $win.scrollY) {
			that.setLoading();
			if (that.loadedAll) {
				$($win).off('scroll', that.checkScroll);
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

	function init() {
		that.curPage = conf.curPage;
		that.loadedAll = false;
		that.checkScroll();
		$($win).on('scroll', that.checkScroll);
	}

	that.init = init;

	// 用于覆盖
	that.request = function(page) {};
	that.render = function(data) {};

	that.append = append;
	that.checkScroll = checkScroll;
	that.setLoading = setLoading;
	return that;
}

module.exports = ScrollList;

