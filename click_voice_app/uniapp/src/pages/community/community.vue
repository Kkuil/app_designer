<template>
    <view class="container">
        <!-- 主内容区域 - 帖子列表 -->
        <scroll-view
            class="main"
            scroll-y
            @scrolltolower="handleLoadMore"
        >
            <view class="posts-container">
                <!-- 加载中状态 -->
                <view v-if="isLoading && posts.length === 0" class="loading-container">
                    <view class="loading-spinner"></view>
                    <text class="loading-text">加载中...</text>
                </view>

                <!-- 帖子列表 -->
                <view
                    v-for="post in posts"
                    :key="post.id"
                    class="post-card"
                    @tap="handlePostClick(post.id)"
                >
                    <!-- 帖子图片 -->
                    <view class="post-image-container">
                        <image
                            class="post-image"
                            :src="post.imageUrl"
                            mode="aspectFill"
                        />
                    </view>

                    <!-- 互动区域 -->
                    <view class="post-content">
                        <!-- 互动按钮 -->
                        <view class="action-buttons">
                            <view
                                class="action-btn"
                                @tap.stop="handleLike(post.id)"
                            >
                                <text class="icon-heart">❤️</text>
                                <text class="action-text">{{ post.likes }}</text>
                            </view>

                            <view
                                :class="['action-btn', post.saved ? 'action-btn-active' : '']"
                                @tap.stop="handleSave(post.id)"
                            >
                                <text class="icon-star">{{ post.saved ? '⭐' : '☆' }}</text>
                            </view>

                            <view
                                class="action-btn"
                                @tap.stop="handleComment(post.id)"
                            >
                                <text class="icon-comment">💬</text>
                            </view>

                            <view
                                class="action-btn"
                                @tap.stop="handleShare(post.id)"
                            >
                                <text class="icon-share">↗️</text>
                            </view>
                        </view>

                        <!-- 帖子信息 -->
                        <view class="post-info">
                            <text class="info-text">{{ post.timestamp }}</text>
                            <text class="info-text">{{ post.views }}浏览</text>
                        </view>
                    </view>
                </view>

                <!-- 加载更多按钮 -->
                <view class="load-more-container">
                    <button
                        class="load-more-btn"
                        @tap="handleLoadMoreClick"
                        :disabled="isLoadingMore"
                    >
                        {{ isLoadingMore ? '加载中...' : '加载更多' }}
                    </button>
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            posts: [],
            isLoading: true,
            isLoadingMore: false,
            username: 'Kurosagi',
            userAvatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=green%20frog%20character%20cartoon&sign=bb81bbeb7cba0f27302406b3aa0c13da'
        };
    },

    onLoad() {
        this.fetchPosts();
    },

    methods: {
        // 获取帖子数据
        fetchPosts() {
            // 模拟网络请求延迟
            setTimeout(() => {
                // 创建模拟帖子数据
                const mockPosts = [];
                for (let i = 0; i < 10; i++) {
                    mockPosts.push({
                        id: i + 1,
                        title: "新MORE样 超开新",
                        subtitle: "东二环泰禾广场新次元嘉年华",
                        imageUrl: "https://lf-code-agent.coze.cn/obj/x-ai-cn/341176381698/attachment/image_20251217233923.png",
                        username: "Kurosagi",
                        avatarUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=green%20frog%20character%20cartoon&sign=bb81bbeb7cba0f27302406b3aa0c13da",
                        timestamp: "2023-01-12 01:53",
                        views: 1025,
                        likes: Math.floor(Math.random() * 500),
                        saved: false
                    });
                }

                this.posts = mockPosts;
                this.isLoading = false;
            }, 800);
        },

        // 处理点赞
        handleLike(id) {
            const index = this.posts.findIndex(post => post.id === id);
            if (index !== -1) {
                this.posts[index].likes++;
                // 触发视图更新
                this.$set(this.posts, index, this.posts[index]);
            }
        },

        // 处理收藏
        handleSave(id) {
            const index = this.posts.findIndex(post => post.id === id);
            if (index !== -1) {
                this.posts[index].saved = !this.posts[index].saved;
                // 触发视图更新
                this.$set(this.posts, index, this.posts[index]);

                uni.showToast({
                    title: this.posts[index].saved ? '收藏成功' : '取消收藏',
                    icon: 'none',
                    duration: 2000
                });
            }
        },

        // 处理评论
        handleComment(id) {
            uni.showToast({
                title: '评论功能即将上线',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理分享
        handleShare(id) {
            uni.showToast({
                title: '分享功能即将上线',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理用户头像点击
        handleUserClick() {
            uni.navigateTo({
                url: '/pages/profile/profile'
            });
        },

        // 处理通知点击
        handleNotificationClick() {
            uni.showToast({
                title: '通知功能即将上线',
                icon: 'none',
                duration: 2000
            });
        },

        // 处理帖子点击
        handlePostClick(id) {
            uni.showToast({
                title: `查看帖子 ${id}`,
                icon: 'none',
                duration: 2000
            });
        },

        // 处理滚动到底部
        handleLoadMore() {
            if (!this.isLoadingMore) {
                this.handleLoadMoreClick();
            }
        },

        // 处理加载更多点击
        handleLoadMoreClick() {
            if (this.isLoadingMore) return;

            this.isLoadingMore = true;

            // 模拟加载更多数据
            setTimeout(() => {
                this.isLoadingMore = false;
                uni.showToast({
                    title: '已经到底了~',
                    icon: 'none',
                    duration: 2000
                });
            }, 500);
        }
    }
};
</script>

<style scoped>
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f9fafb;
}

/* 顶部导航栏 */
.header {
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 24rpx 32rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
}

.user-info {
    display: flex;
    align-items: center;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 24rpx;
}

.username {
    font-size: 36rpx;
    font-weight: bold;
    color: #1f2937;
}

.notification-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.icon-bell {
    font-size: 44rpx;
}

/* 主内容区域 */
.main {
    flex: 1;
    height: calc(100vh - 120rpx);
}

.posts-container {
    padding: 32rpx;
}

/* 加载中状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
}

.loading-spinner {
    width: 128rpx;
    height: 128rpx;
    border: 8rpx solid #facc15;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: 32rpx;
    color: #6b7280;
    font-size: 28rpx;
}

/* 帖子卡片 */
.post-card {
    background-color: #ffffff;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 32rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s;
}

.post-card:active {
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.post-image-container {
    position: relative;
    width: 100%;
    height: 512rpx;
}

.post-image {
    width: 100%;
    height: 100%;
}

/* 互动区域 */
.post-content {
    padding: 32rpx;
}

.action-buttons {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
}

.action-btn {
    display: flex;
    align-items: center;
    margin-right: 48rpx;
    color: #6b7280;
}

.action-btn:active {
    opacity: 0.7;
}

.action-btn-active {
    color: #eab308;
}

.icon-heart,
.icon-star,
.icon-comment,
.icon-share {
    font-size: 40rpx;
    margin-right: 8rpx;
}

.action-text {
    font-size: 28rpx;
}

/* 帖子信息 */
.post-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-text {
    font-size: 24rpx;
    color: #9ca3af;
}

/* 加载更多 */
.load-more-container {
    margin-top: 64rpx;
    text-align: center;
    padding-bottom: 32rpx;
}

.load-more-btn {
    padding: 16rpx 48rpx;
    background-color: #facc15;
    color: #000000;
    font-weight: 500;
    border-radius: 48rpx;
    border: none;
    font-size: 28rpx;
    transition: background-color 0.3s;
}

.load-more-btn:active {
    background-color: #eab308;
}

.load-more-btn[disabled] {
    opacity: 0.6;
}
</style>
