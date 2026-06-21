import { _decorator, Component, director, Label, Node } from 'cc';
import { gameData } from '../../configs/gameData';
import { gameConfig } from '../../configs/gameConfig';
import { eventType } from '../../configs/pathName';
import { timeHMS } from '../../utils/otherUtil';
import { gameMoshi } from '../../configs/gameMoshi';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;
const log = 'daojishiTs'
@ccclass('daojishiTs')
export class daojishiTs extends Component {
    // 倒计时显示
    @property(Label)
    daojishiLabel: Label = null
    // 剩余倒计时
    private shengyuTime: number = 0;
    // 冰冻时间
    private dongjieTime: number = 0
    // 冻结
    private dongjie: boolean = false
    // 暂停
    private zanting: boolean = false

    onEnable() {
        this.chongzhiTime()
        // 注册一个事件监听器，用于监听冰冻技能使用事件
        director.on(eventType.useDongjie, this.onDongjieDaoju, this)
        // 注册一个事件监听器，用于监听复活事件
        director.on(eventType.fuhuo, this.onFuhuo, this)
    }
    protected onDestroy(): void {
        director.off(eventType.useDongjie, this.onDongjieDaoju, this)
        director.off(eventType.fuhuo, this.onFuhuo, this)
    }
    /**
* 每帧更新时调用
* 处理游戏时间的流逝和冰冻状态
* @param dt - 自上一帧以来的时间间隔（以秒为单位）
*/
    update(dt: number) {
        // 如果全局游戏管理器指示游戏暂停，则不进行任何操作
        if (gameData.zanting) return
        // 如果游戏处于暂停状态，则直接返回
        if (this.zanting) return
        // 如果关卡没时间限制，返回
        if (gameConfig.levelTime === -1) return
        // 如果处于冰冻状态
        if (this.dongjie) {
            //   减少冰冻时间
            this.dongjieTime -= dt
            // 如果冰冻时间结束
            if (this.dongjieTime <= 0) {
                // 取消冰冻状态
                this.dongjie = false
                console.log(log, '取消冰冻状态');
            }
            // 如果没有处于冰冻状态
        } else {
            // 减少剩余时间
            this.shengyuTime -= dt
            // 将剩余时间设置为传入的值和0之间的最大值，确保时间不会为负数
            this.shengyuTime = Math.max(this.shengyuTime, 0)
            // 触发时间滴答事件，并传递更新后的剩余时间
            director.emit(eventType.jinggaoTime, this.shengyuTime)
            // 将剩余时间格式化为时分秒的字符串，并更新标签显示
            this.daojishiLabel.string = timeHMS(Math.round(this.shengyuTime) * 1000)
            // 如果剩余时间小于等于0，则触发时间结束事件
            if (this.shengyuTime <= 0) {
                // 设置游戏为暂停状态
                this.zanting = true
                // 触发时间结束事件
                director.emit(eventType.timeJieshu)
            }
        }

    }
    /**
   * 当时间重置时调用
   * 重置游戏暂停状态和剩余时间
   */
    chongzhiTime(): void {
        // 设置游戏为非暂停状态
        this.zanting = false
        // 将剩余时间设置为全局变量 Global.Level_Time 的值
        this.shengyuTime = gameConfig.levelTime
        // 重置冰冻状态
        this.dongjie = false
    }
    /**
    * 当复活时调用
    */
    onFuhuo(type: number) {
        if (type === 1) {
            // 设置游戏为非暂停状态
            this.zanting = false
            // 根据游戏模式重置剩余时间
            switch (gameData.moshi) {
                case gameMoshi.putong:
                    // 如果是猫猫模式，剩余时间设置为120秒，否则设置为60秒
                    this.shengyuTime = this.isZhuamaoLevel ? 120 : 60
                    break;
                case gameMoshi.tiaozhan:
                    // 如果是超级模式第一关，剩余时间设置为60秒，否则设置为300秒
                    this.shengyuTime = gameData.tiaozhanLevel === 1 ? 60 : 300
                    break;
            }
        }

    }
    /**
    * 当使用技能冰冻时调用
    * 进入冰冻状态
    */
    onDongjieDaoju(): void {
        // 设置冰冻状态为真
        this.dongjie = true
        // 设置冰冻时间为全局变量 Global.Bing_Dong_Time 的值
        this.dongjieTime = gameConfig.dongjieTime
        // 记录当前剩余时间
        console.log(log, '进入冰冻状态');
    }
    public get isZhuamaoLevel(): boolean {
        return gameData.putongLevel > 1 && gameData.putongLevel % 5 === 0
    }
}


