export default {
    'zh-cn': {
        sidemenu: [
            {
                title: '接入文档',
                children: [
                    {
                        title: '接入指引',
                        key: 'resources',
                        link: '/zh-cn/docs/resources/resources.html',
                    },
                    {
                        title: '客户端',
                        key: 'client',
                        children: [
                            {
                                title: '接入指南',
                                link: '/zh-cn/docs/client/gamesdk.html',
                            },
                            {
                                title: 'Q&A',
                                link: '/zh-cn/docs/client/faq.html',
                            },
                        ],
                    },
                    {
                        title: '服务器',
                        key: 'server',
                        children: [
                            {
                                title: '接入指南',
                                link: '/zh-cn/docs/server/cloudgame-server-doc.html',
                            },
                            {
                                title: 'php下单签名示例',
                                link: '/zh-cn/docs/server/php_sign_demo.html',
                            },
                            {
                                title: 'python下单签名示例',
                                link: '/zh-cn/docs/server/python_sign_demo.html',
                            },
                            {
                                title: 'Q&A',
                                link: '/zh-cn/docs/server/faq.html',
                            },
                        ],
                    },
                    {
                        title: '实名认证接入文档',
                        key: 'auth',
                        link: '/zh-cn/docs/auth/index.html',
                    },
                ],
            },
        ],
        barText: '接入文档',
    },
};
