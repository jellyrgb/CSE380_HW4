import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

class Node {
    index: number;
    gCost: number;
    hCost: number;
    parent: Node | null;

    constructor(index: number) {
        this.index = index; 
        this.gCost = 0;
        this.hCost = 0;
        this.parent = null;
    }

    get fCost(): number {
        return this.gCost + this.hCost;
    }
}

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {

    /**
     * @see NavPathStrat.buildPath()
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {

        const path = new NavigationPath(new Stack());
        const startNodeIndex = this.mesh.graph.snap(from);
        const targetNodeIndex = this.mesh.graph.snap(to);

        const openList: Node[] = [];
        const closedList: Node[] = [];

        openList.push(new Node(startNodeIndex));

        let currentNode = openList[0];
        let count = 1;

        while (currentNode !== null) {
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].fCost < currentNode.fCost || 
                    (openList[i].fCost === currentNode.fCost && openList[i].hCost < currentNode.hCost)) {
                    currentNode = openList[i];
                }
            }

            const index = openList.indexOf(currentNode);
            openList.splice(index, 1);
            closedList.push(currentNode);

            //use vec2 to get node index
            //this.mesh.graph.snap(vec2);

            //use index to get edges adjacent (not collidable)
            //let e = this.mesh.graph.getEdges()
            //while (e) { ... e.next}
            //don't return here
            if (currentNode.index === targetNodeIndex) {
                break;
            }

            const neighbors = this.mesh.graph.getEdges(currentNode.index);

            let edge = neighbors.next;

            while(edge) {
                const neighborIndex = edge.y;
                const neighborNode = new Node(neighborIndex);

                if (!this.nodeInArray(neighborNode, closedList)) {
                    const newGCostToNeighbor = currentNode.gCost + edge.weight;
                    const newHCostToNeighbor = this.mesh.graph.getNodePosition(neighborIndex).distanceSqTo(to);

                    if (newGCostToNeighbor < neighborNode.gCost || !this.nodeInArray(neighborNode, openList)) {
                        neighborNode.gCost = newGCostToNeighbor;
                        neighborNode.hCost = newHCostToNeighbor;
                        neighborNode.parent = currentNode;

                        if (!this.nodeInArray(neighborNode, openList)) {
                            openList.push(neighborNode);
                        }
                    }
                }

                edge = neighbors.next;
            }

            //get the next node
            currentNode = openList[count++];
        }

        //break out of loop create path
        //get the end node with parent
        //loop through while(node.parent != null) { push to stack; node = node.parent}
        // If the while loop breaks, check if we reached the target node
        if (closedList[closedList.length - 1].index === targetNodeIndex) {
            return this.constructPath(closedList[closedList.length - 1], startNodeIndex, path);
        } else {
            return path; // No path found
        }
    }

    private constructPath(currentNode: Node, startNodeIndex: number, path: NavigationPath): NavigationPath {
        const nodeStack = new Stack<Vec2>();
        let currentNodeRef = currentNode;
        while (currentNodeRef.index !== startNodeIndex) {
            nodeStack.push(this.mesh.graph.getNodePosition(currentNodeRef.index));
            currentNodeRef = currentNodeRef.parent;
        }
        while (!nodeStack.isEmpty()) {
            path.addWaypoint(nodeStack.pop());
        }
        return path;
    }

    private nodeInArray(node: Node, nodeList: Node[]): boolean {
        for (const n of nodeList) {
            if (n.index === node.index) {
                return true;
            }
        }
        return false;
    }
    
}