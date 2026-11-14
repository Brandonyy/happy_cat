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
    /** 已领取的奖励索引；长度决定下一份奖励。 */
    private static jiangliArr: number[] = [];

    static get JlData() {
        const rewardIndex: number = math.clamp(
            this.jiangliArr.length,
            0,
            guoguanJiangliConfig.length - 1
        );
        const rewardConfig = guoguanJiangliConfig[rewardIndex];
        return rewardConfig;
    }

    /** 初始化方法 */
    static init() {
        this.jiangliArr = bendiUtil.getObj('guoguanJiangliArr', []);
    }

    /** 领取当前奖励 */
    static huodeJiangli() {
        const rewardIndex: number = this.jiangliArr.length;
        this.jiangliArr.push(rewardIndex);
        bendiUtil.setObj('guoguanJiangliArr', this.jiangliArr);
        const rewardConfig = guoguanJiangliConfig[rewardIndex];
        const { coinCnt, skillCnt } = rewardConfig;
        const rewards = [];
        const skillTypes = [daojuType.dongjie, daojuType.yichu, daojuType.couqi];
        const skillWeights: number[] = [15, 42.5, 42.5];
        for (let i = 0; i < skillCnt; i++) {
            const skillIndex: number = suijiQuanzhong(skillWeights);
            const skill: daojuType = skillTypes[skillIndex];
            rewards.push({
                itemId: daojuMgr.getDaojuId(skill),
                cnt: 1
            });
        }
        rewards.push({
            itemId: 0,
            cnt: coinCnt
        });
        gameData.jingpinArr = rewards;
        tishiMgr.huoquJiangliPop(gameData.tcNode, () => {}, false);
    }

    /** 检查是否所有关卡奖励都已领取的静态方法。 */
    static isHuodeSuoyou(): boolean {
        return this.jiangliArr.length >= guoguanJiangliConfig.length;
    }

    /** 检查是否可以领取当前关卡奖励 */
    static canHuodeJiangli(): boolean {
        const rewardConfig = this.JlData;
        return gameData.putongLevel > rewardConfig.passLevel;
    }
}
