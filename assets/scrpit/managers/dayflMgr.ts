import { _decorator, Component, director, Node } from 'cc';
import { gameData } from '../configs/gameData';
import { bendiUtil } from '../utils/bendiUtil';
import { getDTime, newTime } from '../utils/gameUtil';
import { tishiMgr } from './tishiMgr';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;
@ccclass('dayflMgr')
export class dayflMgr extends Component {
    private static isLingqu: boolean = false;

    static get IsLingqu() {
        return this.isLingqu;
    }

    static set IsLingqu(val: boolean) {
        this.isLingqu = val;
    }

    /** 领取奖励 */
    static getfl() {
        gameData.jingpinArr = [
            {
                itemId: 0,
                cnt: 166
            }
        ];
        tishiMgr.huoquJiangliPop(
            gameData.main,
            () => {
                dayflMgr.IsLingqu = false;
                let nextClaimTime = getDTime();
                director.emit(eventType.dayFLLingqu);
                bendiUtil.setItem('dayFlTime', nextClaimTime);
                director.emit(eventType.redTishi);
            },
            false
        );
    }

    /** 初始化管理器 */
    static init() {
        let nextClaimTime = bendiUtil.getItem('dayFlTime', 0);
        let remainingTime = nextClaimTime - newTime();
        if (remainingTime >= 0) {
            this.isLingqu = false;
        } else {
            this.isLingqu = true;
        }
    }
}
