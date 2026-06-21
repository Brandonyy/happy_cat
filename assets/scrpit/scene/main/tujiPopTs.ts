import { _decorator, Component, director, instantiate, Label, log, Node, Prefab } from 'cc';
import { eventType } from '../../configs/pathName';
import { daojuConfig } from '../../configs/daojuConfig';
import { daojuType } from '../../configs/daojuType';
import { wupinMgr } from '../../managers/wupinMgr';
import { wupinType } from '../../configs/wupinType';
import { tujiItemTs } from './tujiItemTs';
import { tujiMgr } from '../../managers/tujiMgr';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('tujiPopTs')
export class tujiPopTs extends Component {
    // 图鉴预制体
    @property(Prefab)
    tujiItem: Prefab = null
    // 图鉴收集数量
    @property(Label)
    jiqiNum: Label = null
    // 图鉴父节点
    @property(Node)
    tujiItemMain: Node = null
    protected onEnable(): void {
        adMgr.showBanner()
        // 初始化已收集的总数为0
        let zongShu: number = 0
        // 遍历所有配置项
        for (let i = 0; i < daojuConfig.length; i++) {
            // 获取当前配置项的数据
            const tujiItemData = daojuConfig[i];
            // 解构赋值，获取配置项的id和type
            const { id, type } = tujiItemData
            // 如果配置项的类型不是cangpin，则跳过当前循环
            if (type !== wupinType.cangpin) continue
            // 实例化collectItemPre预制体
            const tjItemNode: Node = instantiate(this.tujiItem)
            // 将实例化的节点添加到itemBox节点中
            this.tujiItemMain.addChild(tjItemNode)
            // 获取collectItemNode节点上的CollectItem组件
            const itemTs: tujiItemTs = tjItemNode.getComponent(tujiItemTs)
            // 设置CollectItem组件的数据为当前配置项的数据
            itemTs.tujiData = tujiItemData
            itemTs.updateTuji()
            // 已收集的总数加1
            zongShu++
        }
        // 更新已收集的数量显示
        this.jiqiNum.string = `已收集${tujiMgr.getNum()}/${zongShu}`
    }
    /**
     * 关闭
     */
    onGuanbi() {
        adMgr.hideBanner()
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 关闭当前节点
        this.node.destroy()
    }
}


