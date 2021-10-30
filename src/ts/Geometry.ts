export const identity: Float32Array = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

export function fromXYWH(x1: number, y1: number, width: number, height: number) {
	const x2 = x1 + width;
	const y2 = y1 + height;

	return new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]);
}
