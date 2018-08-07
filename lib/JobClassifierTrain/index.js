let jobClassifier = (() => {
    const natural = require('natural');
    const nodejieba = require('nodejieba')
    const path = require('path')
    const chineseToPinYin = require('../ChineseToPinyin')
    const positions = require('./position')

    let jobClassifier = new natural.BayesClassifier();

    nodejieba.load({
        userDict: path.join(__dirname, './positionDic.txt')
    })

    const kaifa = chineseToPinYin('开发'),
          yanfa = chineseToPinYin('研发'),
          sheji = chineseToPinYin('设计'),
        chengxu = chineseToPinYin('程序'),
          shixi = chineseToPinYin('实习'),
          zhuli = chineseToPinYin('助理'),
   gongchengshi = chineseToPinYin('工程师'),
          gaoji = chineseToPinYin('高级'),
        zhongji = chineseToPinYin('中级'),
          chuji = chineseToPinYin('初级')

    positions.data.forEach(level_1 => {
      let ifExtend = level_1.code === 100000
      level_1.subLevelModelList.forEach(level_2 => {
        level_2.subLevelModelList.forEach(level_3 => {
          let cutStr = level_3.name.toUpperCase()
          if (cutStr === 'C++' || cutStr === 'C') {
            cutStr = 'C' + cutStr
          } else if (cutStr ===  'C#') {
            cutStr = 'CCsharp'
          }
          cutStr = cutStr.toLowerCase()
          const modelTitleCut = nodejieba.cut(cutStr).join(' ')
          const modelTitle = chineseToPinYin(modelTitleCut).toLowerCase()
          jobClassifier.addDocument(modelTitle, level_3.code)
          if (ifExtend) {
            jobClassifier.addDocument(`${modelTitle} ${kaifa}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${yanfa}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${sheji}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${chengxu}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${shixi}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${gongchengshi}`, level_3.code)
            jobClassifier.addDocument(`${modelTitle} ${zhuli}`, level_3.code)
            jobClassifier.addDocument(`${zhongji} ${modelTitle} ${kaifa} ${gongchengshi}`, level_3.code)
            jobClassifier.addDocument(`${gaoji} ${modelTitle} ${kaifa} ${gongchengshi}`, level_3.code)
            jobClassifier.addDocument(`${chuji} ${modelTitle} ${kaifa} ${gongchengshi}`, level_3.code)
          }
        })
      })
    })
    jobClassifier.train();

    return {
      classifier: jobClassifier,
      nodejieba
    }
})()

exports = module.exports = jobClassifier