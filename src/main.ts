import "./style.css"

interface Node {
  x: number;
  y: number;
  width: number;
  height: number;
  element: HTMLElement;
}

document.addEventListener('DOMContentLoaded', () => {
  const nodes: Node[] = [
    { x: 100, y: 100, width: 50, height: 50, element: document.createElement('div') },
    { x: 300, y: 100, width: 50, height: 50, element: document.createElement('div') },
    { x: 500, y: 100, width: 50, height: 50, element: document.createElement('div') },
  ];

  const app = document.getElementById('app');
  if (app) {
    nodes.forEach((node, index) => {
      node.element.classList.add('draggable');
      node.element.style.left = `${node.x}px`;
      node.element.style.top = `${node.y}px`;
      node.element.dataset.index = index.toString();
      node.element.style.width = `${node.width}px`;
      node.element.style.height = `${node.height}px`;
      app.appendChild(node.element);
    });
  }

  let draggedNode: Node | null = null;
  let offsetX = 0;
  let offsetY = 0;

  nodes.forEach(node => {
    node.element.addEventListener('mousedown', (e: MouseEvent) => {
      //user is dragging the node
      draggedNode = node;
      //offset is where the mouse is in the element. e.g: 0,0 is the top left corner of the element
      offsetX = e.clientX - node.element.getBoundingClientRect().left;
      offsetY = e.clientY - node.element.getBoundingClientRect().top;
      node.element.style.cursor = 'grabbing';
    });

    // user has stopped dragging the node
    document.addEventListener('mouseup', () => {
      if (draggedNode) {
        draggedNode.element.style.cursor = 'grab';
        draggedNode = null;
      }
    });

    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (draggedNode) {
        const pageX = e.clientX + window.scrollX;
        const pageY = e.clientY + window.scrollY;
        //move the node to the mouse position
        draggedNode.element.style.left = `${pageX - offsetX}px`;
        draggedNode.element.style.top = `${pageY - offsetY}px`;

        const closestNode = findClosestNode(draggedNode);
        if (closestNode) {
          snapToNode(draggedNode, closestNode);
        } else {
          snapToPage(draggedNode);
        }
      }
    });
  });

  function findClosestNode(draggedNode: Node): Node | null {
    const draggedRect = draggedNode.element.getBoundingClientRect();
    let minDistance = Number.MAX_SAFE_INTEGER; // Initialize with a large number
    let closestNode: Node | null = null;
    const threshold = 100;

    nodes.forEach(node => {
      if (node !== draggedNode) {
        const rect = node.element.getBoundingClientRect();

        const distance = getDistanceBetweenPoints(rect.left, rect.top, draggedRect.left, draggedRect.top);
        if (distance < minDistance) {
          minDistance = distance;
          closestNode = node;
        }
      }
    });

    return minDistance < threshold ? closestNode : null;
  }

  const getDistanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) => {
    const y = x2 - x1;
    const x = y2 - y1;

    return Math.sqrt(x * x + y * y);
  }


  const snapToNode = (draggedNode: Node, closestNode: Node): void => {
    const draggedRect = draggedNode.element.getBoundingClientRect();
    const closestRect = closestNode.element.getBoundingClientRect();

    // adding scrollX and scrollY to get the actual position of the element
    const draggedRectLeft = draggedRect.left + window.scrollX;
    const draggedRectRight = draggedRect.right + window.scrollX;
    const draggedRectTop = draggedRect.top + window.scrollY;
    const draggedRectBottom = draggedRect.bottom + window.scrollY;

    const closestRectLeft = closestRect.left + window.scrollX;
    const closestRectRight = closestRect.right + window.scrollX;
    const closestRectTop = closestRect.top + window.scrollY;
    const closestRectBottom = closestRect.bottom + window.scrollY;


    // snap to closest edges
    if (Math.abs(draggedRectLeft - closestRectLeft) < 20) {
      draggedNode.element.style.left = `${closestRectLeft}px`;
    }
    else if (Math.abs(draggedRectRight - closestRectRight) < 20) {
      draggedNode.element.style.left = `${closestRectRight - draggedRect.width}px`;
    }
    // closest center
    else if (Math.abs((draggedRectLeft + draggedRectRight) / 2 - (closestRectLeft + closestRectRight) / 2) < 20) {
      draggedNode.element.style.left = `${(closestRectLeft + closestRectRight) / 2 - draggedRect.width / 2}px`;
    }
    // snap to closest top, bottom or center
    if (Math.abs(draggedRectTop - closestRectTop) < 20) {
      draggedNode.element.style.top = `${closestRectTop}px`;
    } else if (Math.abs(draggedRectBottom - closestRectBottom) < 20) {
      draggedNode.element.style.top = `${closestRectBottom - draggedRect.height}px`;
    } else if (Math.abs((draggedRectTop + draggedRectBottom) / 2 - (closestRectTop + closestRectBottom) / 2) < 20) {
      draggedNode.element.style.top = `${(closestRectTop + closestRectBottom) / 2 - draggedRect.height / 2}px`;
    }
  }

  const snapToPage = (draggedNode: Node): void => {
    const draggedRect = draggedNode.element.getBoundingClientRect();

    const draggedRectLeft = draggedRect.left + window.scrollX;
    const draggedRectRight = draggedRect.right + window.scrollX;
    const draggedRectTop = draggedRect.top + window.scrollY;
    const draggedRectBottom = draggedRect.bottom + window.scrollY;

    // Snap to page edges
    if (Math.abs(draggedRectLeft) < 20) {
      draggedNode.element.style.left = '0px';
      // 800 is the width of the page
    } else if (Math.abs(draggedRectRight - 800) < 20) {
      draggedNode.element.style.left = '750px';
    } else if (Math.abs((draggedRectLeft + draggedRectRight) / 2 - 400) < 20) {
      draggedNode.element.style.left = '375px';
    }

    if (Math.abs(draggedRectTop) < 20) {
      draggedNode.element.style.top = '0px';
    } else if (Math.abs(draggedRectBottom - 600) < 20) {
      draggedNode.element.style.top = '550px';
    } else if (Math.abs((draggedRectTop + draggedRectBottom) / 2 - 300) < 20) {
      draggedNode.element.style.top = '275px';
    }
  }
});
