import { _decorator, Component, director, Label, Node } from 'cc';
import { gameData } from '../../configs/gameData';
import { gameConfig } from '../../configs/gameConfig';
import { eventType } from '../../configs/pathName';
import { timeHMS } from '../../utils/otherUtil';
import { gameMoshi } from '../../configs/gameMoshi';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;
const log = 'daojishiTs';
@ccclass('daojishiTs')
export class daojishiTs extends Component {
    @property(Label)
    daojishiLabel: Label = null;
    private shengyuTime: number = 0;
    private dongjieTime: number = 0;
    private dongjie: boolean = false;
    private zanting: boolean = false;

    onEnable() {
        this.chongzhiTime();
        director.on(eventType.useDongjie, this.onDongjieDaoju, this);
        director.on(eventType.fuhuo, this.onFuhuo, this);
    }

    protected onDestroy(): void {
        director.off(eventType.useDongjie, this.onDongjieDaoju, this);
        director.off(eventType.fuhuo, this.onFuhuo, this);
    }

    /** 每帧更新时调用 */
    update(dt: number) {
        if (gameData.zanting) return;
        if (this.zanting) return;
        if (gameConfig.levelTime === -1) return;
        if (this.dongjie) {
            this.updateFrozenTime(dt);
        } else {
            this.updateRemainingTime(dt);
        }
    }

    /** 当时间重置时调用 */
    chongzhiTime(): void {
        this.zanting = false;
        this.shengyuTime = gameConfig.levelTime;
        this.dongjie = false;
    }

    /** 当复活时调用 */
    onFuhuo(type: number) {
        if (type === 1) {
            this.zanting = false;
            switch (gameData.moshi) {
                case gameMoshi.putong:
                    this.shengyuTime = this.isZhuamaoLevel ? 120 : 60;
                    break;
                case gameMoshi.tiaozhan:
                    this.shengyuTime = gameData.tiaozhanLevel === 1 ? 60 : 300;
                    break;
            }
        }
    }

    /** 当使用技能冰冻时调用 */
    onDongjieDaoju(): void {
        this.dongjie = true;
        this.dongjieTime = gameConfig.dongjieTime;
        console.log(log, '进入冰冻状态');
    }

    public get isZhuamaoLevel(): boolean {
        return gameData.putongLevel > 1 && gameData.putongLevel % 5 === 0;
    }

    /** 解冻当帧仍不扣关卡时间，与原来的分支顺序一致。 */
    private updateFrozenTime(dt: number) {
        this.dongjieTime -= dt;
        if (this.dongjieTime <= 0) {
            this.dongjie = false;
            console.log(log, '取消冰冻状态');
        }
    }

    /** 扣时后依次刷新警告、文字和超时事件。 */
    private updateRemainingTime(dt: number) {
        this.shengyuTime -= dt;
        this.shengyuTime = Math.max(this.shengyuTime, 0);
        director.emit(eventType.jinggaoTime, this.shengyuTime);
        this.daojishiLabel.string = timeHMS(Math.round(this.shengyuTime) * 1000);
        if (this.shengyuTime <= 0) {
            this.zanting = true;
            director.emit(eventType.timeJieshu);
        }
    }
}
