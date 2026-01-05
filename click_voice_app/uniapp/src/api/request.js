import {
	PRODCUT_URL,
	BASE_URL,
	TEST_URL
} from "../config"

let loadingCount = 0; // 计数器
let lastRequestTime = 0; // 上一个请求的时间戳

function showLoading() {
	const currentTime = Date.now();
	if (loadingCount === 0 || currentTime - lastRequestTime > 2000) {
		uni.showLoading();
		lastRequestTime = currentTime; // 更新上一个请求时间
	}
	loadingCount++;
}

function hideLoading() {
	loadingCount--;
	if (loadingCount <= 0) {
		loadingCount = 0; // 确保计数器不为负
		uni.hideLoading();
	}
}

function request(url, method, data, opt, loading = true) {
	if (loading) showLoading(); // 仅在加载时调用 showLoading
	const token = uni.getStorageSync("token");

	const header = {
		...opt
	};
	if (token) header.Authorization = token;

	return new Promise((resolve, reject) => {
		uni.request({
			// url: PRODCUT_URL + url,
			// url: TEST_URL + url,
			url: BASE_URL + url,
			method,
			data,
			header,
			success: (res) => {
				const {
					code,
					msg,
					data
				} = res.data;
				if (code == 20000) {
					resolve(data, msg);
				} else if (code == 401) {
					uni.showToast({
						title: "请先登录",
						icon: "error"
					});
					setTimeout(() => {
						uni.navigateTo({
							url: "/pages/login/login"
						});
						uni.clearStorage();
					}, 1000)
				} else {
					console.log(msg)
					resolve(res.data);
				}
				console.log(code);
			},
			fail: (err) => {
				console.log('xxx')
				let title = err.message || '出现了一个错误'; // 使用默认消息

				reject(title);
			},
			complete: () => {
				if (loading) hideLoading(); // 在请求完成后调用 hideLoading
			}
		});
	});
}

['get', 'post', 'delete', 'put'].forEach(el => {
	request[el] = async function(url, data, opt, loading = true) {
		console.log(data)
		return request(url, el, data, opt, loading);
	}
});

export default request;
