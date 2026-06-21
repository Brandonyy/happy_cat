import { _decorator, Component, math, Node } from 'cc';
import { guoguanJiangliConfig } from '../configs/daojuConfig';
import { gameData } from '../configs/gameData';
import { bendiUtil } from '../utils/bendiUtil';
import { daojuType } from '../configs/daojuType';
import { suijiQuanzhong } from '../utils/arrUtil';
import { daojuMgr } from './daojuMgr';
import { tishiMgr } from './tishiMgr';
const { ccclass, property } = _decorator;

@ccclass('guoguanJiangliMgr')
export class guoguanJiangliMgr extends Component {
    /**
* 获取当前关卡奖励数据的静态属性。
* 该属性返回一个DtoPassReward对象，表示当前关卡的奖励数据。
*/    // 奖品奖励数据
    private static jiangliArr: number[] = []
    static get JlData() {
        // 计算当前关卡奖励的索引，确保索引在有效范围内
        const id: number = math.clamp(this.jiangliArr.length, 0, guoguanJiangliConfig.length - 1)
        // 根据索引从配置数据中获取当前关卡的奖励数据
        const jlData = guoguanJiangliConfig[id]
        // 返回当前关卡的奖励数据
        return jlData
    }
    /**
   * 初始化方法
   */
    static init() {
        // 从本地存储中获取已领取奖励数组，如果不存在则初始化为空数组
        this.jiangliArr = bendiUtil.getObj('guoguanJiangliArr', [])

    }
    /**
   * 领取当前奖励
   */
    static huodeJiangli() {
        // 计算当前关卡奖励的索引
        const id: number = this.jiangliArr.length
        // 将当前关卡奖励的索引添加到已领取奖励数组中
        this.jiangliArr.push(id)
        // 将更新后的已领取奖励数组存储到本地存储中
        bendiUtil.setObj('guoguanJiangliArr', this.jiangliArr)
        // 根据索引从配置数据中获取当前关卡的奖励数据
        const jlData = guoguanJiangliConfig[id]
        // 从奖励数据中获取硬币数量和技能数量
        const { coinCnt, skillCnt } = jlData
        // 创建一个空的奖励数组
        const jlArr = []
        // 定义技能类型数组
        const daojuArr = [daojuType.dongjie, daojuType.yichu, daojuType.couqi]
        // 定义技能权重数组
        const daojuQuanzhong: number[] = [15, 42.5, 42.5]
        // 根据技能数量循环生成技能奖励
        for (let i = 0; i < skillCnt; i++) {
            // 根据技能权重随机选择一个技能索引
            const skillIdx: number = suijiQuanzhong(daojuQuanzhong)
            // 根据技能索引获取技能类型
            const skill: daojuType = daojuArr[skillIdx]
            // 将技能奖励添加到奖励数组中
            jlArr.push({
                itemId: daojuMgr.getDaojuId(skill),
                cnt: 1
            })
        }
        // 将硬币奖励添加到奖励数组中
        jlArr.push({
            itemId: 0,
            cnt: coinCnt
        })
        // 打开奖励界面，并传递奖励数组
        gameData.jingpinArr = jlArr
        tishiMgr.huoquJiangliPop(gameData.tcNode, () => { }, false)
    }
    /**
    * 检查是否所有关卡奖励都已领取的静态方法。
    * @returns 如果所有关卡奖励都已领取，则返回true；否则返回false。
    */
    static isHuodeSuoyou(): boolean {
        // 比较已领取的关卡奖励数组长度和配置数据中的关卡奖励总数
        return this.jiangliArr.length >= guoguanJiangliConfig.length
    }
    /**
    * 检查是否可以领取当前关卡奖励
    * @returns 
    */
    static canHuodeJiangli(): boolean {
        // 获取当前关卡的奖励数据
        const data = this.JlData
        // 比较当前游戏等级和奖励数据中的关卡等级
        return gameData.putongLevel > data.passLevel
    }
}


