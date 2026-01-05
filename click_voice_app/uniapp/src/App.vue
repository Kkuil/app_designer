<script setup lang="ts">
	import { onLaunch, onShow, onHide, onUnload } from "@dcloudio/uni-app";
	import { PRODCUT_URL } from "./config";
	import { getUser } from "./utils/auth";
	import { logoutApi } from "./api";
	// uni.loadFontFace({
	// 	global: true,
	// 	family: "Ping Fang",
	// 	source: `url("${PRODCUT_URL}/static/PingFangSC-Light.ttf")`,
	// 	success() {
	// 		console.log("success");
	// 	},
	// 	fail(err) {
	// 		console.log("fail");
	// 		console.log(err);
	// 	},
	// 	complete() {
	// 		console.log("complete");
	// 	},
	// });

	onLaunch(() => {
		console.log("App Launch");

		// 获取小程序启动参数
	const launchOptions = uni.getLaunchOptionsSync();
	const sceneMapping = {
		1020: "公众号 profile 页相关小程序列表 - 来源公众号",
		1035: "公众号自定义菜单 - 来源公众号",
		1036: "App 分享消息卡片 - 来源App",
		1037: "小程序打开小程序 - 来源小程序",
		1038: "从另一个小程序返回 - 来源小程序",
		1043: "公众号模板消息 - 来源公众号",
	};

	// 获取场景值
	const sceneValue = launchOptions?.scene;

	// 根据场景值获取对应信息
	const userOrgian = sceneMapping[sceneValue] || "未识别的来源";

	// 将来源信息存储到 localStorage（改为异步方式）
	uni.setStorage({
		key: "userOrgian",
		data: userOrgian,
		success: () => {
			console.log("来源信息已保存");
		},
		fail: (err) => {
			console.error("来源信息保存失败", err);
		}
	});
	});
	onShow(() => {
		console.log("App Show");
	});
	onHide(() => {
		console.log("App Hide");
	});
	onUnload(() => {
		const user = getUser();
		if (user.sid) logoutApi(user.sid);
	});
</script>
<style>
	.btn {
		@apply bg-[#63B5FB] bg-gradient-to-br from-[#72C2FE] to-[#4497F3] text-white px-12 py-3 rounded-4xl text-sm shadow-md mt-16 mb-22;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	
	view::-webkit-scrollbar {
		display: none;
	}

	scroll-view ::-webkit-scrollbar {
		display: none;
		width: 0 !important;
		height: 0 !important;
		-webkit-appearance: none; 
		background: transparent;
	}
</style>