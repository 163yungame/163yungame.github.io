// 全局的一些配置
export default {
  rootPath: '', // 发布到服务器的根目录，需以/开头但不能有尾/，如果只有/，请填写空字符串
  port: 8080, // 本地开发服务器的启动端口
  domain: '163yungame.github.io', // 站点部署域名，无需协议和path等
  defaultLanguage: 'zh-cn',
  'zh-cn': {
    pageMenu: [
      {
        key: 'home',
        text: '首页',
        link: '/zh-cn/index.html',
      },
      {
          key: 'resources',
          text: '接入指引',
          link: '/zh-cn/docs/resources/resources.html',
      },
      {
        key: 'client',
        text: '客户端',
        link: '/zh-cn/docs/client/gamesdk.html',
      },
      {
        key: 'server',
        text: '服务器',
        link: '/zh-cn/docs/server/cloudgame-server-doc.html',
      },
    ],
    disclaimer: {
      title: '免责声明',
      content: '免责声明的具体内容',
    },
    documentation: {
      title: '文档',
      list: [
        {
          text: '概览',
          link: '/zh-cn/docs/demo1.html',
        },
        {
          text: '快速开始',
          link: '/zh-cn/docs/demo2.html',
        },
        {
          text: '开发者指南',
          link: '/zh-cn/docs/dir/demo3.html',
        },
      ],
    },
    copyright: 'Copyright © 2018 网易易游',
  },
};
