import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

// 指向当前工作的fiber
let workInProgress: FiberNode | null = null;

// 改变当前工作工作fiber
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}
// renderRoot由触发更新的api执行如reactDom.createRoot,setState
function renderRoot(root: FiberRootNode) {
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
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;
	// eslint-disable-next-line
	console.log((finishedWork?.updateQueue as any).shared.pending, '准备commit');
	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		console.log(finishedWork, 'finishedWork');
		return;
	}
	// 消费后重置
	root.finishedWork = null;
	console.log('commit start');
	// 判断是否有需要3个子阶段执行的操作
	// beforeMutation
	// mutation
	// Layout
	// commit阶段任务1.fiber树的切换，执行时间文mutation后，layout前 2.执行placeMent等操作
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) != NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// 无论是否需要操作都需要切换fiber树
		commitMutationEffects(finishedWork);
		console.log('分支一');
		root.current = finishedWork;
	} else {
		console.log('分支2');
		root.current = finishedWork;
	}
}
// workLoop循环
function workLoop() {
	while (workInProgress != null) {
		performUnitOfWork(workInProgress);
	}
}
// 每个工作单元的调用执行
function performUnitOfWork(fiber: FiberNode) {
	console.log('每个工作单元');
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

// 当某个节点触发更新时递归回到fiberRootNode重新render
function markUpdateFiber(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if ((node.tag = HostRoot)) {
		return node.stateNode;
	}
	return null;
}
// 连接render后触发的更新
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	const root = markUpdateFiber(fiber);
	renderRoot(root);
}
