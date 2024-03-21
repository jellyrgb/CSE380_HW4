import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

// TODO Construct a NavigationPath object using A*

class Node {
    position: Vec2;
    gCost: number;
    hCost: number;
    parent: Node | null;

    constructor(position: Vec2) {
        this.position = position; 
        this.gCost = 0;
        this.hCost = 0;
        this.parent = null;
    }

    get fCost(): number {
        return this.gCost + this.hCost;
    }

    //get for parent
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

        console.log("Building path!");
        const path = new NavigationPath(new Stack());
        const startNode = new Node(from);
        const targetNode = new Node(to);

        const openList: Node[] = [];
        const closedList: Node[] = [];

        openList.push(startNode);

        while (openList.length > 0) {
            console.log("While loop");
            let currentNode = openList[0];
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
            if (currentNode.position.equals(targetNode.position)) {
                return this.constructPath(currentNode, startNode, path);
            }

            const neighbors = this.getNeighbors(currentNode.position);
            for (const neighborPos of neighbors) {
                const neighborNode = new Node(neighborPos);
                if (!this.nodeInArray(neighborNode, closedList)) {
                    const newMovementCostToNeighbor = currentNode.gCost + currentNode.position.distanceSqTo(neighborPos);

                    //here should be check to see if in openList, if in
                    // check if cost is lower then update if is
                    //if not in, then just add new
                    //check to see if the neighbor is equal to the end node
                    //if end node then you break and add to close list
                    if (newMovementCostToNeighbor < neighborNode.gCost || !this.nodeInArray(neighborNode, openList)) {
                        neighborNode.gCost = newMovementCostToNeighbor;
                        neighborNode.hCost = neighborPos.distanceSqTo(targetNode.position);
                        neighborNode.parent = currentNode;

                        if (!this.nodeInArray(neighborNode, openList)) {
                            openList.push(neighborNode);
                        }
                    }
                }
            }
        }
        //break out of loop create path
        //get the end node with parent
        //loop through while(node.parent != null) { push to stack; node = node.parent}
        return path;
    }

    private getNeighbors(position: Vec2): Vec2[] {
        const neighbors: Vec2[] = [];
        neighbors.push(new Vec2(position.x + 8, position.y));
        neighbors.push(new Vec2(position.x - 8, position.y));
        neighbors.push(new Vec2(position.x, position.y + 8));
        neighbors.push(new Vec2(position.x, position.y - 8));
        return neighbors;
    }

    private constructPath(currentNode: Node, startNode: Node, path: NavigationPath): NavigationPath {
        const nodeStack = new Stack<Vec2>();
        let currentNodeRef = currentNode;
        while (currentNodeRef !== startNode) {
            nodeStack.push(currentNodeRef.position);
            currentNodeRef = currentNodeRef.parent;
        }
        while (!nodeStack.isEmpty()) {
            path.addWaypoint(nodeStack.pop());
        }
        return path;
    }

    private nodeInArray(node: Node, nodeList: Node[]): boolean {
        for (const n of nodeList) {
            if (n.position.equals(node.position)) {
                return true;
            }
        }
        return false;
    }
    
}