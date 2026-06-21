import { _decorator, Component, director, Node, tween, UIOpacity } from 'cc';
import { eventType } from '../../configs/pathName';
import { musicMgr } from '../../managers/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('jinggaoBgTs')
export class jinggaoBgTs extends Component {
    // 节点透明度
    @property(UIOpacity)
    uiOpacity: UIOpacity = null
    onLoad() {
        this.node.active = false
        director.on(eventType.useDongjie, this.deleteNode, this)
        director.on(eventType.fuhuo, this.deleteNode, this)
        director.on(eventType.jinggaoTime, this.jinggaoTime, this)
    }
    protected start(): void {
        this.shanshuoDh()
    }
    protected onDestroy(): void {
        director.off(eventType.useDongjie, this.deleteNode, this)
        director.off(eventType.fuhuo, this.deleteNode, this)
        director.off(eventType.jinggaoTime, this.jinggaoTime, this)
    }
    shanshuoDh() {
        // 定义动画持续时间为 0.5 秒
        const chixuTime = 0.5
        // 创建一个 tween 动画序列,闪烁动画
        tween(this.uiOpacity).sequence(
            // 第一个动画，在 duration 时间内将 opacity 从当前值变为 50
            tween(this.uiOpacity).to(chixuTime, { opacity: 50 }),
            // 第二个动画，在 duration 时间内将 opacity 从 50 变为 255
            tween(this.uiOpacity).to(chixuTime, { opacity: 255 })
            // 无限重复这个动画序列
        ).repeatForever().start()
    }
    jinggaoTime(val) {
        // 记录节点的前一个激活状态
        const beforeActive: boolean = this.node.active
        if (val > 0 && val <= 5) {
            // 更新节点的激活状态
            this.node.active = true
        } else {
            // 更新节点的激活状态
            this.node.active = false
        }
        // 如果节点的激活状态从非激活变为激活，则播放音效
        if (!beforeActive && this.node.active) {
            musicMgr.ins.playSound('a倒计时')
        }
    }
    /**
     * 销毁节点
     */
    deleteNode(): void {
        this.node.destroy()
    }
}


