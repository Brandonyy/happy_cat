import { _decorator, Component, Node, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('lrDouDongTs')
export class lrDouDongTs extends Component {
    @property
    ddAng: number = 15
    @property
    ddTime: number = 0.1
    @property
    yanChi: number = 2
    tw = null
    protected start(): void {
        // 创建tween动画对象
        this.tw = tween(this.node)
        // 定义动画序列
        this.tw.sequence(
            // 延迟指定时间
            tween(this.node).delay(this.yanChi),
            // 在指定时间内旋转到指定角度
            tween(this.node).to(this.ddTime, { angle: this.ddAng }),
            // 在指定时间内旋转到相反角度
            tween(this.node).to(this.ddTime, { angle: -this.ddAng }),
            // 重复摆动效果
            tween(this.node).to(this.ddTime, { angle: this.ddAng }),
            tween(this.node).to(this.ddTime, { angle: -this.ddAng }),
            // 最后回到初始角度
            tween(this.node).to(this.ddTime, { angle: 0 }),
            // 无限循环播放动画
        ).repeatForever().start()
    }
}


