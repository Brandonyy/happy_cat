import { _decorator, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
@ccclass('poolMgr')
export class poolMgr {
    private ziDianPool: { [key: string]: NodePool } = {};
    private ziDianPrefab: { [key: string]: Prefab } = {};
    /** 单例 */
    static _ins: poolMgr;

    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new poolMgr();
        return this._ins;
    }

    /** 按名称登记预制体，供对象池创建节点。 */
    public setPrefab(name: string, prefab: Prefab): void {
        this.ziDianPrefab[name] = prefab;
    }

    public getPrefab(name: string): Prefab {
        return this.ziDianPrefab[name];
    }

    /** 优先复用池中节点；池为空时实例化预制体。 */
    getPoolNode(preName: string, parent?: Node, pos?: Vec3) {
        let prefab: Prefab;
        let poolName;
        if (typeof preName === 'string') {
            prefab = this.ziDianPrefab[preName];
            poolName = preName;
        }
        let node: Node;
        const hasPool = this.ziDianPool.hasOwnProperty(poolName);
        const pool = hasPool ? this.ziDianPool[poolName] : null;
        if (hasPool && pool.size() > 0) {
            node = pool.get();
        } else {
            if (!prefab) {
                console.log('Pool invalid prefab name = ', poolName);
                return null;
            }
            if (!hasPool) {
                this.ziDianPool[poolName] = new NodePool();
            }
            node = instantiate(prefab);
        }
        if (parent) {
            node.parent = parent;
            node.active = true;
            if (pos) node.position = pos;
        }
        return node;
    }

    /** 按节点自身名称回收；未指定父节点时，取出节点不主动恢复 active。 */
    public huiShouNode(node: Node | null, isActive = false) {
        if (!node) {
            return;
        }
        let poolName = node.name;
        let pool = null;
        node.active = isActive;
        if (this.ziDianPool.hasOwnProperty(poolName)) {
            pool = this.ziDianPool[poolName];
        } else {
            pool = new NodePool();
            this.ziDianPool[poolName] = pool;
        }
        pool.put(node);
    }
}
