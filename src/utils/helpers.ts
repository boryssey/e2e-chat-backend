/* eslint-disable @typescript-eslint/ban-types */
export function getEnv(): 'test' | 'development' | 'production' {
	switch (process.env.NODE_ENV) {
		case 'test':
		case 'development':
		case 'production': {
			return process.env.NODE_ENV;
		}

		default: {
			return 'development';
		}
	}
}

export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
	list.reduce<Record<K, T[]>>((previous, currentItem) => {
		const group = getKey(currentItem);
		previous[group] ||= [];
		previous[group].push(currentItem);
		return previous;
	}, {} as Record<K, T[]>); // eslint-disable-line @typescript-eslint/prefer-reduce-type-parameter

export const bufferToArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  // Get just the ArrayBuffer portion by creating a new one and copying the data
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(new Uint8Array(buffer));
  return arrayBuffer;
};

export const sleep = async (ms: number) => new Promise(resolve => {
	setTimeout(() => {
		resolve(true);
	}, ms);
});
