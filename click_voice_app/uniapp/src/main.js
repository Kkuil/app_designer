// #ifndef VUE3
import Vue from 'vue'
import share from './common/share.js'
Vue.mixin(share)
// #endif



import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import 'virtual:windi.css'


export function createApp() {
	const app = createSSRApp(App);
	return {
		app,
	};
}