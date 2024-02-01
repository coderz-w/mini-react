import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';

// 递归 递阶段
// 该阶段需要对比子fiber Node的current fiberNode 和 reactElement 来获取下一个wip
// eslint-disable-next-line
export const beginWork = (wip: FiberNode): any => {
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		// case FunctionComponent:
		// 	return updateFunctionComponent(wip, wip.type, renderLane);
		default:
			console.log('beginWrong', wip);
			break;
	}
};
function updateHostRoot(wip: FiberNode) {
	// 计算最新值
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	// 第一次渲染时其实拿到的memoizedState就是reactDom.createElement('#root).render(<Element/>)中Element对应的reactElement对象
	const { memoizedState } = processUpdateQueue(baseState, pending);
	const nextChildren = wip.memoizedState;
	// reconcileChildren(wip, nextChildren);
	return wip.child;
}
// hostComponent无法触发更新
function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	// reconcileChildren(wip, nextChildren);
	return wip.child;
}
