import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('redTishi')
export class redTishi extends Component {
    // 红点是否显示
    updateRedTishiShow: boolean = null

    protected start(): void {
        // 立即调用一次 onUpdate 方法，确保组件在开始时就进行一次更新
        this.onUpdate()
    }
    /**
        * 每帧更新时调用的方法。
        * 此方法用于检查是否有更新函数，如果有则执行该函数并根据返回值设置节点的激活状态。
        */
    onUpdate(): void {
        // 调用更新函数，并将返回值赋给节点的 active 属性，以控制节点的显示与隐藏
        this.node.active = this.updateRedTishiShow
    }
}


