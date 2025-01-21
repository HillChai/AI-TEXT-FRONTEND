<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  display: flex;
  justify-content: center; /* 水平方向居中 */
  align-items: center; /* 垂直方向居中 */
  height: 100vh; /* 占满视口高度 */
  width: 100%; /* 占满视口宽度 */
  margin: 0;
  padding: 0;
  background-color: #f5f5f5; /* 可选背景色 */
  box-sizing: border-box; /* 确保 padding 不影响布局 */
}
</style>
