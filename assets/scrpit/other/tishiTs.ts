import { _decorator, Component, Label, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('tishiTs')
export class tishiTs extends Component {
    // 提示文本
    @property(Label)
    tishiLable: Label = null;
    // 不透明度组件
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;  // 透明度组件
    donghua() {
        this.node.scale = v3(0, 0, 0)
        const pos = this.node.getPosition()
        // 播放提示文本的动画
        tween(this.node)
            .to(0.3, { scale: Vec3.ONE }, { easing: "elasticOut" })
            .delay(0.8)
            .parallel( // 同时执行透明度变化
                tween(this.node).to(0.5, { position: v3(0, pos.y + 300, 0) }),
                tween(this.uiOpacity)
                    .to(0.5, { opacity: 0 }) // 逐渐变透明
            )
            .call(() => {
                this.node.destroy()
            })
            .start();
    }
    // 初始化提示文本
    setTitle(val: string = '喵~~~~!') {
        // 如果提示文本组件存在，则设置提示文本
        this.tishiLable.string = val;
        this.donghua()
    }
}


