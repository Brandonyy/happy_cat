import { _decorator, Component, Node } from 'cc';
import { poolMgr } from '../../managers/poolMgr';
const { ccclass, property } = _decorator;
const tt = window['tt'];
@ccclass('cebianlanPopTs')
export class cebianlanPopTs extends Component {
    // 关闭按钮
    onGuanbi() {
        poolMgr.ins.huiShouNode(this.node)
    }
    // 点击自动跳转到侧边栏
    onCebian() {
        poolMgr.ins.huiShouNode(this.node)
        tt.navigateToScene({
            scene: 'sidebar',
            success: (res) => {
                console.log("check scene success: ", res);
            },
            fail: (res) => {
                console.log("check scene fail:", res);
            }
        })
    }

}


