import { _decorator, Component, director, Node } from 'cc';
import { redTishi } from './redTishi';
import { dayflMgr } from '../managers/dayflMgr';
import { guoguanJiangliMgr } from '../managers/guoguanJiangliMgr';
import { gameConfig } from '../configs/gameConfig';
import { maobiMgr } from '../managers/maobiMgr';
import { homeMgr } from '../managers/homeMgr';
import { tujiMgr } from '../managers/tujiMgr';
import { eventType } from '../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('mainRedTishiTs')
export class mainRedTishiTs extends Component {
    // 每日福利红点提示
    @property(redTishi)
    meitiFuli: redTishi
    // 过关奖励红点提示
    @property(redTishi)
    guoguanJiangli: redTishi
    // 扭蛋红点提示
    @property(redTishi)
    choujiang: redTishi = null
    // 家园红点提示
    @property(redTishi)
    home: redTishi = null
    //图集红点提示
    @property(redTishi)
    tuji: redTishi = null
    start() {
        this.initRedTishi()
        // 监听红点提示
        director.on(eventType.redTishi, this.initRedTishi, this)
    }
    protected onDestroy(): void {
        director.off(eventType.redTishi, this.initRedTishi, this)
    }
    initRedTishi() {
        this.meitiFuli.updateRedTishiShow = dayflMgr.IsLingqu
        this.guoguanJiangli.updateRedTishiShow = !guoguanJiangliMgr.isHuodeSuoyou() && guoguanJiangliMgr.canHuodeJiangli()
        this.choujiang.updateRedTishiShow = maobiMgr.getMaobi >= gameConfig.choujiang1
        this.home.updateRedTishiShow = maobiMgr.getMaobi >= gameConfig.homeJiesuoJinbi && !homeMgr.isQuanbuJiesuo()
        this.tuji.updateRedTishiShow = tujiMgr.hasCanjiesuo()
        // 更新红点的显示状态
        this.meitiFuli.onUpdate()
        this.guoguanJiangli.onUpdate()
        this.choujiang.onUpdate()
        this.home.onUpdate()
        this.tuji.onUpdate()
    }
}


