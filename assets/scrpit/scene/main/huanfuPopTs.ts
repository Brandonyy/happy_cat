import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { huanfuItemTs } from './huanfuItemTs';
import { eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;
const hfItemList = [0, 1, 2, 3]
@ccclass('huanfuPopTs')
export class huanfuPopTs extends Component {
    // 装修列表预制体
    @property(Prefab)
    hfItem: Prefab = null
    // 滚动窗口内容
    @property(Node)
    gdMain: Node = null
    protected onEnable(): void {
        // 初始化界面
        if (this.gdMain.children.length > 0) {
            return
        }
        // 获取装饰物品配置的数量
        const piNum = hfItemList.length
        // 遍历装饰物品配置，创建并添加装饰物品到界面
        for (let i = 0; i < piNum; i++) {
            // 获取当前装饰物品的配置数据
            const hfData = hfItemList[i];
            // 创建装饰列表项。
            // 使用预制体实例化一个装饰物品节点
            const hfItemNode: Node = instantiate(this.hfItem)
            // 将装饰物品节点添加到内容节点下
            this.gdMain.addChild(hfItemNode)
            // 获取装饰物品节点上的DecItem组件
            const hfItemTs = hfItemNode.getComponent(huanfuItemTs)
            // // 将传入的配置数据赋值给DecItem组件的Data属性
            hfItemTs.hfData = hfData
        }

    }
    /**
     * 关闭弹窗界面
     */
    onGuanbi(): void {
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 销毁当前节点
        poolMgr.ins.huiShouNode(this.node)
    }
}


