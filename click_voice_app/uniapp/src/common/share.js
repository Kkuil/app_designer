export default {
	data() {
		return {
			//设置默认的分享参数
			share: {
				title: '333333',
				path: '/pages/index/index',
				// imageUrl: '',
				// desc: '111111',
				// content: '22222'
			}
		}
	},
	onShareAppMessage(res) {
		return {
			title: this.share.title,
			path: this.share.path,
			// imageUrl: this.share.imageUrl,
			// desc: this.share.desc,
			// content: this.share.content,
			success(res) {
				uni.showToast({
					title: '分享成功'
				})
			},
			fail(res) {
				uni.showToast({
					title: '分享失败',
					icon: 'none'
				})
			}
		}
	},
	onShareTimeline() {},
}