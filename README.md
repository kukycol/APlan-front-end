#### 常用的后台管理系统，完成系统基础功能，变成通用系统，拿来就用.
[部署篇](README-DEPLOY.md)

说明点：

- 定义一个全局变量？

  ```
  在环境文件（.env.development、.env.production）定义一个变量，变量命名以VUE_APP开头才行
  ```

- 修改网站标题和图标

  ```
  修改标题：
  （1）在vue.config.js 配置文件中修改name
  （2）src/settings 配置文件中修改title
  （3）src/layout/Sidebar/Logo.vue 文件中的data().title
  修改图标：替换public/favicon.ico文件即可更换，更换完成记得请缓存或重启。
  ```

  

