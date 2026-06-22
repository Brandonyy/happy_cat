import { _decorator, Component, Node, sys } from 'cc';
import { shezhiMgr } from '../../managers/shezhiMgr';
import { wupinMgr } from '../../managers/wupinMgr';
import { gameData } from '../../configs/gameData';
import { bendiUtil } from '../../utils/bendiUtil';
import { tujiMgr } from '../../managers/tujiMgr';
import { guoguanJiangliMgr } from '../../managers/guoguanJiangliMgr';
import { dayflMgr } from '../../managers/dayflMgr';
import { huanfuMgr } from '../../managers/huanfuMgr';
import { homeMgr } from '../../managers/homeMgr';
import { adMgr } from '../../adWxDy/adMgr';
import { gameConfig } from '../../configs/gameConfig';
const { ccclass, property } = _decorator;

@ccclass('initData')
export class initData extends Component {
    protected start(): void {
        // 判断当前平台
        gameData.pingtai = sys.platform;
        shezhiMgr.init()
        wupinMgr.init()
        tujiMgr.init()
        dayflMgr.init()
        huanfuMgr.init()
        homeMgr.init()
        dayflMgr.init()
        guoguanJiangliMgr.init()
        // 初始化关卡
        gameData.putongLevel = bendiUtil.getItem('level') || gameData.putongLevel
        // 插槽固定从永久基础槽位起步；6/7 槽改为每关看广告临时解锁、过关重置，不再持久化
        gameConfig.chacaoNum = gameConfig.baseChacaoNum
        // 清除旧版本遗留的永久解锁存档键，避免旧数据让 6/7 槽一直处于已解锁状态
        bendiUtil.removeItem('chacaoNum')
        // 初始化广告
        adMgr.createBannerAd()
        adMgr.createChaPingAd()
        adMgr.createVideoAd()
    }
}


