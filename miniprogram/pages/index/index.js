const defaultavatar = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp() // 全局APP
let that = null // 页面this指针
Page({
  data: {
		motto: '谨此纪念',
		heroes:[{name: '刘*男', job:'电子厂'}, {name: '何*淘', job:'互联网'}, {name: '吴同学', job:'互联网'}, {name: '张*霏', job:'互联网'}, {name: '孙伯伯', job:'物流'}, {name: '朱**', job:'装饰材料'}, {name: '陈**', job:'电器'}, {name: '赵*', job:'设计'},{name: '陈同学', job:'医务人员'}],
		candle: "../../pic/candle-dark.png",
    project: {},
    input: {},
    form: {
      show: false
    }
	},
	
	shuffle (){
		var n = this.data.heroes.length, t, i;
    while (n) {
      i = Math.random() * n-- | 0; // 0 ≤ i < n
      t = this.data.heroes[n];
      this.data.heroes[n] = this.data.heroes[i];
			this.data.heroes[i] = t;
			that.setData({heroes: this.data.heroes})
    }
	},
  /**
   * 页面加载
   */
  onLoad (options) {
    that = this // 页面this指向指针变量
    that.id = options.id
		// wx.startPullDownRefresh()
		
		that.shuffle()
    that.init() // 初始化
	},
	
  onPullDownRefresh () {
		that.init()
		that.shuffle()
		wx.stopPullDownRefresh()
  },
  /**
   * 初始化加载信息
   */
  async init () {
    const { code, data, user, userid, msg, sign_num } = await app.call({ name: 'get_project', data: { id: that.id } })
    if (code === 0) {
      app.project = data
      that.userid = userid
      const stylecss = app.pagestyleinit(app.project)
			const inputs = {}
			var candle_lit = user.info != undefined ? user.info.is_lit : false
      that.setData({
        stylecss: stylecss,
        project: app.project,
        input: inputs,
        user: user,
				sign_num,
				candle: candle_lit ? "../../pic/candle-lit.png" : "../../pic/candle-dark.png"
			})
    }
  },

  ininput (e) {
    const { info } = e.currentTarget.dataset
		const key = `input.${info.id}`
    let value = null
    if (e.type === 'chooseavatar') {
      wx.showLoading({ title: '加载中' })
      app.cloud().then(cloud=>{
				cloud.uploadFile({
					cloudPath: `./avatar/${that.data.project._id}/${that.userid}.jpg`,
					filePath: e.detail.avatarUrl
				}).then(res => {
					wx.hideLoading()
					that.setData({
						[key]: res.fileID
					})
				})
			})
    } else if (e.type === 'change') {
      value = info.selects[e.detail.value]
    } else if (e.type === 'cancel') {
      value = ''
    } else if (e.type === 'input') {
      value = e.detail.value
    }
    if (value != null) {
      that.setData({
        [key]: value
      })
    }
	},
	
  startsign () {
		var lit = this.data.user.info != undefined ? this.data.user.info.is_lit : false
		// var lit = !this.data.user.info.is_lit
    that.setData({
			'input.is_lit': !lit,
			'user.open': 1
		})
		that.submit()
	},

	onShareAppMessage () {
    return {
      title: '纪念每一位竭力燃耗的劳动者',
      path: `pages/index/index?id=${that.id||'INIT'}`,
      imageUrl: that.data.project.topimg
    }
	},
	
	onShareTimeline (){

	},
	
  tosignlist () {
    wx.navigateTo({
      url: '../list/list'
    })
	},

	async submit () {
		wx.showLoading({ title: '请稍等' })
		var lit = that.data.user.info != undefined ? that.data.user.info.is_lit : false
		const { input, project } = that.data
		const submitres = await app.call({ name: (!lit ? 'add_sign': 'del_sign'), data: { id: project._id, input } })
		if(submitres.code === 0){
			await that.init()
		}
		wx.hideLoading()
	},
})

function showModal (content, title = '', obj = {}) {
  return new Promise((resolve) => {
    wx.showModal({
      cancelText: obj.cancelText || '取消',
      confirmColor: that.data.project?.style?.backgroudColor || '#07c041',
      confirmText: obj.confirmText || '确定',
      title: title,
      content: content,
      editable: obj.editable || false,
      placeholderText: obj.placeholderText || '',
      showCancel: obj.showCancel,
      success (res) {
        if (res.confirm) {
          resolve(res.content || true)
        } else {
          resolve(false)
        }
      },
      fail (e) {
        console.log(e)
        resolve(false)
      }
    })
  })
}
