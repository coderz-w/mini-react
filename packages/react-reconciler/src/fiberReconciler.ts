import { Container } from 'hostConfig';
import { HostRoot } from './workTags';
import { FiberNode, FiberRootNode } from './fiber';
import {
	UpdateQueue,
	createUpdate,
	createUpdateQueue,
	enqueueUpdate
} from './updateQueue';
import { ReactElementType } from 'shared/ReactTypes';
import { scheduleUpdateOnFiber } from './workLoop';
// createRoot调用
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root;
}
// Render调用
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
): ReactElementType | null {
	const hostRootFiber = root.current;
	console.log(element);
	const update = createUpdate<ReactElementType | null>(element);
	console.log(update);
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	console.log(hostRootFiber);
	scheduleUpdateOnFiber(hostRootFiber);
	return element;
}
