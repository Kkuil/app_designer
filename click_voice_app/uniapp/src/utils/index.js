import {
	recordsHistoryApi,
	recordsPvOrUvApi
} from "@/api"
import {
	getUser
} from "./auth"
import pagesjson from "@/pages.json";

export const getLocal = (key) => uni.getStorageSync(key)


export const copy = (e) => uni.setClipboardData({
	data: e,
	success: function() {
		uni.showToast({
			icon: "none",
			title: "复制成功"
		})
	},
	fail: function(res) {
		console.error("Failed to copy data to clipboard: " + JSON.stringify(res));
	}
})


export const SavaImgToAlbum = (image) => {
	uni.authorize({
		/* scope.writePhotosAlbum 类型是保存到相册 */
		scope: 'scope.writePhotosAlbum',
		success() {
			uni.getImageInfo({
				src: image,
				success: image => uni.saveImageToPhotosAlbum({
					filePath: image.path,
					success: function() {
						uni.showModal({
							title: '保存成功',
							content: '图片已成功保存到相册',
							showCancel: false
						});
					},
					complete(res) {
						console.log(res);
					}
				})
			})
		},
		complete() {
			/* 判断如果没有授权就打开设置选项让用户重新授权 */
			uni.getSetting({
				success(res) {
					if (!res.authSetting['scope.writePhotosAlbum']) {
						uni.showModal({
							content: '没有授权保存图片到相册,点击确定去允许授权',
							success: function(res) {
								if (res.confirm) {
									/* 打开设置的API*/
									uni.openSetting({
										success(res) {
											console.log(res.authSetting);
										}
									});
								} else if (res.cancel) {
									uni.showModal({
										cancelText: '取消',
										confirmText: '重新授权',
										content: '你点击了取消，将无法进行保存操作',
										success: function(res) {
											if (res.confirm) {
												uni.openSetting({
													success(res) {
														/* 授权成功 */
														console.log(
															res
															.authSetting
															);
													}
												});
											} else if (res.cancel) {
												console.log('用户不授权');
											}
										}
									});
								}
							}
						});

					}
				}
			});
		}
	});


}

export function clickImg(urls, i = 0) {
	uni.previewImage({
		urls, //需要预览的图片http链接列表，多张的时候，url直接写在后面就行了
		current: i, // 当前显示图片的http链接，默认是第一个
		success: function(res) {},
		fail: function(res) {},
		complete: function(res) {},
	});
}


export function strToArray(str) {
	if (typeof str === "string" && str.length > 0) {
		const regex = /[;；]/;
		// 使用 filter 过滤掉空字符串
		return str.split(regex).filter(part => part.trim() !== "");
	}
	return []; // 返回空数组
}
export function replaceUnit(str) {
	const [start, end] = str.split(':')
	const startConverted = parseFloat(start) / 10000;
	const endConverted = parseFloat(end) / 10000;

	// 保留两位小数
	const startFormatted = startConverted.toFixed(2);
	const endFormatted = endConverted.toFixed(2);

	// 返回格式化的字符串
	if (end !== '0.00') {
		return `${startFormatted}万-${endFormatted}万`;
	} else {
		return `${startFormatted}万`;
	}
}


export function resetForm(form) {

	Object.keys(form).forEach(key => {
		const descriptor = Object.getOwnPropertyDescriptor(form, key);
		if (descriptor && descriptor.get) {
			// 是 computed 属性，跳过
			return;
		}
		if (typeof form[key] == "string") form[key] = ""
		else if (typeof form[key] == "number") form[key] = 0
		else if (typeof form[key] == "boolean") form[key] = false
		else if (typeof form[key] == "object") form[key] = {}
		else if (typeof form[key] == "array") form[key] = []

	})
}


export function handleShare(e) {
	console.log(e)
}



export function usePages() {
	// const style = reactive({});  
	function getCurrentPage() {
		const pages = getCurrentPages();
		// 某些特殊情况下(比如页面进行redirectTo时的一些时机)，pages可能为空数组  
		return `${pages[pages.length - 1]?.route ?? ""}`;
	}

	function getCurrentStyle() {
		const route = getCurrentPage();

		const getCurrentStyle = pagesjson.pages.find((item) => item.path == route);

		return getCurrentStyle.style ?? undefined;
	}

	function getCurrentTitle() {
		const style = getCurrentStyle();
		return style ? style.navigationBarTitleText : "";
	}

	return {
		getCurrentPage,
		getCurrentStyle,
		getCurrentTitle,
	};
}

export const log = (title) => {
	const user = getUser()
	const pageTitle = usePages().getCurrentTitle()

	if (user) {
		recordsHistoryApi({
			userId: user.sid,
			title: pageTitle
		})
	} else {
		recordsPvOrUvApi({
			type: '1',
			url: pageTitle
		})
	}
}

export async function drawImageWithWatermark(url, flag, id) {
	const context = uni.createCanvasContext(id);
	const image = new Image();

	try {
		if (/^https:\/\//.test(url)) {
			// 获取远程图片
			image.src = await fetchImage(url);
		} else {
			// 这里可以进行页面的截取逻辑
			const {
				windowWidth,
				windowHeight
			} = uni.getSystemInfoSync();
			const height = Math.round(windowWidth * (2000 / windowHeight));
			const width = windowWidth;
			context.drawImage(canvasId, 0, 0, width, height); // 假设有一个 canvasId 是当前页面的画布
		}

		image.onload = () => {
			const {
				windowWidth,
				windowHeight
			} = uni.getSystemInfoSync();
			const height = Math.round(windowWidth * (2000 / windowHeight));
			const width = windowWidth;

			// 绘制图片
			context.drawImage(image, 0, 50, width, height - 100); // 留出空间给上下文字

			// 添加上方文字
			context.setFontSize(30);
			context.setFillStyle('rgba(0, 0, 0, 1)'); // 黑色文字
			context.fillText('惺惺惜惺惺', width / 2 - 80, 30); // 上方文字位置

			// 添加下方文字
			context.setFontSize(30);
			context.setFillStyle('rgba(0, 0, 0, 1)'); // 黑色文字
			context.fillText('form 吾优留学小程序', width / 2 - 120, height - 30); // 下方文字位置

			// 绘制水印（仅在中心）
			if (flag) {
				context.setFontSize(30);
				context.setFillStyle('rgba(255, 0, 0, 0.5)'); // 半透明的红色
				context.fillText('水印文字', width / 2 - 50, (height - 100) / 2 + 50); // 水印位置
			}

			// 绘制
			context.draw();
		};
	} catch (error) {
		console.error('获取图片失败:', error);
	}
}


function fetchImage(src) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: src,
			responseType: 'arraybuffer', // 以二进制流获取
			success: (res) => {
				if (res.statusCode === 200) {
					const base64 = `data:${res.header['Content-Type']};base64,` + uni
						.arrayBufferToBase64(res.data);
					resolve(base64);
				} else {
					reject('图片加载失败');
				}
			},
			fail: () => {
				reject('请求失败');
			}
		});
	});
}