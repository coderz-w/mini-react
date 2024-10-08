import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';
// Update对象
export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	dispatch: Dispatch<State> | null;
}

//创造一次更新
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

//创造更新队列
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			// eslint-disable-next-line
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

//将更新添加到更新队列中
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
	console.log(updateQueue.shared.pending);
};
//
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
