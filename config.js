exports = module.exports = {
    network: {
        port: 8080
    },
    database: 'mongodb://localhost:27017/web_crawler',
    targetWebsite: [
        {
            fromId: 1,
            fromName: 'Boss直聘',
            fromWebsite: [
                {
                    id: 1,
                    name: '职位列表',
                    url: 'https://www.zhipin.com/c100010000/?page=1&sort=2&ka=page-1'
                }
            ]
        }
    ],
    error: { success: false, message: '服务器出现问题' }
}