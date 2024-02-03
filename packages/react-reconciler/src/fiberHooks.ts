/* eslint-disable @typescript-eslint/no-explicit-any */
import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
// 记录当前render的函数fiber
let currentlyRenderingFiber: FiberNode | null = null;
// beginWork阶段返回函数组件的子fiber
let workInProgressHook: Hook | null = null;
const { currentDispatcher } = internals;
export function renderWithHooks(wip: FiberNode) {
	// 记录当前render的fiber
	currentlyRenderingFiber = wip;
	// 清空以便创建Hook链表
	wip.memoizedState = null;
	const current = wip.alternate;
	if (current !== null) {
		// update
	} else {
		// mount
		currentDispatcher.current = HooksDispatcherOnMount;
	}
	const Component = wip.type;
	const props = wip.pendingProps;
	const children = Component(props);
	// 重置记录的fiber
	currentlyRenderingFiber = null;
	return children;
}
// 每个fiber的memoizedState指向了hook链表，链表中的每个hook是一个Hook结构，又有自己的memoizedState
interface Hook {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	memoizedState: any;
	updateQueue: unknown;
	next: Hook | null;
}
const HooksDispatcherOnMount: Dispatcher = {
	useState: mountState
};
function mountState<State>(
	initialState: (() => State) | State
): [State, Dispatch<State>] {
	// 找到当前useState对应的hook数据
	const hook = mountWorkInProgressHook();
	// 这是hook的memoizedState,如对应到useState就是state
	let memoizedState;
	if (initialState instanceof Function) {
		memoizedState = initialState();
	} else {
		memoizedState = initialState;
	}
	// 需要能够触发更新
	const queue = createUpdateQueue<State>();
	hook.updateQueue = queue;
	hook.memoizedState = memoizedState;
	const dispatch = dispatchSetState.bind(
		null,
		currentlyRenderingFiber as FiberNode,
		queue as any
	);
	queue.dispatch = dispatch;
	return [memoizedState, dispatch];
}
function dispatchSetState<State>(
	fiber: FiberNode,
	updateQueue: UpdateQueue<State>,
	action: Action<State>
) {
	const update = createUpdate(action);
	enqueueUpdate(updateQueue, update);
	// 与首屏不同，这里是从改变的地方开始，不过还是1会先返回到rootFiber
	scheduleUpdateOnFiber(fiber);
}
function mountWorkInProgressHook(): Hook {
	const hook: Hook = {
		memoizedState: null,
		updateQueue: null,
		next: null
	};
	if (workInProgressHook === null) {
		// mount时的第一个hook
		if (currentlyRenderingFiber === null) {
			throw new Error('请在函数组件内使用hook');
		} else {
			workInProgressHook = hook;
			currentlyRenderingFiber.memoizedState = workInProgressHook;
		}
	} else {
		// 后续
		workInProgressHook.next = hook;
		workInProgressHook = hook;
	}
	return workInProgressHook;
}
