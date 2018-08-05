let ZhiPinServer = (() => {
    const cheerio = require('cheerio');
    const nodejieba = require('nodejieba')
    const moment = require('moment')
    const path = require('path')
    const schedule = require('node-schedule')
    const doRequest = require('../lib/doRequest')
    const {getSalarys, spliceJsonVal, arrayUnique} = require('../lib/tools')
    const config = require('../config')
    const Job = require('../db/mongoose-db').Job
    let timedTask = null
    let rule = new schedule.RecurrenceRule();
    class ZhiPinServer {
        static async getJobsFromZhiPin (ifloop = false, loopTime = 2) {
            try {
                const financingStage = ['未融资', '天使轮', 'A轮', 'B轮', 'C轮', 'D轮及以上', '已上市', '不需要融资']
                const webInfo = config.targetWebsite.find(e => e.fromId === 1)
                const pageInfo = webInfo.fromWebsite.find(e => e.id === 1)
                const userDicPath = path.join(__dirname, '../lib/userDic.txt')
                nodejieba.load({
                    userDict: userDicPath
                })
                let cookies = (await doRequest(pageInfo.url)).header['set-cookie']
                cookies.push('t=IPwtUMkv6hVBdRus')
                async function get (pageInfo, webInfo, financingStage) {
                    let jobs = []
                    const res = await doRequest(pageInfo.url, cookies)
                    const $ = cheerio.load(res.text);
                    $(".job-primary").each(function(index, element){
                        const $primary = $(element).find('.info-primary');
                        const $publis = $(element).find('.info-publis')
                        const $company = $(element).find('.info-company')

                        const $jobTitle = $primary.find('.job-title');
                        const $salary = $primary.find('.red');
                        const claims = nodejieba.cut($primary.find('p').text().replace(/\s/g,""))
                        const companyInfos = nodejieba.cut($company.find('p').text().replace(/\s/g,""))
                        
                        const claimsLength = claims.length
                        const companyInfosLength = companyInfos.length
                        let addVal = {
                            primary: {
                                jobTitle: $jobTitle.text(),
                                salary: getSalarys($salary.text()),
                                claims: {
                                    position: claims[0],
                                    experience: claims.slice(1, claimsLength - 1).join(''),
                                    education: claims[claimsLength - 1]
                                }
                            },
                            company: {
                                name: $company.find('.company-text .name a').text(),
                                classify: ((companyInfos) => {
                                    const length = companyInfos.length
                                    for (let i = 0; i < length; i++) {
                                        if (financingStage.includes(companyInfos[i])) {
                                            return companyInfos.slice(0, length - 2).join('')
                                        }
                                    }
                                    return companyInfos.slice(0, length - 1).join('')
                                })(companyInfos),
                                scale: companyInfos[companyInfosLength - 1],
                                financingStage: ((companyInfos) => {
                                    const length = companyInfos.length
                                    for (let i = 0; i < length; i++) {
                                        if (financingStage.includes(companyInfos[i])) {
                                            return companyInfos[i]
                                        }
                                    }
                                    return null
                                })(companyInfos)
                            },
                            updateAt: ((dataStr) => {
                                const dateStr = `${moment().format('YYYY-MM-DD')} ${dataStr.substring(3, dataStr.length)}`
                                return moment(dateStr).format('YYYY-MM-DD HH:mm:ss')
                            })($publis.find('p').text()),
                            dataFromName: webInfo.fromName,
                            datafrom: webInfo.fromId
                        }
                        addVal = Object.assign({}, addVal, {uniqueVal: spliceJsonVal(addVal)})
                        jobs.push(addVal);
                    });
                    const jobsPromise = jobs.map(e => Job.create(e))
                    console.log('成功获取Boss直聘最新岗位数据！------ '+ moment().format('YYYY-MM-DD HH:mm:ss'))
                    await Promise.all(jobsPromise)
                }
                if (ifloop) {
                    let minites = []
                    for (let i = 0; i < 60; i += loopTime) {
                        minites.push(i)
                    }
                    rule.minute = minites
                    timedTask = schedule.scheduleJob(rule, function(){
                        get(pageInfo, webInfo, financingStage)
                　  });
                } else {
                    get(pageInfo, webInfo, financingStage)
                    ZhiPinServer.deleteTimedTask()
                }
                if (ifloop) {
                    return {
                        msg: '定时请求设置成功（每两分钟获取一次最新数据）！',
                        success: true
                    }
                } else {
                    return {
                        msg: '抓取数据成功！',
                        success: true
                    }
                }
            } catch (e) {
                throw new Error(e)
            }
        }
        static deleteTimedTask () {
            if (timedTask !== null) {
                timedTask.cancel()
                console.log('取消Boss直聘的定时爬虫！')
                return {
                    msg: '取消定时任务成功！',
                    success: true
                }
            } else {
                return {
                    msg: '无定时任务！',
                    success: false
                }
            }
        }
        static async getAllJobs () {
            try {
                console.time("获取数据")
                let zhiPinJobs = await Job.find({datafrom: 1})
                console.timeEnd("获取数据")
                const totalNum = zhiPinJobs.length
                console.time("去重")
                zhiPinJobs = arrayUnique(zhiPinJobs, 'uniqueVal')
                console.timeEnd("去重")
                const validNum = zhiPinJobs.length
                console.log("获取Boss直聘职位成功！")
                return {
                    success: true,
                    msg: '获取Boss直聘职位成功！',
                    totalNum,
                    validNum,
                    data: zhiPinJobs
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
    return ZhiPinServer
})()

exports = module.exports = ZhiPinServer