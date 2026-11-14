import { _decorator, Component, director, Node } from 'cc';
import { eventType } from '../../configs/pathName';
import { maobiMgr } from '../../managers/maobiMgr';
import { gameConfig } from '../../configs/gameConfig';
import { tishiMgr } from '../../managers/tishiMgr';
import { musicMgr } from '../../managers/musicMgr';
import { gameUtil } from '../../utils/gameUtil';
import { gameData } from '../../configs/gameData';
import { poolMgr } from '../../managers/poolMgr';
import { choujiangConfig } from '../../configs/choujiangConfig';
import { suijiQuanzhong } from '../../utils/arrUtil';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;
@ccclass('choujiangViewTs')
export class choujiangViewTs extends Component {
    private isDianji: boolean = true;

    /** 关闭界面 */
    onGuanbi(): void {
        director.emit(eventType.redTishi);
        this.node.destroy();
    }

    /** 单次扭蛋 */
    async onDanci() {
        this.spendCoinsAndDraw(gameConfig.choujiang1, 1);
    }

    /** 当双倍扭蛋按钮被点击时调用。 */
    async onShuangci() {
        adMgr.showVideo(() => {
            this.kaishiNiudan(2);
        });
    }

    /** 十连扭蛋按钮被点击时调用 */
    async onTenci() {
        this.spendCoinsAndDraw(gameConfig.choujiang10, 10);
    }

    /** 开始扭蛋 */
    async kaishiNiudan(val: number) {
        musicMgr.ins.playSound('a摇晃扭蛋');
        director.emit(eventType.kaishiChoujiang);
        const rewardArr = [];
        for (let i = 0; i < val; i++) {
            const reward = this.getRandReward();
            rewardArr.push(reward);
        }
        await gameUtil.ins.yanchi(4);
        director.emit(eventType.jieshuChoujiang);
        gameData.jingpinArr = rewardArr;
        poolMgr.ins.getPoolNode('huoquJiangliPop', this.node);
        this.isDianji = true;
    }

    /** 获取一个随机的扭蛋奖励。 */
    getRandReward() {
        const id: number = this.getRandId();
        const rewardConfig = choujiangConfig[id];
        const reward = {
            itemId: rewardConfig.itemId,
            cnt: rewardConfig.cnt
        };
        return reward;
    }

    /** 根据权重数组随机选择一个扭蛋ID。 */
    getRandId(): number {
        const weights: number[] = [];
        for (let i = 0; i < choujiangConfig.length; i++) {
            const data = choujiangConfig[i];
            weights.push(data.weight);
        }
        return suijiQuanzhong(weights);
    }

    /** 金币抽奖共用余额检查；广告抽奖仍走原来的独立入口。 */
    private spendCoinsAndDraw(cost: number, count: number) {
        if (!this.isDianji) return;
        this.isDianji = false;
        if (maobiMgr.getMaobi < cost) {
            tishiMgr.titleTips(this.node, '金币不足');
            this.isDianji = true;
            return;
        }
        maobiMgr.updateMaobi(-cost);
        director.emit(eventType.jinBiNum, false);
        this.kaishiNiudan(count);
    }
}
