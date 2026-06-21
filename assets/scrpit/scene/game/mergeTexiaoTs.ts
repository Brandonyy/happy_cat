import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mergeTexiaoTs')
export class mergeTexiaoTs extends Component {
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null!;
    protected onEnable(): void {
        this.spine.setCompleteListener(() => {
            // 动画播放完毕后销毁节点
            this.node.destroy();
        });
    }
}


