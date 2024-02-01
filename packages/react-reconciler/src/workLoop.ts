import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';

// 指向当前工作的fiber
let workInProgress: FiberNode | null = null;

// 改变当前工作工作fiber
function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}
// renderRoot由触发更新的api执行如reactDom.createRoot,setState
function renderRoot(root: FiberNode) {
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('wornLoop错误');
			workInProgress = null;
		}
	} while (true);
}
// workLoop循环
function workLoop() {
	while (workInProgress != null) {
		performUnitOfWork(workInProgress);
	}
}
// 每个工作单元的调用执行
function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}
// 归时工作单元处理的调用
function completeUnitOfWork(fiber: FiberNode) {
	let node = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		(node as FiberNode | null) = node.return;
		workInProgress = node;
	} while (node !== null);
}
