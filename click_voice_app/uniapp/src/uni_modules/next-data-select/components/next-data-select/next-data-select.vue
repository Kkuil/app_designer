<template>
	<view class="next-stat__select">
		<span v-if="label" class="next-label-text">{{label + '：'}}</span>
		<view class="next-stat-box" :class="{'next-stat__actived': current}">
			<view class="next-select" :style="{height:multiple?'100%':' 35px'}"
				:class="{'next-select--disabled':disabled}">
				<view class="next-select__input-box" :style="{height:multiple?'100%':'35px'}" @tap.stop @click.stop="toggleSelector">
					<view class="" style="display: flex;flex-wrap: wrap;width: 100%;align-items: center;" v-if="multiple&&current.length>0">
						<view class="tag-calss"
							v-for="(item,index) in collapseTags?current.slice(0,collapseTagsNum):current"
							:key="item[optionsValueKey]">
							<span class="text">{{item[optionsLabelKey]}}</span>
							<view class="" @click.stop="delItem(item)">
								<text style="margin-left: 4px;vertical-align: middle;" color="#c0c4cc" class="icon">&#xe61c;</text>
							</view>
						</view>
						<view v-if="current.length>collapseTagsNum&&collapseTags" class="tag-calss">
							<span class="text">+{{current.length-collapseTagsNum}}</span>
						</view>
						<input v-if="filterable&&!disabled" @input="inputChange" class="next-select__input-text"
							type="text" style="font-size: 12px;height: 52rpx;box-sizing: border-box;margin-left: 6px;width: auto;"
							placeholder="请输入" v-model="filterInput">
					</view>
					<view v-else-if="current&&current.length>0&&(!showSelector || (!multiple && !filterable))" class="next-select__input-text">
						{{current}}
					</view>
					<input v-else-if="filterable&&showSelector" :focus="isFocus" @input="inputChange"
						:disabled="disabled" @click.stop="" class="next-select__input-text" type="text"
						style="font-size: 12px;position: absolute;z-index: 1;" :placeholder="placeholderOld"
						v-model="filterInput">
					<view v-else class="next-select__input-text next-select__input-placeholder">{{placeholder}}</view>
						
					<text @click="clearVal" v-if="(current.length>0 && clear&&!disabled)||(currentArr.length>0&&clear&&!disabled)" style="position: absolute;right: 0;font-size: 24px;z-index:2" class="icon">&#xe61c;</text>		
					<text v-else-if="showSelector" class="icon" style="right: 5px;position: absolute;font-size: 14px">&#xe619;</text>
					<text v-else class="icon" style="right: 5px;position: absolute;font-size: 14px">&#xe617;</text>
				</view>
				<view class="next-select--mask" v-if="showSelector" @click="toggleSelector" />
				<view @tap.stop class="next-select__selector" v-if="showSelector">
					<view class="next-popper__arrow"></view>
					<scroll-view scroll-y="true" class="next-select__selector-scroll">
						<view class="next-select__selector-empty" v-if="filterLocalData.length === 0">
							<span>{{emptyTips}}</span>
						</view>
						<view v-else :style="currentArr.includes(item[optionsValueKey]) ? 'color:' + themeColor : ''" :class="['next-select__selector-item', {'next-select_selector-item_active' :currentArr.includes(item[optionsValueKey])}]"
							style="display: flex;justify-content: space-between;align-items: center;"
							v-for="(item,index) in filterLocalData" :key="index" @click.stop="change(item)">
							<span
								:class="{'next-select__selector__disabled': item[optionsDisabledKey]}">{{formatItemName(item)}}</span>
							<text :style="'color:' + themeColor" v-if="currentArr.includes(item[optionsValueKey])" class="icon">&#xe6cf;</text>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "next-data-select",
		props: {
			collapseTagsNum: {
				type: Number,
				default: 1
			},
			collapseTags: {
				type: Boolean,
				default: false
			},
			options: {
				type: Array,
				default () {
					return []
				}
			},
			optionsLabelKey: {
				type: String,
				default: 'text'
			},
			optionsValueKey: {
				type: String,
				default: 'value'
			},
			optionsDisabledKey: {
				type: String,
				default: 'disabled'
			},
			multiple: {
				type: Boolean,
				default: false
			},
			filterable: {
				type: Boolean,
				default: false
			},
			// #ifndef VUE3
			value: {
				type: [String, Number, Array],
				default: ''
			},
			// #endif
			// #ifdef VUE3
			modelValue: {
				type: [String, Number, Array],
				default: ''
			},
			// #endif
			label: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '请选择'
			},
			emptyTips: {
				type: String,
				default: '无选项'
			},
			clear: {
				type: Boolean,
				default: true
			},
			disabled: {
				type: Boolean,
				default: false
			},
			// 格式化输出 用法 field="_id as value, version as text, uni_platform as label" format="{label} - {text}"
			format: {
				type: String,
				default: ''
			},
			themeColor: { // 主题颜色
				type: String,
				default: '#f9ae3d' // #f9ae3d
			},
		},
		data() {
			return {
				showSelector: false,
				current: [],
				localData: [],
				apps: [],
				channels: [],
				cacheKey: "next-data-select-lastSelectedValue",
				placeholderOld: "",
				currentArr: [],
				filterInput: "",
				isFocus: false
			};
		},
		created() {
			this.init();
		},
		computed: {
			filterLocalData() {
				if (this.filterable && this.filterInput) {
					return this.localData.filter(e => e[this.optionsLabelKey].includes(this.filterInput))
				} else {
					return this.localData
				}
			}
		},
		watch: {
			options: {
				immediate: true,
				handler(val, old) {
					if (Array.isArray(val) && old !== val) {
						this.localData = val || [];
						this.init();
					}
				}
			},
			// #ifdef VUE3
			modelValue() {
				this.init();
			},
			// #endif
			// #ifndef VUE3
			value() {
				this.init();
			},
			// #endif
		},
		methods: {
			init() {
				if (this.multiple) {
					// #ifndef VUE3
					this.currentArr = this.value || []
					// #endif
					// #ifdef VUE3
					this.currentArr = this.modelValue || []
					// #endif
					if (this.current.length > 0) {
						this.current = []
					}
					// #ifndef VUE3
					if (this.value && this.value.length > 0 && this.filterLocalData.length > 0) {
						this.current = this.value.map(item => {
							let current = this.localData.find(e =>
								e[this.optionsValueKey] == item
							)
							return {
								...current
							}
						})
					}
					// #endif
					// #ifdef VUE3
					if (this.modelValue && this.modelValue.length > 0 && this.filterLocalData.length > 0) {
						this.current = this.modelValue.map(item => {
							let current = this.localData.find(e =>
								e[this.optionsValueKey] == item
							)
							return {
								...current
							}
						})
					}
					// #endif
				
				} else {
				
					// #ifndef VUE3
					if (this.value || this.value == 0) {
						this.current = this.formatItemName(this.filterLocalData.find(e =>
							e[this.optionsValueKey] == this.value
						))
						this.currentArr = [this.value]
					}
					// #endif
					// #ifdef VUE3
					if (this.modelValue || this.value == 0) {
						this.current = this.formatItemName(this.filterLocalData.find(e =>
							e[this.optionsValueKey] == this.modelValue
						))
						this.currentArr = [this.modelValue]
						if(!this.current) {
							this.current = this.modelValue
						}
					}
					// #endif
				}
				this.placeholderOld = this.placeholder
			},
			debounce(fn, time = 100) {
				let timer = null
				return function(...args) {
					if (timer) clearTimeout(timer)
					timer = setTimeout(() => {
						fn.apply(this, args)
					}, time)
				}
			},
			/**
			 * @param {[String, Number]} value
			 * 判断用户给的 value 是否同时为禁用状态
			 */
			isDisabled(value) {
				let isDisabled = false;

				this.localData.forEach(item => {
					if (item[this.optionsValueKey] === value) {
						isDisabled = item[this.optionsDisabledKey]
					}
				})
				return isDisabled;
			},
			inputChange(e) {
				this.$emit('inputChange', e.detail.value)
			},
			clearVal() {
				if (this.disabled) {
					return
				}
				if (this.multiple) {
					this.current = []
					this.currentArr = []
					this.emit([])
				} else {
					this.current = ""
					this.currentArr = []
					this.emit('')
				}
				this.placeholderOld = this.placeholder
				this.filterInput = ""
			},
			change(item) {
				if (!item[this.optionsDisabledKey]) {
					this.showSelector = false
					if (this.multiple) {
						if (!this.current) {
							this.current = []
						}
						if (!this.currentArr) {
							this.currentArr = []
						}
						if (this.currentArr.includes(item[this.optionsValueKey])) {
							let index = this.current.findIndex(e => {
								return e[this.optionsValueKey] == item[this.optionsValueKey]
							})
							this.current.splice(index, 1)
							this.currentArr.splice(index, 1)
							this.emit(this.current)
						} else {
							this.current.push(item)
							this.currentArr.push(item[this.optionsValueKey])
							this.emit(this.current)

						}
						this.filterInput = ""
					} else {
						this.current = this.formatItemName(item)
						this.currentArr = [item[this.optionsValueKey]]
						if (this.filterable) {
							this.filterInput = item[this.optionsLabelKey]
						}
						this.emit(item[this.optionsValueKey])
					}
				}
			},
			delItem(item) {
				if (this.disabled) {
					return
				}
				if (this.currentArr.includes(item[this.optionsValueKey])) {
					let index = this.current.findIndex(e => {
						return e[this.optionsValueKey] == item[this.optionsValueKey]
					})
					this.current.splice(index, 1)
					this.currentArr.splice(index, 1)
					this.emit(this.current)
				}
			},
			emit(val) {
				if (this.multiple) {
					this.$emit('input', this.currentArr)
					this.$emit('update:modelValue', this.currentArr)
					const currentArr = this.localData.filter(item => this.currentArr.includes(item[this
						.optionsValueKey]))
					this.$emit('change', currentArr)
				} else {
					this.$emit('input', val)
					this.$emit('update:modelValue', val)
					const current = this.localData.find(item => val == item[this.optionsValueKey])
					this.$emit('change', current)
				}
			},
			toggleSelector() {
				if (this.disabled) {
					return
				}
				this.showSelector = !this.showSelector
				this.isFocus = this.showSelector
				if (this.filterable && this.current && this.showSelector) {
					if (!this.multiple) {
						this.placeholderOld = this.current
						// this.filterInput = ""
					}
				} else if (this.filterable && !this.current && !this.showSelector) {
					if (this.placeholderOld != this.placeholder) {
						if (!this.multiple) {
							this.current = this.placeholderOld
						}
					}
				}
				this.filterInput = ""

			},
			formatItemName(item) {
				if (!item) {
					return ""
				}
				let text = item[this.optionsLabelKey]
				if (this.format) {
					// 格式化输出
					let str = "";
					str = this.format;
					for (let key in item) {
						str = str.replace(new RegExp(`{${key}}`, "g"), item[key]);
					}
					return str;
				} else {
					return text || '';
				}
			}
		}
	}
</script>

<style lang="scss">
	@font-face {
		font-family: 'iconfont';
		src: url('//at.alicdn.com/t/c/font_4110624_3hfahswu4mf.ttf?t=1695353456719') format('truetype');
	}
	.icon {
		font-family: iconfont;
		font-size: 32upx;
		font-style: normal;
		color: #999;
	}
	
	$next-base-color: #6a6a6a !default;
	$next-main-color: #333 !default;
	$next-secondary-color: #909399 !default;
	$next-border-3: #e5e5e5;


	/* #ifndef APP-NVUE */
	@media screen and (max-width: 500px) {
		.hide-on-phone {
			display: none;
		}
	}

	/* #endif */
	.next-stat__select {
		display: flex;
		align-items: center;
		// padding: 15px;
		cursor: pointer;
		width: 100%;
		flex: 1;
		box-sizing: border-box;
		user-select: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0); /* 禁用点击高亮效果 */
	}

	.next-stat-box {
		width: 100%;
		flex: 1;
	}

	.next-stat__actived {
		width: 100%;
		flex: 1;
	}

	.next-label-text {
		font-size: 14px;
		font-weight: bold;
		color: $next-base-color;
		margin: auto 0;
		margin-right: 5px;
	}

	.next-select {
		font-size: 14px;
		border: 1px solid $next-border-3;
		box-sizing: border-box;
		border-radius: 4px;
		padding: 0 5px;
		padding-left: 10px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		user-select: none;
		/* #endif */
		flex-direction: row;
		align-items: center;
		border-bottom: solid 1px $next-border-3;
		width: 100%;
		flex: 1;
		height: 35px;
		min-height: 35px;

		&--disabled {
			background-color: #f5f7fa;
			cursor: not-allowed;
		}
	}

	.next-select__label {
		font-size: 16px;
		// line-height: 22px;
		min-height: 35px;
		height: 35px;
		padding-right: 10px;
		color: $next-secondary-color;
	}

	.next-select__input-box {
		width: 100%;
		height: 35px;
		position: relative;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex: 1;
		flex-direction: row;
		align-items: center;

		.tag-calss {
			font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
			font-weight: 400;
			-webkit-font-smoothing: antialiased;
			-webkit-tap-highlight-color: transparent;
			font-size: 12px;
			border: 1px solid #d9ecff;
			border-radius: 4px;
			white-space: nowrap;
			height: 24px;
			padding: 0 4px 0px 8px;
			line-height: 22px;
			box-sizing: border-box;
			margin: 2px 0 2px 6px;
			display: flex;
			max-width: 100%;
			align-items: center;
			background-color: #f4f4f5;
			border-color: #e9e9eb;
			color: #909399;

			.text {
				font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
				font-weight: 400;
				-webkit-font-smoothing: antialiased;
				-webkit-tap-highlight-color: transparent;
				font-size: 12px;
				white-space: nowrap;
				line-height: 22px;
				color: #909399;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}

	.next-select__input {
		flex: 1;
		font-size: 14px;
		height: 22px;
		line-height: 22px;
	}

	.next-select__input-plac {
		font-size: 14px;
		color: $next-secondary-color;
	}

	.next-select__selector {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
		position: absolute;
		top: calc(100% + 12px);
		left: 0;
		width: 100%;
		background-color: #FFFFFF;
		border: 1px solid #EBEEF5;
		border-radius: 6px;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		z-index: 3;
		padding: 4px 0;
	}

	.next-select__selector-scroll {
		/* #ifndef APP-NVUE */
		max-height: 200px;
		box-sizing: border-box;
		/* #endif */
	}

	.next-select__selector-empty,
	.next-select__selector-item {
		/* #ifndef APP-NVUE */
		display: flex;
		cursor: pointer;
		/* #endif */
		line-height: 35px;
		font-size: 14px;
		text-align: center;
		/* border-bottom: solid 1px $next-border-3; */
		padding: 0px 10px;
	}

	.next-select__selector-item:hover {
		background-color: #f9f9f9;
	}

	.next-select__selector-empty:last-child,
	.next-select__selector-item:last-child {
		/* #ifndef APP-NVUE */
		border-bottom: none;
		/* #endif */
	}

	.next-select_selector-item_active {
		font-weight: bold;
		background-color: #f5f7fa;
		border-radius: 3px;
	}

	.next-select__selector__disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* picker 弹出层通用的指示小三角 */
	.next-popper__arrow,
	.next-popper__arrow::after {
		position: absolute;
		display: block;
		width: 0;
		height: 0;
		border-color: transparent;
		border-style: solid;
		border-width: 6px;
	}

	.next-popper__arrow {
		filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
		top: -6px;
		left: 10%;
		margin-right: 3px;
		border-top-width: 0;
		border-bottom-color: #EBEEF5;
	}

	.next-popper__arrow::after {
		content: " ";
		top: 1px;
		margin-left: -6px;
		border-top-width: 0;
		border-bottom-color: #fff;
	}

	.next-select__input-text {
		// width: 280px;
		width: 90%;
		color: $next-main-color;
		white-space: nowrap;
		text-overflow: ellipsis;
		-o-text-overflow: ellipsis;
		overflow: hidden;
	}

	.next-select__input-placeholder {
		color: $next-base-color;
		font-size: 12px;
	}

	.next-select--mask {
		position: fixed;
		top: 0;
		bottom: 0;
		right: 0;
		left: 0;
	}
</style>