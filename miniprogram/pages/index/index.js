//index.js
//获取应用实例
const app = getApp()
const jinrishici = require('../../utils/jinrishici.js')
const request = require('../../utils/request.js');
let util = require('../../utils/util.js');
let touchDotX = 0;//X按下时坐标
let touchDotY = 0;//y按下时坐标
let interval;//计时器
let time = 0;//从按下到松开共多少时间*100

Page({
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        BlogName: app.globalData.BlogName,
        HaloUser: app.globalData.HaloUser,
        HaloPassword: app.globalData.HaloPassword,
        miniProgram: app.globalData.miniProgram,
				hasUserInfo: false,
				dailyPost:"",
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        userInfo: {},
        cardIdex: 1,
        randomNum: 0,
        animationTime: 1,
        moreFlag: false,
        pages: 0,
        cardCur: 0,
        TabCur: 0,
        scrollLeft: 0,
        openid: '',
        Role: '游客',
        roleFlag: false,
        adminOpenid: app.globalData.adminOpenid,
        colourList: [{
            colour: 'bg-red'
        }, {
            colour: 'bg-orange'
        }, {
            colour: 'bg-yellow'
        }, {
            colour: 'bg-olive'
        }, {
            colour: 'bg-green'
        }, {
            colour: 'bg-cyan'
        }, {
            colour: 'bg-blue'
        }, {
            colour: 'bg-purple'
        }, {
            colour: 'bg-mauve'
        }, {
            colour: 'bg-pink'
        }, {
            colour: 'bg-lightBlue'
        }],
        categories : [{name:"全部",slug:"all"}],
        isPasswordShow : false,
        password : null,
        secretUrl : null,
    },
    /**
     * 监听屏幕滚动 判断上下滚动
     */
    onPageScroll: function (event) {
        this.setData({
            scrollTop: event.detail.scrollTop
        })
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    onLoad: function () {

        // 在页面中定义插屏广告
				let interstitialAd = null;
				let that1 = this;
        // 在页面onLoad回调事件中创建插屏广告实例
        if (wx.createInterstitialAd) {
            interstitialAd = wx.createInterstitialAd({
                adUnitId: 'adunit-f117e72a7c599593'
            })
            interstitialAd.onLoad(() => { })
            interstitialAd.onError((err) => { })
            interstitialAd.onClose(() => { })
        }
        // 在适合的场景显示插屏广告
        if (interstitialAd) {
					// 前期屏蔽广告
            // interstitialAd.show().catch((err) => {
            //     console.error(err)
            // })
        }

				var urlPostList = app.globalData.url + '/api/content/posts';

        var token = app.globalData.token;
        var params = {
            page: 0,
            size: 100,//不带参数请求默认10条，又没有查所有文章的接口，所以先暂定100
            sort: 'createTime,desc',
        };
        var paramBanner = {
            page: 0,
            size: 5,
            sort: 'visits,desc',
				};

        // @todo 文章列表网络请求API数据
        request.requestGetApi(urlPostList, token, params, that1, that1.successPostList, that1.failPostList);
        // @todo 文章Banner网络请求API数据
        request.requestGetApi(urlPostList, token, paramBanner, that1, that1.successBanner, that1.failBanner);
        var urlAdminLogin = app.globalData.url + '/api/admin/login';
        var paramAdminLogin = {
            username: that1.data.HaloUser,
            password: that1.data.HaloPassword
        };
        // @todo 获取后台token网络请求API数据
        request.requestPostApi(urlAdminLogin, token, paramAdminLogin, that1, that1.successAdminLogin, that1.failAdminLogin);
        var urlCategoriesList = app.globalData.url + '/api/content/categories';
        // 查分类
        request.requestGetApi(urlCategoriesList, token, {sort:'createTime'}, that1, function(res){
            res.data.forEach(element => {
							that1.data.categories.push(element)
            });
            that1.setData({
                categories : that1.data.categories
            })
				}, null);

    },

    DotStyle(e) {
        this.setData({
            DotStyle: e.detail.value
        })
    },

    // towerSwiper
    // 初始化towerSwiper
    towerSwiper(name) {
        let list = this.data[name];
        for (let i = 0; i < list.length; i++) {
            list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
            list[i].mLeft = i - parseInt(list.length / 2)
        }
        this.setData({
            swiperList: list
        })
    },
    // towerSwiper触摸开始
    towerStart(e) {
        this.setData({
            towerStart: e.touches[0].pageX
        })
    },
    // towerSwiper计算方向
    towerMove(e) {
        this.setData({
            direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
        })
    },
    // towerSwiper计算滚动
    towerEnd(e) {
        let direction = this.data.direction;
        let list = this.data.swiperList;
        if (direction == 'right') {
            let mLeft = list[0].mLeft;
            let zIndex = list[0].zIndex;
            for (let i = 1; i < list.length; i++) {
                list[i - 1].mLeft = list[i].mLeft
                list[i - 1].zIndex = list[i].zIndex
            }
            list[list.length - 1].mLeft = mLeft;
            list[list.length - 1].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        } else {
            let mLeft = list[list.length - 1].mLeft;
            let zIndex = list[list.length - 1].zIndex;
            for (let i = list.length - 1; i > 0; i--) {
                list[i].mLeft = list[i - 1].mLeft
                list[i].zIndex = list[i - 1].zIndex
            }
            list[0].mLeft = mLeft;
            list[0].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        }
    },
    showModal(e) {
        console.log(e);
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    tabSelect(e) {
        this.randomNum();
        this.setData({
            postList: [],
        });
        var slug = e.currentTarget.dataset.slug;
        var url = slug != 'all'? "/api/content/categories/"+slug+"/posts" : "/api/content/posts";
        var urlPostList = app.globalData.url + url;
        var token = app.globalData.token;
        var params = {
            size: 100,
            sort: 'createTime,desc',
            password : wx.getStorageSync('password'),
        };
        //@todo 文章内容网络请求API数据
        request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
            secretUrl : slug
        });
    },
    
    switchSex: function (e) {
        // console.warn(e.detail.value);
        app.globalData.skin = e.detail.value
        console.log(app.globalData.skin)
        this.setData({
            skin: e.detail.value
        });
    }, 
    // 触摸开始事件
    touchStart: function (e) {
        touchDotX = e.touches[0].pageX; // 获取触摸时的原点
        touchDotY = e.touches[0].pageY;
        // 使用js计时器记录时间    
        interval = setInterval(function () {
            time++;
        }, 100);
    },
    // 触摸结束事件
    touchEnd: function (e) {
        let touchMoveX = e.changedTouches[0].pageX;
        let touchMoveY = e.changedTouches[0].pageY;
        let tmX = touchMoveX - touchDotX;
        let tmY = touchMoveY - touchDotY;
        if (time < 20) {
            let absX = Math.abs(tmX);
            let absY = Math.abs(tmY);
            if (absX > 2 * absY) {
                if (tmX < 0) {
                    this.setData({
                        modalName: null
                    })
                } else {
                    this.setData({
                        modalName: "viewModal"
                    })
                }
            }
            if (absY > absX * 2 && tmY < 0) {
                console.log("上滑动=====")
            }
        }
        clearInterval(interval); // 清除setInterval
        time = 0;
    },
    // 关闭抽屉
    shutDownDrawer: function (e) {
        this.setData({
            modalName: null
        })
    },
    //冒泡事件
    maopao: function (e) {
        console.log("冒泡...")
    },
    showMask: function (e) {
        this.selectComponent("#authorCardId").showMask();
        this.shutDownDrawer();
    },

    //获取随机数
    randomNum: function() {
        var num = Math.floor(Math.random() * 10);
        this.setData({
            randomNum: num
        });
    },

    /**
     * 加载更多
     */
    loadMore: function () {

    },



    /**
     * 文章Banner请求--接口调用成功处理
     */
    successBanner: function (res, selfObj) {
        var that = this;
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
        }
        that.setData({
            bannerPost: res.data.content,
        });
    },
    /**
     * 文章Banner请求--接口调用失败处理
     */
    failBanner: function (res, selfObj) {
        console.error('failBanner', res);
    },


    /**
     * 好文推荐请求成功
     */
		dailyPostUrlSuccess:function(res,selfObjec){
			var that = this;
			that.setData({
				dailyPost:res[0].title
			});
		},

    /**
     * 好文推荐请求-失败
     */
		dailyPostUrlError:function(res,selfObjec){
			var that = this;
			console.log("好文推荐请求-失败");
			that.setData({
				dailyPost:"不要停下脚步，继续前进，你一定能够到达成功的彼岸！"
			});
		},

    /**
     * 文章列表请求--接口调用成功处理
     */
    successPostList: function (res, selfObj) {
        var that = this;
        if(res.status != 403){
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
            if (list[i].title.length > 10) {
                list[i].title = list[i].title.substring(0, 14) + '...'
            }
        }
        that.setData({
            postList: res.data.content,
            moreFlag: res.data.content == "",
            pages: res.data.pages,
            noPostTitle : "作者会努力更新文章的 . . ."
        });
    }else{
        that.setData({
            moreFlag : true,
            isPasswordShow : true,
            noPostTitle : "该列表为私密列表，请输入访问密码后访问"
        });
        wx.showToast({
            title: '请输入正确密码',
            icon: 'none',
            duration: 2000,
            mask: true
          })
		}
				var dailyPostUrl = 'https://blog.runwsh.com/findTitle';
				// @todo 好文推荐获取数据
        request.requestGetApi(dailyPostUrl, null, null, that, that.dailyPostUrlSuccess, that.dailyPostUrlError);     
    },
    /**
     * 文章列表请求--接口调用失败处理
     */
    failPostList: function (res, selfObj) {
        console.error('failPostList', res)
    },

    /**
     * 后台登入请求--接口调用成功处理
     */
    successAdminLogin: function (res, selfObj) {
        var that = this;
        // that.setData({
        //     access_token: res.data.access_token,
        //     refresh_token: res.data.refresh_token
        // })
        app.globalData.adminToken = res.data.access_token;
        // clearTimeout(delay);
        // console.warn(res)
    },
    /**
     * 后台登入请求--接口调用失败处理
     */
    failAdminLogin: function (res, selfObj) {
        console.error('failAdminLogin', res)
    },

    /**
     * 搜索文章模块
     */
    Search: function(e) {
        var content = e.detail.value.replace(/\s+/g, '');
        // console.log(content);
        var that = this;
        that.setData({
            SearchContent: content,
        });
    },
    SearchSubmit: function (e) {
        // console.warn(this.data.SearchContent);

        var that = this;
        that.setData({
            postList: null,
        });

        var urlPostList = app.globalData.url + '/api/content/posts/search?sort=createTime%2Cdesc&keyword=' + this.data.SearchContent;
        var token = app.globalData.token;
        var params = {};


        //@todo 搜索文章网络请求API数据
        request.requestPostApi(urlPostList, token, params, this, this.successSearch, this.failSearch);
    },
    successSearch: function (res, selfObj) {
        var that = this;
        // console.warn(res.data.content);
        var list = res.data.content;
        for (let i = 0; i < list.length; ++i) {
            list[i].createTime = util.customFormatTime(list[i].createTime, 'Y.M.D');
        }
        if (res.data.content != "") {
            that.setData({
                postList: res.data.content,
                moreFlag: false,
                pages: res.data.pages,
            });
        } else {
            that.setData({
                postList: res.data.content,
                moreFlag: true,
                pages: res.data.pages,
            });
        }
    },
    failSearch: function (res, selfObj) {
        console.error('failSearch', res)
    },

    /**
    * 用户点击右上角分享
    */
    onShareAppMessage: function () {
        return {
            title: this.data.jinrishici,
            path: '/pages/index/index',
            imageUrl: 'https://runwsh.com/upload/2022/06/AI.png',
        }
		},
		    /**
     * 用户点击右上角分享朋友圈
     */
    onShareTimeline: function () {
			// console.warn(this.data.postId);
			return {
					title: this.data.jinrishici,
					path: '/pages/index/index',
					imageUrl: 'https://runwsh.com/upload/2022/06/AI.png',
			}
		},
    hidePasswordModal(e) {
        this.setData({
          isPasswordShow: false
        })
    },
    clickPassword (e){

        this.setData({
            isPasswordShow: false
        })
        wx.setStorageSync('password',this.data.password)
        this.randomNum();
        this.setData({
            postList: [],
        });
        var urlPostList = app.globalData.url + "/api/content/categories/"+this.data.secretUrl+"/posts";
        var token = app.globalData.token;
        var params = {
            size: 100,
            sort: 'createTime,desc',
            password : wx.getStorageSync('password')
        };
        //@todo 文章内容网络请求API数据
        request.requestGetApi(urlPostList, token, params, this, this.successPostList, this.failPostList);
        this.setData({
            TabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id - 1) * 60
        });
    },
    inputPassword(e){
        this.setData({
            password: e.detail.value
        })
    }
    
})

