import $ from 'jquery'
require('../css/index.less')


var top250 = {
    init: function () {
        this.$tabs = $('footer>div');
        this.$panels = $('main>section');
        this.index = 0;
        this.dataArrived = false; //加锁用以减少请求次数
        this.clock;
        this.end = false;
        this.bind();
        this.start();
        this.scroll();
    },
    bind: function () {
        var _self = this;
        this.$tabs.on('click', function () {
            var index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active')
            _self.$panels.hide().eq(index).fadeIn();
        })
    },
    start: function () {
        if (this.dataArrived) {
            return
        }
        this.dataArrived = true;
        $('div.loading').show()
        $.ajax({
            url: 'http://api.douban.com/v2/movie/top250',
            type: 'GET',
            data: {
                start: this.index || 0,
                count: 20
            },
            dataType: 'jsonp' //不支持CORS跨域，设置为jsonp可以直接使用
        }).done((ret) => {
            this.index += 20;
            if (this.index >= (ret.total - 200)) {
                this.end = true;
                $('.top-ct .end').show()
            }
            common.render(ret,$('.top'))
        }).fail(function (err) {
            console.log('请求失败', err)
        }).always(() => {
            this.dataArrived = false;
            $('div.loading').hide()
        })
    },

    //函数节流优化后
    scroll: function () {
        $('main').scroll(() => {
            if (this.end) {
                return
            }
            if (this.clock) {
                clearTimeout(this.clock)
            }
            this.clock = setTimeout(() => {
                if ($('main').scrollTop() + $('main').height() >= $('.top').height() - 30) {
                    this.start()
                }
            }, 300)
        })
    }
}

//===================北美==================
var northUS = {
    init: function () {
        this.dataArrived = false; //加锁用以减少请求次数
        this.clock;
        this.end = false;
        this.start();
    },
    start: function () {
        if (this.dataArrived) {
            return
        }
        this.dataArrived = true;
        $('div.loading').show()
        $.ajax({
            url: 'http://api.douban.com/v2/movie/us_box',
            type: 'GET',
            dataType: 'jsonp' //不支持CORS跨域，设置为jsonp可以直接使用
        }).done((ret) => {
            common.render(ret,$('.northUS'))
            $('.northUS-ct .end').show()
        }).fail(function (err) {
            console.log('请求失败', err)
        }).always(() => {
            this.dataArrived = false;
            $('div.loading').hide()
        })
    }
}
//===========search=============
var search = {
    init: function () {
        this.dataArrived = false; //加锁用以减少请求次数
        this.clock;
        this.end = false;
        this.searchVal = $('.search-ct input').val();
        this.start(this.searchVal)
    },
    start: function (val) {
        if (this.dataArrived) {
            return
        }
        this.dataArrived = true;
        $('div.loading').show()
        $.ajax({
            url: 'http://api.douban.com/v2/movie/search',
            data: {
                q: val
            },
            type: 'GET',
            dataType: 'jsonp' //不支持CORS跨域，设置为jsonp可以直接使用
        }).done((ret) => {
            console.log('请求成功')
            console.log(ret)
            common.render(ret,$('.search-ct .content'))
        }).fail(function (err) {
            console.log('请求失败', err)
        }).always(() => {
            this.dataArrived = false;
            $('div.loading').hide()
        })
    }
}


var common = {
    render: function (data,$list) {
        data.subjects.forEach((movie) => {
            var movie = movie.subject || movie;
            var tpl = `
        <div class="item">
				<a class="doubanL" href="">
					<div class="cover">
						<img src="" alt="">
					</div>
					<div class="detail">
						<h2></h2>
						<div class="extra">
                            <span class="score"> 
                                <span class="highLight"></span>分
                            </span>
                            <span class="collection"></span></div>
						<div class="extra"><span class="year"></span> <span class="type">${movie.genres.join('/')}</span></div>
                        <div class="extra">
                            <span class="directors">
                            </span>    
                        </div>
                        <div class="extra">
                            <span class="casts"></span>
                        </div>
					</div>
				</a>
		</div>
        `;
            var $node = $(tpl);
            $node.find('.cover img').attr('src', movie.images.small)
            $node.find('.detail h2').text(movie.title)
            $node.find('.doubanL').attr('href', movie.alt)
            $node.find('.detail .highLight').text(movie.rating.average)
            $node.find('.detail .collection').text(movie.collect_count + '收藏')
            $node.find('.detail .year').text(movie.year + '年')

            $node.find('.detail .directors').text(() => {
                var directors = [];
                movie.directors.forEach((item) => {
                    directors.push(item.name)
                })
                return ('导演: ' + directors.join('、'))
            })

            $node.find('.detail .casts').text(() => {
                var casts = [];
                movie.casts.forEach((item) => {
                    casts.push(item.name)
                })
                return ('演员: ' + casts.join('、'))
            })
            $list.append($node)
        })
    },
}
top250.init();
northUS.init();
$('.search-ct button').on('click', search.init.bind(search))

