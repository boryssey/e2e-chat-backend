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
