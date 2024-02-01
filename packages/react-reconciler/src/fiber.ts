import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
export class FiberNode {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	stateNode: any;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;
	ref: Ref;
	memoizedProps: Props | null;
	alternate: FiberNode | null;
	flags: Flags;
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.key = key;
		// stateNode代表对应dom
		this.stateNode = null;
		this.type = null;
		// 节点关系
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;
		this.ref = null;
		// 工作单元所需属性
		// 工作前props
		this.pendingProps = pendingProps;
		// 工作后props
		this.memoizedProps = null;
		this.alternate = null;
		this.flags = NoFlags;
	}
}
