import { Injectable } from '@angular/core';
import { Grid } from '../models/grid.model';
import { PriorityQueue } from '../data-structures/priority-queue.model';
import { GridService } from './grid.service';

@Injectable({
  providedIn: 'root'
})
export class WeightedAlgorithmsService {

  constructor(
    private gridService: GridService
  ) { }

  /**
   * Find the shortest path between start and the target nodes
   * @param grid Grid details
   */
  dijikstra(grid: Grid) {
    grid.nodesToAnimate = [];
    if (!grid.start || !grid.target || grid.start === grid.target) {
      return false;
    }
    let found = false;
    const forbiddenNodes = ['wall'];
    grid.nodes[grid.start].distance = 0;
    const PQ = new PriorityQueue();
    PQ.insert(grid.start, 0);
    while (!PQ.isEmpty()) {
      const currentNodeId = PQ.extractMinimum();
      if (!grid.nodes[currentNodeId].visited) {
        grid.nodes[currentNodeId].visited = true;
        grid.nodesToAnimate.push(grid.nodes[currentNodeId]);
      }
      if (currentNodeId === grid.target) {
        found = true;
        break;
      }
      const neighbors = this.gridService.getNeighbors(currentNodeId, forbiddenNodes, 0, true);
      neighbors.forEach(neighbor => {
        const newDistance = grid.nodes[currentNodeId].distance + 1; // assuming weight = 1
        if (grid.nodes[neighbor].distance > newDistance) {
          if (grid.nodes[neighbor].distance === Infinity) {
            PQ.insert(neighbor, newDistance);
          } else {
            PQ.decreaseKey(neighbor, newDistance);
          }
          grid.nodes[neighbor].distance = newDistance;
          grid.nodes[neighbor].previousNode = currentNodeId;
        }
      });
    }
    while (!PQ.isEmpty()) {
      const currentNodeId = PQ.extractMinimum();
      grid.nodes[currentNodeId].distance = Infinity;
      grid.nodes[currentNodeId].previousNode = null;
    }
    return found;
  }

  /**
   * Find the shortest path between start and the target nodes
   * @param grid Grid details
   */
  aStarSearch(grid: Grid) {
    grid.nodesToAnimate = [];
    if (!grid.start || !grid.target || grid.start === grid.target) {
      return false;
    }
    const startNode = grid.nodes[grid.start];
    const forbiddenNodes = ['wall'];
    let found = false;
    startNode.distance = 0;
    startNode.globalDistance = this.heuristic(grid.start, grid.target);
    let deque = [grid.nodes[grid.start]];
    while (deque.length > 0) {
      deque = deque.sort((a, b) => a.globalDistance - b.globalDistance );
      const currentNode = deque.shift();
      currentNode.visited = true;
      grid.nodesToAnimate.push(currentNode);
      if (currentNode.id === grid.target) {
        found = true;
        break;
      }
      const neighbors = this.gridService.getNeighbors(currentNode.id, forbiddenNodes, 0, true);
      neighbors.forEach(neighbor => {
        const neighborNode = grid.nodes[neighbor];
        if (!deque.includes(grid.nodes[neighbor])) {
          deque.push(neighborNode);
        }
        const possibleDistance = currentNode.distance + 1;
        if (possibleDistance < neighborNode.distance) {
          neighborNode.previousNode = currentNode.id;
          neighborNode.distance = possibleDistance;
          neighborNode.globalDistance = neighborNode.distance + this.heuristic(neighborNode.id, grid.target);
        }
      });
    }
    while (deque.length > 0) {
      const currentNode = deque.shift();
      currentNode.distance = Infinity;
      currentNode.globalDistance = Infinity;
      currentNode.previousNode = null;
    }
    return found;
  }

  /**
   * Distence between the source node and target node
   * @param source current node that is bwing processed
   * @param target target node to be reached
   */
  heuristic(source: string, target: string) {
    let coordinates = this.gridService.getCoordinates(source);
    const x1 = coordinates.x;
    const y1 = coordinates.y;
    coordinates = this.gridService.getCoordinates(target);
    const x2 = coordinates.x;
    const y2 = coordinates.y;
    return this.manhattanDistance(x1, y1, x2, y2);
  }

  /**
   * Thw sum of horizonatal and vertical distances between points on a grid
   * @param x1 x coordinate of the source node
   * @param y1 y coordinate of the source node
   * @param x2 x coordintae of the target node
   * @param y2 y coordinate of the target node
   */
  manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}
