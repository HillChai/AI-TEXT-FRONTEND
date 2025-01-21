<template>
  <div class="homepage">
    <!-- 左侧文本内容 -->
    <div class="content">
      <h1 class="title">面试题答案示范<br /></h1>
      <h2 class="subtitle">脆皮菌. Create.</h2>
      <p class="description">没有思路的题扔过来，替你思考，还你精华</p>
      <!-- <button class="button">Get Started</button> -->
      <button class="button" @click="$router.push('/preview')">Get Started</button>
    </div>

    <!-- 右侧图片内容 -->
    <div class="image-container">
      <img src="/ai-artwork.jpeg" alt="Creative AI Artwork" class="main-image" />
      <div class="overlay-text">放空时间...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 暂无复杂逻辑，仅静态布局
</script>

<style scoped>
/* 页面布局 */
.homepage {
  display: flex;
  justify-content: space-between; /* 左右布局，保持两列分布 */
  align-items: center; /* 垂直居中 */
  padding: 0 5vw;
  height: 100vh; /* 让页面内容填满视口高度 */
  width: 100%;
  /* background-color: #f9fafc; 背景色，与目标样式一致 */
  /* background: linear-gradient(to left, #a7c7e7, #a9dfbf); 从蓝色到绿色渐变 */
  background: linear-gradient(
    to left,
    rgba(0, 123, 255, 0.1),
    rgba(40, 167, 69, 0.1)
  ); /* 10% 透明度 */
}

/* 左侧文本内容 */
.content {
  flex: 2;
  max-width: 50%; /*限制宽度，保持视觉平衡*/
  text-align: left; /*左对齐*/
}

/* 标题样式 */
.title {
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 1rem;
  color: #000;
}

.subtitle {
  font-size: 1.8rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.2rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.button:hover {
  background-color: #0056b3;
}

/* 右侧图片内容 */
.image-container {
  flex: 3;
  position: relative;
  max-width: 50%; /* 右侧图片占一半宽度 */
  text-align: center;
}

.main-image {
  width: 100%;
  height: 100%;
  /* padding-right: 5vw; */
  border-radius: 1rem;
  object-fit: cover;
}

.overlay-text {
  position: absolute;
  bottom: 8%; /* 调整到图片底部中间 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  color: #333;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 隐藏顶部导航 */
nav {
  display: none; /* 隐藏导航栏 */
}

/* 隐藏底部滚动图标 */
::-webkit-scrollbar {
  display: none; /* 隐藏滚动条 */
}

/* 响应式适配 */
@media (max-width: 768px) {
  .homepage {
    flex-direction: column; /* 移动端改为上下布局 */
    padding: 2rem 1rem;
  }

  .content {
    width: 100%;
    text-align: center; /* 居中内容 */
  }

  .image-container {
    width: 100%;
    margin-top: 0rem;
  }

  .overlay-text {
    font-size: 0.9rem;
  }
}
</style>
