const router = require('express').Router()
const JobServer = require('../server/jobServer')

router.post('/updateJobs',async (req,res,next) => {
    const {from, ifLoop, loopTime} = req.body
    const ifLoop_ = ifLoop || [false],
        loopTime_ = loopTime || [2];
    res.json(await JobServer.getJobsFromNetWork(from, ifLoop_, loopTime_))
});

router.post('/deleteTimedTask',async (req,res,next) => {
    const {from} = req.body
    res.json(await JobServer.deleteTimedTask(from))
});

router.post('/getJobs',async (req,res,next) => {
    const {from} = req.body
    res.json(await JobServer.getJobs(from))
});

exports = module.exports = router