import { _decorator, Component, director, Label, Node, ProgressBar } from 'cc';
import { guoguanJiangliMgr } from '../../managers/guoguanJiangliMgr';
import { gameData } from '../../configs/gameData';
import { eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('guoguanJiangliPopTs')
export class guoguanJiangliPopTs extends Component {
    // 进度条
    @property(ProgressBar)
    jindu: ProgressBar = null
    // 进度提示
    @property(Label)
    jinduTishi: Label = null
    // 提示1，还有多少关可以领取奖励
    @property(Label)
    zaiguojiguan: Label = null
    // 提示2,已全部领取奖励
    @property(Label)
    yilingqusuoyou: Label = null
    // 领取按钮
    @property(Node)
    lingjiangBtn: Node = null
    protected onEnable(): void {
        adMgr.showBanner()
        this.gengxinJiangli()
    }
    /**
     * 领取奖励按钮
     */
    onLingqu() {
        // 获取奖励
        guoguanJiangliMgr.huodeJiangli()
        // 更新界面中状态
        this.gengxinJiangli()
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 关闭弹窗
        this.node.destroy()
    }
    /**
     * 关闭弹窗
     */
    onGuanbi() {
        adMgr.hideBanner()
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 关闭弹窗
        this.node.destroy()
    }
    /**
     * 更新界面中状态
     */
    gengxinJiangli() {
        // 检查是否可以领取奖励
        const canHuodeJiangli: boolean = guoguanJiangliMgr.canHuodeJiangli()
        // 检查是否所有奖励都已领取
        const isHuodeSuoyou: boolean = guoguanJiangliMgr.isHuodeSuoyou()
        // 还有几关可以领取奖励的提示，是否显示（没有领取完且暂时不能领取的奖励时）
        this.zaiguojiguan.node.active = !isHuodeSuoyou && !canHuodeJiangli
        // 已经领取全部奖励的提示，是否显示（已经领取完时显示 ）
        this.yilingqusuoyou.node.active = isHuodeSuoyou
        // 领取按钮是否显示（没有领取完且可以领取时显示）
        this.lingjiangBtn.active = !isHuodeSuoyou && canHuodeJiangli
        // 获取下一个奖励数据
        const jldata = guoguanJiangliMgr.JlData
        // 获取下一个奖励关卡
        const passLevel: number = jldata.passLevel
        // 获取当前游戏等级
        const putongLevel: number = gameData.putongLevel - 1
        // 计算需要达到的关卡(当前关卡和奖励关卡数哪个最小)
        const xuyaoLevel: number = Math.min(putongLevel, passLevel)
        // 更新提示标签的显示
        this.zaiguojiguan.string = `再过${passLevel - xuyaoLevel}关可领取奖励`
        // 更新进度标签的显示
        this.jinduTishi.string = `${xuyaoLevel}/${passLevel}`
        // 更新进度条的显示
        this.jindu.progress = (xuyaoLevel) / passLevel
    }
}


