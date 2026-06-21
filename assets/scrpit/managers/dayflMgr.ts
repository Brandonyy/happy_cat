import { _decorator, Component, director, Node } from 'cc';
import { gameData } from '../configs/gameData';
import { bendiUtil } from '../utils/bendiUtil';
import { getDTime, newTime } from '../utils/gameUtil';
import { tishiMgr } from './tishiMgr';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('dayflMgr')
export class dayflMgr extends Component {
    // 是否可以领取奖励
    private static isLingqu: boolean = false
    // 获取领取状态
    static get IsLingqu() {
        return this.isLingqu
    }
    // 设置领取状态
    static set IsLingqu(val: boolean) {
        this.isLingqu = val
    }
    /**
         * 领取奖励
         */
    static getfl() {
        // 获取166金币
        gameData.jingpinArr = [{
            itemId: 0,
            cnt: 166
        }]
        tishiMgr.huoquJiangliPop(gameData.main, () => {
            dayflMgr.IsLingqu = false
            // 获取第二天的时间戳
            let endTime = getDTime()
            // 全局事件（已经领取福利）
            director.emit(eventType.dayFLLingqu)
            // 本地存储时间
            bendiUtil.setItem('dayFlTime', endTime)
            director.emit(eventType.redTishi)
        }, false)
    }
    /**
     * 初始化管理器
     */
    static init() {
        // 如果上次领取后的第二天时间减当前时间大于0，说明距离上次领取还没过24点
        let old = bendiUtil.getItem('dayFlTime', 0)
        let left = old - newTime();
        if (left >= 0) {
            this.isLingqu = false
        } else {
            this.isLingqu = true
        }
    }

}


