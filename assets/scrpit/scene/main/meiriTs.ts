import { _decorator, Component, director, Label, Node } from 'cc';
import { eventType } from '../../configs/pathName';
import { dayflMgr } from '../../managers/dayflMgr';
import { getDTime, newTime } from '../../utils/gameUtil';
const { ccclass, property } = _decorator;

@ccclass('meiriTs')
export class meiriTs extends Component {
    // 礼包倒计时
    @property(Label)
    daojishi: Label
    // 领取礼包
    @property(Node)
    lingquWenzi: Node

    protected onEnable(): void {
        this.init()
        director.on(eventType.dayFLLingqu, this.init, this)
    }
    // 初始化
    init() {
        if (dayflMgr.IsLingqu) {
            this.lingquWenzi.active = true
            this.daojishi.node.active = false
        } else {
            this.lingquWenzi.active = false
            this.daojishi.node.active = true
            this.leftDiv()
        }
    }
    /**
    * 用于计算并显示剩余时间的函数
    */
    leftDiv() {
        //   这行代码计算从当前时间到 this.endTime 的剩余时间（以毫秒为单位）
        let leftTime = getDTime() - newTime();
        //   计算剩余时间中的小时数，并取模 24，确保小时数在 0 到 23 之间
        let leftHours = this.addNumber(
            Math.floor((leftTime / 1000 / 60 / 60) % 24)
        );
        //   计算剩余时间中的分钟数，并取模 60，确保分钟数在 0 到 59 之间。
        let leftMinutes = this.addNumber(Math.floor((leftTime / 1000 / 60) % 60));
        //   计算剩余时间中的秒数，并取模 60，确保秒数在 0 到 59 之间。
        let leftSeconds = this.addNumber(Math.floor((leftTime / 1000) % 60));
        //   将计算好的剩余时间格式化为字符串，并更新 TimeLabel 的文本内容
        this.daojishi.string = leftHours + ":" + leftMinutes + ":" + leftSeconds;
        //   如果剩余时间大于 0，使用 setTimeout 每隔 1 秒递归调用 leftDiv 方法，更新剩余时间
        if (leftTime > 0) {
            this.scheduleOnce(() => {
                this.leftDiv()
            }, 1)
        } else {
            // 如果剩余时间小于等于 0，表示时间已经结束
            this.lingquWenzi.active = true
            this.daojishi.node.active = false
            // 将 isFuli 的值设置为 "true"，表示用户可以再次领取礼物
            dayflMgr.IsLingqu = true
        }
    }
    //   如果数字小于 10，则在前面补零
    addNumber(num) {
        let num1 = num > 9 ? num : "0" + num;
        return num1;
    }
    protected onDestroy(): void {
        director.off(eventType.dayFLLingqu, this.init, this)
        this.unscheduleAllCallbacks()
    }
}


