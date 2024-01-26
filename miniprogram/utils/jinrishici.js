/**
 * 今日诗词V2 Mini-Program-SDK 1.0
 * https://www.jinrishici.com
 */
let waitingQueue = []
let lock = false
const load = callback => {
  getTokenAndDo(token => {
    wx.request({
      url: 'https://blog.runwsh.com/findTitle',
      header: {
        'X-User-Token': token
      },
      success: res => {
        if (res.data.length > 0) {
          callback(res.data[0])
        } else {
          console.error("今日诗词API 获取古诗词 失败，错误原因：" + res.data.errMessage)
        }
      },
      fail: () => {
        console.error("今日诗词-小程序SDK 获取古诗词失败，可能是网络问题或者您没有添加到域名白名单")
      }
    })
  })
}
module.exports = {
  load: load
}