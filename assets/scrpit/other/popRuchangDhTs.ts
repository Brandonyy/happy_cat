import { _decorator, Component, easing, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('popRuchangDhTs')
export class popRuchangDhTs extends Component {
    protected start(): void {
        // 初始化节点的缩放为0
        this.node.setScale(Vec3.ZERO);
        // 创建一个tween动画
        tween(this.node)
            .to(0.2, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: easing.backOut })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: easing.linear })
            .start();
    }
}


