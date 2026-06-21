import { _decorator, Component, director, instantiate, Node, PageView, Prefab } from 'cc';
import { eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('homePopTs')
export class homePopTs extends Component {
    // 页面视图选项预制体
    @property(Prefab)
    jiayuanItemPre: Prefab = null
    // 页面视图组件
    @property(PageView)
    pageView: PageView = null
    // 最大页数
    maxPageCnt: number = 0
    // 当前页数
    curPageCnt: number = 0
    protected start(): void {
        // 三张图
        for (let i = 0; i < 3; i++) {
            // 实例化HomeItem预制体
            const jiayuanItemNode: Node = instantiate(this.jiayuanItemPre)
            // 将实例化的节点添加到PageView中
            this.pageView.addPage(jiayuanItemNode)
        }
        // 更新最大页面数
        this.maxPageCnt = this.pageView.content.children.length
    }

    /**
     * 切换页面触发
     */
    onPageChange() {
        // 更新页面状态
        director.emit(eventType.jiesuoHome)
    }
    /**
    * 关闭家园界面
    */
    onGuanbi() {
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 销毁当前页面
        this.node.destroy()
    }
}


