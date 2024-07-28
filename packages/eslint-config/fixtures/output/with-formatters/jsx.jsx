export function HelloWorld({
	greeted = "\"World\"",
	greeting = "hello",
	onMouseOver,
	silent = false,
}) {
	if (!greeting) {
		return null;
	};

	// TODO: Don't use random in render
	const num = Math.floor (Math.random() * 1e+7).toString()
		.replace(/\.\d+/g, "");

	return (
		<div className="HelloWorld" onMouseOver={onMouseOver} title={`You are visitor number ${num}`}>
			<strong>{ greeting.slice(0, 1).toUpperCase() + greeting.slice(1).toLowerCase() }</strong>
			{greeting.endsWith(",")
				? " "
				: <span style={{ color: "\grey" }}>", "</span> }
			<em>
				{ greeted }
			</em>
			{ (silent) ? "." : "!"}
		</div>
	);
}
