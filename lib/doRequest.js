const superagent = require('superagent');
const userAgents = require('../lib/userAgent')

exports = module.exports = async function doRequest (url, cookies = null) {
    let userAgent = userAgents[parseInt(Math.random() * userAgents.length)]
    try {
        return await superagent
        .get(url)
        .set({
            'User-Agent': userAgent,
            'Referer': url,
            'Connection': 'keep-alive',
            'Cookie': cookies
        })
    } catch (e) {
        console.log(e)
        return await superagent
        .get(url)
        .set({
            'User-Agent': userAgent,
            'Referer': url,
            'Connection': 'keep-alive',
            'Cookie': cookies
        })
    }
}