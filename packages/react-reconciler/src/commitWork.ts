import { Container, appendChildToContainer } from 'hostConfig';
import { FiberNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';
let nextEffect: FiberNode | null = null;
export const commitMutationEffects = (finishedWork: FiberNode) => {
	nextEffect = finishedWork;
	// 这里的遍历可以帮我们定位到最深(也不一定最深)的发生变化的节点(叶子节点或者不存在子元素变化的节点)，也就是说我们会通过递先找到他，然后在归的时候再进行我们的操作
	while (nextEffect != null) {
		// 向下遍历
		const child: FiberNode | null = nextEffect.child;
		// 子节点还有mutation
		if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child != null) {
			nextEffect = child;
		} else {
			up: while (nextEffect !== null) {
				commitMutationEffectsOnFiber(nextEffect);
				const sibling: FiberNode | null = nextEffect.sibling;
				if (sibling !== null) {
					nextEffect = sibling;
					break up;
				}
				nextEffect = nextEffect.return;
			}
		}
	}
};
function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
	const flags = finishedWork.flags;
	if ((flags & Placement) !== NoFlags) {
		commitPlacement(finishedWork);
		finishedWork.flags &= ~Placement;
	}
}

function commitPlacement(finishedWork: FiberNode) {
	const hostParent = getHostParent(finishedWork);
	appendPlacementNodeIntoContainer(finishedWork, hostParent);
}
function getHostParent(fiber: FiberNode) {
	let parent = fiber.return;
	while (parent) {
		const parentTag = parent.tag;
		if (parentTag === HostComponent) {
			return parent.stateNode;
		}
		if (parentTag === HostRoot) {
			return parent.stateNode.container;
		}
		parent = parent.return;
	}
	console.log('未找到parent');
}

function appendPlacementNodeIntoContainer(
	finishedWork: FiberNode,
	hostParent: Container
) {
	//fiber host
	if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
		appendChildToContainer(hostParent, finishedWork.stateNode);
		return;
	}
	const child = finishedWork.child;
	if (child !== null) {
		appendPlacementNodeIntoContainer(child, hostParent);
		let sibling = child.sibling;

		while (sibling !== null) {
			appendPlacementNodeIntoContainer(sibling, hostParent);
			sibling = sibling.sibling;
		}
	}
}
