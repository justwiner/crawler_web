let JobServer = (() => {
    const ZhiPinServer = require('./zhipinServer')
    const config = require('../config')
    const JobClassifier = require('../lib/JobClassifierTrain/index')
    const chineseToPinYin = require('../lib/ChineseToPinyin')
    const Job = require('../db/mongoose-db').Job
    const {arrayUnique} = require('../lib/tools')
    const {classifier, nodejieba} = JobClassifier
    class JobServer {
        static async getJobsFromNetWork (from, ifLoop = [false], loopTime = [2]) {
            try {
                const jobPromise = []
                const length = from.length
                for (let i = 0; i < length; i++) {
                    if (from[i] === 1) {
                        jobPromise.push(ZhiPinServer.getJobsFromZhiPin(ifLoop[i], loopTime[i]))
                    } else {
                        jobPromise.push(new Promise((resolve, reject) => {
                            resolve({
                                msg: '未抓取Boss直聘网的岗位信息！',
                                success: true
                            })
                        }))
                    }
                }
                const [zhiPinRes] = await Promise.all(jobPromise)
                if (zhiPinRes.success) {
                    return {
                        msg: '抓取数据成功！',
                        success: true
                    }
                } else {
                    return config.error
                }
            } catch (e) {
                return config.error
            }
        }
        static async deleteTimedTask (from) {
            try {
                const deletePromise = []
                const length = from.length
                for (let i = 0; i < length; i++) {
                    if (from[i] === 1) {
                        deletePromise.push(ZhiPinServer.deleteTimedTask())
                    } else {
                        deletePromise.push(new Promise((resolve, reject) => {
                            resolve({
                                msg: '未执行Boss直聘爬虫定时任务的关闭动作！',
                                success: true
                            })
                        }))
                    }
                }
                const [zhiPinRes] = await Promise.all(deletePromise)
                if (zhiPinRes.success) {
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
            } catch (e) {
                console.log(e)
                return config.error
            }
        }
        static async getJobs () {
            try {
                console.time('获取岗位')
                let result = {
                    success: null,
                    msg: null,
                    data: []
                }
                console.time("获取数据")
                let jobs = await Job.find()
                console.timeEnd("获取数据")
                console.time("去重")
                jobs = arrayUnique(jobs, 'uniqueVal')
                console.timeEnd("去重")
                console.time('获取分类')
                const positionNamePromise = jobs.map(e => e.primary.jobTitle)
                const positionClassifys = await JobServer.run(positionNamePromise)
                result.data = jobs.map((e, i) => ({...e._doc, classify: positionClassifys[i]}))
                console.timeEnd('获取分类')
                result.success = true
                result.msg = '获取岗位信息成功！'
                console.timeEnd('获取岗位')
                return result
            } catch (e) {
                console.log(e)
                return config.error
            }
        }

        static getClassify (positionName) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const checkStr = nodejieba.extract((positionName.toLowerCase()), 3).map(e => {
                        return e.word
                    }).join(' ')
                    const result = classifier.classify(chineseToPinYin(checkStr))
                    resolve(result)
                }, 0)
            })
        }
        static async run (positionNames) {
            let resultPromise = positionNames.map(e => JobServer.getClassify(e))
            return await Promise.all(resultPromise)
        }
        static async getAllJobs () {
            try {
                console.time("获取数据")
                let jobs = await Job.find()
                console.timeEnd("获取数据")
                const totalNum = jobs.length
                console.time("去重")
                jobs = arrayUnique(zhiPinJobs, 'uniqueVal')
                console.timeEnd("去重")
                const validNum = jobs.length
                return {
                    success: true,
                    msg: '获取职位成功！',
                    totalNum,
                    validNum,
                    data: jobs
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
    return JobServer
})()

exports = module.exports = JobServer