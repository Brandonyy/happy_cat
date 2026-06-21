import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('chacaoTs')
export class chacaoTs extends Component {
    // 保存原始的世界坐标
    yuanWorldPos: Vec3 = null
    start() {
        // 调度一个一次性回调，在 0.1 秒后执行
        this.scheduleOnce(() => {
            // 获取当前节点的世界坐标，并保存到 orgWorldPos 属性中
            this.yuanWorldPos = this.node.getWorldPosition()
        }, 0.1)
    }
    protected onDestroy(): void {
        this.unscheduleAllCallbacks()
    }
}


