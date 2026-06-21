import { _decorator, Component, Label, Node, tween, UIOpacity, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('nanduTipTs')
export class nanduTipTs extends Component { // 提示文字
    @property(Label)
    nanduTitle: Label = null
    // 提示背景图案
    @property(Node)
    nanduStyle: Node = null
    // 提示UI的不透明度
    @property(UIOpacity)
    naduOpacity: UIOpacity = null
    donghua() {
        // 使用tween动画将提示标签的节点在0.5秒内移动到(0, 0, 0)位置，使用sineOut缓动效果
        tween(this.nanduTitle.node).to(0.5, { position: v3(0, 0, 0) }, { easing: 'sineOut' }).start()
        // 使用tween动画将箭头节点在10秒内移动到(850, 0)位置
        tween(this.nanduStyle).to(10, { position: v3(850, 0) }).start()
        // 使用tween动画延迟2秒后，在1秒内将UI不透明度组件的不透明度设置为0，然后调用回调函数销毁节点
        tween(this.naduOpacity).delay(2).to(1, { opacity: 0 }).call(() => {
            this.node.destroy()
        }).start()
    }
    /**
     * 设置提示文本
     */
    setTips(tips: string = '喵~~~~!') {
        // 提示文本
        this.nanduTitle.string = tips
        this.donghua()
    }

}


