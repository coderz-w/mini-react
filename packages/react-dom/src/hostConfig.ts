import { FiberNode } from 'react-reconciler/src/fiber';
import { HostComponent, HostText } from 'react-reconciler/src/workTags';
// import { DOMElement, updateFiberProps } from './SyntheticEvent';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Container = Element;
export type Instance = Element;
export type TextInstance = Text;

export const createInstance = function (type: string): Instance {
	const element = document.createElement(type) as unknown;
	// updateFiberProps(element as DOMElement, props);
	return element as any;
	//  as DOMElement;
};

export const appendInitialChild = function (
	parent: Instance | Container,
	child: Instance
) {
	parent.appendChild(child);
};

export const createTextInstance = function (content: string) {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;

export function commitUpdate(fiber: FiberNode) {
	switch (fiber.tag) {
		case HostText:
			const text = fiber.memoizedProps.content;
			return commitTextUpdate(fiber.stateNode, text);
		case HostComponent:
		default:
			console.warn('未实现的Update类型', fiber);

			break;
	}
}

export function commitTextUpdate(textInstance: TextInstance, content: string) {
	textInstance.textContent = content;
}

export function removeChild(
	child: Instance | TextInstance,
	container: Container
) {
	container.removeChild(child);
}
