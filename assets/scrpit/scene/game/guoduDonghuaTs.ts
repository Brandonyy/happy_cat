import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('guoduDonghuaTs')
export class guoduDonghuaTs extends Component {
    protected onEnable(): void {
        // 获取当前节点的所有子节点，将其存储在数组中
        const cat: Node[] = this.node.children
        for (let i = 0; i < cat.length; i++) {
            // 获取当前遍历到的子节点
            const pig: Node = cat[i];
            // 为当前子节点创建一个动画序列
            tween(pig).sequence(
                // 第一个动画：在0.2秒内将节点的旋转角度变为8度
                tween(pig).to(0.2, { angle: 8 }),
                // 第二个动画：在0.2秒内将节点的旋转角度变为-8度
                tween(pig).to(0.2, { angle: -8 })
                // 让动画序列无限循环
            ).repeatForever().start()
            // 为当前子节点创建另一个动画，在1秒内将节点的位置沿x轴负方向移动2000个单位
            tween(pig).by(1, { position: v3(-2000, 0, 0) }).start()
        }
        // 延迟1秒后执行关闭界面的操作
        this.scheduleOnce(() => {
            this.node.destroy()
        }, 1)
    }
}


