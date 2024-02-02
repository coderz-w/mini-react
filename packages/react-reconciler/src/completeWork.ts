import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';
// eslint-disable-next-line
export const completeWork = (wip: FiberNode): any => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;
	// 构建离屏幕dom树 构建 插入
	switch (wip.tag) {
		case HostComponent:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 首屏
				const instance = createInstance(wip.type, newProps);
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// 首屏
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		default:
			console.warn('未处理的completeWork', wip);
			break;
	}
};

// 将子dom节点插入,这里的parent其实就是根据wip创建出来的dom节点
// demo <wipElement>......manyChild<wipElement/>
/**
首先是一个外层循环
进入循环判断child节点是否为原生类型节点或者其他类型(函数组件等)，如果是原生类型就可以把child直接插入

1.如果是<wipElement><div>xxxxx<div/><wipElement/>
这样的话循环其实已经结束了，因为我们是一个归的过程，div节点已经调用过appendAllChildren将他的子节点添加到了div上，我们只需要添加div到wip上其实就可以了，下面是
这种情况的流程:
首先
if (node.tag === HostComponent || node.tag === HostText) {
	    appendInitialChild(parent, node?.stateNode);
}
进入这里添加了div，然后
if (node === wip) {
	return;
}
这个没有进入
while (node.sibling === null) {
	if (node.return === null || node.return === wip) {
		return;
	}
	node = node?.return;
}
进入这里，触发node.return===wip,结束
2.如果是<wipElement><div1/><div2/><wipElement/>
前两部分处理一致，第三部分没有进入，然后
	node.sibling.return = node.return;
	node = node.sibling;
改变node指向为wip的child的邻节点，然后进入下一次循环，我们改变了node.sibling.return = node.return;，因此下次循环基本等同于上一个情况
3.如果是<wipElement><otherElement><div1/><otherElement/><wipElement/>
我们会在
if (node.tag === HostComponent || node.tag === HostText) {
		appendInitialChild(parent, node?.stateNode);
} else if (node.child !== null) {
	node.child.return = node;
	node = node.child;
	continue;
}
进入第二种情况，然后如1，2两种情况处理

 */
function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;

	while (node !== null) {
		// 第一部分
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}

		// 第二部分
		if (node === wip) {
			return;
		}
		// 第三部分
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child !== null) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
