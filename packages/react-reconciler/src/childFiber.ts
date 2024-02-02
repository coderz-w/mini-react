import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

// 首次更新时需要插入大量dom我们需要分首屏和更新进行对首屏的额外优化
function ChildReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}
	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}
	// 该函数用于打上Placement标记，如果传入需要标记副作用且当前fiber的current为null则说明为首次，需要打上
	function placeSingleChild(fiber: FiberNode) {
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}
	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild: ReactElementType
	) {
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					return placeSingleChild(
						reconcileSingleElement(returnFiber, currentFiber, newChild)
					);
				default:
					console.log('childFiber Wrong');
					break;
			}
		}
		// TODO 多节点
		// 文本
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			return placeSingleChild(
				reconcileSingleTextNode(returnFiber, currentFiber, newChild)
			);
		}
		//都不匹配
		console.log('other Type');
		return null;
	};
}

// 分别导出
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFiber = ChildReconciler(false);
