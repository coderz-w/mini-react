import { Action } from 'shared/ReactTypes';
// Update对象
export interface Update<State> {
	action: Action<State>;
}
// UpdateQueue
export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}
export const createUpdate = <State>(action: Action<State>): Update<State> => ({
	action
});
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};
// 向UpdateQueue中增加update对象
export const enqueueUpdate = <State>(
	UpdateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	UpdateQueue.shared.pending = update;
};
// 消费update对象
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			result.memoizedState = action(baseState);
		} else {
			result.memoizedState = action;
		}
	}
	return result;
};
