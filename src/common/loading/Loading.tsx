
export function Loading() {
	return (
		<div style={{ margin: 'auto' }} className="loading">
			<div className="loading-spinner big"></div>
			<div className="loading-text"></div>
		</div>
	);
}

export function Error({ children }: { children: string }) {
	return (
		<div style={{ margin: 'auto' }} className="loading">
			<div className="loading-text">{children}</div>
		</div>
	)
}
