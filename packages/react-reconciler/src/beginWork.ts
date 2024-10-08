import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { mountChildFiber, reconcileChildFibers } from './childFiber';
import { renderWithHooks } from './fiberHooks';

// 递归 递阶段
// 该阶段需要对比子fiber Node的current fiberNode 和 reactElement 来获取下一个wip
// eslint-disable-next-line
export const beginWork = (wip: FiberNode): any => {
	console.log(wip, 'beginWork循环');
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
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
	console.log(pending, '我是pending，我马上被消费');
	updateQueue.shared.pending = null;
	// 第一次渲染时其实拿到的memoizedState就是reactDom.createElement('#root).render(<Element/>)中Element对应的reactElement对象
	const { memoizedState } = processUpdateQueue(baseState, pending);
	console.log(memoizedState, '我是memoizedState');
	wip.memoizedState = memoizedState;
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
// hostComponent无法触发更新
function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}
function reconcileChildren(wip: FiberNode, children: ReactElementType) {
	const current = wip.alternate;
	console.log('创建子fiber', current, '这是current');
	console.log(children, '这是children的reactElement');
	if (current !== null) {
		// update时，这里会有一种特殊情况，因为hostRootFiber肯定存在2个所以首屏的hostRootFiber也会进入这里
		console.log('update和hostRoot的创建子节点');
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount时
		wip.child = mountChildFiber(wip, null, children);
	}
}
