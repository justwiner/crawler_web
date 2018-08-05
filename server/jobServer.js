let JobServer = (() => {
    const ZhiPinServer = require('./zhipinServer')
    const config = require('../config')
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
        static async getJobs (from) {
            try {
                console.time('获取岗位')
                let getJobsPromise = []
                let result = {
                    success: null,
                    msg: null
                }
                const length = from.length
                for (let i = 0; i < length; i++) {
                    if (from[i] === 1) {
                        getJobsPromise.push(ZhiPinServer.getAllJobs())
                    } else {
                        getJobsPromise.push(new Promise(resolve => {
                            resolve({
                                success: true,
                                msg: '未从数据库获取Boss直聘的岗位信息!'
                            })
                        }))
                    }
                }
                const [zhiPin] = await Promise.all(getJobsPromise)
                if (zhiPin.success) {
                    result = Object.assign({}, result, {zhiPin})
                }
                result.success = true
                result.msg = '获取岗位信息成功！'
                console.timeEnd('获取岗位')
                return result
            } catch (e) {
                console.log(e)
                return config.error
            }
        }
    }
    return JobServer
})()

exports = module.exports = JobServer