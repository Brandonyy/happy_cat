import { _decorator, instantiate, Node, NodePool, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('poolMgr')
export class poolMgr {
    private ziDianPool: { [key: string]: NodePool } = {};
    private ziDianPrefab: { [key: string]: Prefab } = {};
    /**
     * 单例
     */
    static _ins: poolMgr;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new poolMgr();
        return this._ins;
    }
    /**
     * 将一个Prefab类型的对象与一个字符串name关联起来，存储在一个名为uiPrefab的字典中
     */
    public setPrefab(name: string, prefab: Prefab): void {
        this.ziDianPrefab[name] = prefab;
    }

    public getPrefab(name: string): Prefab {
        return this.ziDianPrefab[name];
    }
    /**
     * 一个对象池中获取节点（Node），如果对象池中没有可用的节点，则从预制件（Prefab）创建一个新的节点
     */
    getPoolNode(preName: string, parent?: Node, pos?: Vec3) {
        let tempPre: Prefab;
        let name;
        //   首先判断prefab参数是字符串还是Prefab对象，如果是字符串
        if (typeof preName === 'string') {
            // 如果是字符串，则从字典_dictPrefab中获取对应的Prefab对象，并设置名字name
            tempPre = this.ziDianPrefab[preName];
            name = preName;
        }
        let node: Node;
        //   检查_dictPool字典中是否存在以name为键的NodePool
        if (this.ziDianPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this.ziDianPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                if (!tempPre) {
                    console.log('Pool invalid prefab name = ', name);
                    return null;
                }
                node = instantiate(tempPre);
            }
        } else {
            if (!tempPre) {
                console.log('Pool invalid prefab name = ', name);
                return null;
            }
            //没有对应对象池，创建他！
            let pool = new NodePool();
            this.ziDianPool[name] = pool;
            node = instantiate(tempPre);
        }
        if (parent) {
            node.parent = parent;
            node.active = true;
            if (pos) node.position = pos;
        }
        return node;
    }
    /**
     * 用于将一个游戏引擎中的节点（Node）放入一个对象池（NodePool），以便于后续的复用
     * @param node 表示要放入对象池的游戏节点
     * @param isActive 用于控制节点的激活状态
     * @returns 
     */
    public huiShouNode(node: Node | null, isActive = false) {
        // 首先检查 node 是否为 null 或 undefined。如果是，直接返回
        if (!node) {
            return;
        }
        let nodeName = node.name;
        // 初始化一个局部变量 pool，用于存储节点所属的对象池实例。
        let pool = null;
        node.active = isActive
        // 检查 _dictPool 对象是否已经包含了一个与 node.name 相关联的对象池
        if (this.ziDianPool.hasOwnProperty(nodeName)) {
            //已有对应的对象池
            pool = this.ziDianPool[nodeName];
        } else {
            //没有对应对象池，创建他！
            pool = new NodePool();
            // 如果没有找到，创建一个新的 NodePool 实例，并将其存入 _dictPool 中，以 node.name 为键。
            this.ziDianPool[nodeName] = pool;
        }
        // 调用 pool.put(node) 方法，将 node 放入对应类型的对象池中
        pool.put(node);
    }
}


